import { Request, Response } from 'express';
import pool from '../config/database.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { generate2FASecret, verify2FAToken } from '../utils/twoFA.js';
import { sendVerificationEmail } from '../utils/email.js';
import { sendWelcomeEmail } from '../utils/emailNotifications.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import googleOAuthService from '../services/googleOAuthService.js';
import validator from 'validator';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;// Validação
    if (!email || !password || !firstName || !lastName) {return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!validator.isEmail(email)) {return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters' });
    }const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

    if ((existingUser as any[]).length > 0) {return res.status(409).json({ error: 'Email already registered' });
    }const hashedPassword = await hashPassword(password);
    const verificationToken = generateToken(0, email);await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, is_verified, subscription_plan) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, false, 'free']
    );// Send verification email
    let isVerified = false;
    try {
      await sendVerificationEmail(email, verificationToken);} catch (emailError) {// In development, auto-verify if email failsawait pool.query('UPDATE users SET is_verified = ? WHERE email = ?', [true, email]);
      isVerified = true;
    }

    res.status(201).json({
      message: isVerified 
        ? 'User registered successfully! You can now login.' 
        : 'User registered successfully. Please check your email to verify.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error instanceof Error ? error.message : String(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;if (!email || !password) {return res.status(400).json({ error: 'Email and password required' });
    }const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = (users as any[])[0];

    if (!user) {return res.status(401).json({ error: 'Invalid credentials' });
    }const passwordMatch = await verifyPassword(password, user.password);

    if (!passwordMatch) {return res.status(401).json({ error: 'Invalid credentials' });
    }if (!user.is_verified) {return res.status(403).json({
        error: 'Please verify your email before logging in',
      });
    }if (user.two_fa_enabled) {return res.status(200).json({
        requiresTwoFA: true,
        tempToken: generateToken(user.id, user.email),
      });
    }const token = generateToken(user.id, user.email);

    // Update last_login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        plan: user.subscription_plan,
        role: user.role || 'user',
        twoFaEnabled: user.two_fa_enabled,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    console.error('[Auth] Error stack:', (error as any)?.stack);
    console.error('[Auth] Error message:', (error as any)?.message);
    res.status(500).json({ error: 'Login failed', message: (error as any)?.message });
  }
};

export const setup2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { secret, qrCode } = await generate2FASecret(req.user.email);

    res.status(200).json({
      secret,
      qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
};

export const confirm2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { secret, token } = req.body;

    if (!secret || !token) {
      return res
        .status(400)
        .json({ error: 'Secret and token required' });
    }

    const isValid = verify2FAToken(secret, token);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid 2FA token' });
    }

    await pool.query(
      'UPDATE users SET two_fa_enabled = true, two_fa_secret = ? WHERE id = ?',
      [secret, req.user.id]
    );

    res.status(200).json({ message: '2FA enabled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
};

export const verify2FA = async (req: Request, res: Response) => {
  try {
    const { token, twoFAToken } = req.body;

    if (!token || !twoFAToken) {
      return res
        .status(400)
        .json({ error: 'Token and 2FA token required' });
    }

    // Verify the temporary token and extract user info
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = (decoded as any).id;

    const [users] = await pool.query(
      'SELECT id, email, two_fa_secret FROM users WHERE id = ? AND two_fa_enabled = true',
      [userId]
    );
    const user = (users as any[])[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const isValid = verify2FAToken(user.two_fa_secret, twoFAToken);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid 2FA token' });
    }

    const authToken = generateToken(user.id, user.email);

    res.status(200).json({
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        plan: user.subscription_plan,
        role: user.role || 'user',
        twoFaEnabled: true,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '2FA verification failed' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { first_name, last_name } = req.body;
    const userId = req.user?.id;if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validação
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validar comprimento mínimo
    if (first_name.trim().length === 0 || last_name.trim().length === 0) {
      return res.status(400).json({ error: 'First and last names cannot be empty' });
    }// Atualizar dados do usuário
    const updateResult = await pool.query(
      'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
      [first_name.trim(), last_name.trim(), userId]
    );// Buscar dados atualizados
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, subscription_plan, two_fa_enabled FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        plan: user.subscription_plan,
        twoFaEnabled: user.two_fa_enabled,
      },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Buscar dados do usuário
    const [users] = await pool.query(
      'SELECT id, email, first_name, last_name, subscription_plan, two_fa_enabled, role FROM users WHERE id = ?',
      [userId]
    );

    const user = (users as any[])[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        plan: user.subscription_plan,
        role: user.role || 'user',
        twoFaEnabled: user.two_fa_enabled,
      },
    });
  } catch (error) {
    console.error('getCurrentUser error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const getProfileInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Buscar informações do usuário e plano
    const [users] = await pool.query(
      `SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.subscription_plan,
        u.subscription_status,
        u.subscription_start_date,
        u.subscription_end_date,
        u.is_trial,
        u.trial_end_date,
        u.payment_method_type,
        u.payment_method_last_4,
        u.two_fa_enabled,
        u.created_at,
        p.max_searches_per_day
      FROM users u
      LEFT JOIN plans p ON u.subscription_plan = p.name
      WHERE u.id = ?`,
      [userId]
    );

    const user = (users as any[])[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        plan: user.subscription_plan,
        role: user.role || 'user',
        twoFaEnabled: user.two_fa_enabled,
        createdAt: user.created_at,
      },
      subscription: {
        plan_name: user.subscription_plan,
        status: user.subscription_status,
        subscription_start_date: user.subscription_start_date,
        subscription_end_date: user.subscription_end_date,
        is_trial: user.is_trial,
        trial_end_date: user.trial_end_date,
        max_searches_per_day: user.max_searches_per_day || user.max_searches_per_day === 0 ? -1 : user.max_searches_per_day,
        payment_method_type: user.payment_method_type,
        payment_method_last_4: user.payment_method_last_4,
      },
    });
  } catch (error) {
    console.error('getProfileInfo error:', error);
    res.status(500).json({ error: 'Failed to get profile info' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    // Buscar usuário
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    const user = (users as any[])[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verificar senha atual
    const passwordMatch = await verifyPassword(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar no banco
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const get2FAStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [users] = await pool.query(
      'SELECT two_fa_enabled FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = (users as any[])[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      twoFAEnabled: user.two_fa_enabled || false,
    });
  } catch (error) {
    console.error('get2FAStatus error:', error);
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
};

export const disable2FA = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: '2FA token required' });
    }

    // Obter o secret do usuário
    const [users] = await pool.query(
      'SELECT two_fa_secret, two_fa_enabled FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = (users as any[])[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.two_fa_enabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    // Verificar se o token é válido
    const isValid = verify2FAToken(user.two_fa_secret, token);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid 2FA token' });
    }

    // Desabilitar 2FA
    await pool.query(
      'UPDATE users SET two_fa_enabled = false, two_fa_secret = NULL WHERE id = ?',
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('disable2FA error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
};

/**
 * Inicia autenticação com Google
 * GET /api/auth/google/authorize
 */
export const startGoogleAuth = (req: Request, res: Response) => {
  try {
    console.log('[Auth] Iniciando Google OAuth...');
    console.log('[Auth] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('[Auth] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('[Auth] GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'Not set');
    
    const state = Math.random().toString(36).substring(7);
    res.cookie('oauth_state', state, { httpOnly: true, maxAge: 600000 });
    
    const authUrl = googleOAuthService.getAuthorizationUrl(state);
    console.log('[Auth] ✅ URL de autorização gerada, redirecionando...');
    res.redirect(authUrl);
  } catch (error: any) {
    console.error('[Auth] ❌ Erro ao iniciar Google auth:', error.message);
    console.error('[Auth] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao iniciar autenticação Google', 
      details: error.message 
    });
  }
};

/**
 * Callback do Google - Login/Registro
 * GET /api/auth/google/callback?code=XXX&state=XXX
 */
export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    console.log('[Auth] Iniciando callback do Google...');

    // Trocar código por token
    const tokenData = await googleOAuthService.exchangeCodeForToken(code as string);
    console.log('[Auth] ✅ Token recebido');
    console.log('[Auth] Campos no tokenData:', Object.keys(tokenData).join(', '));

    // Obter informações do usuário usando id_token (preferido) ou access_token
    const googleUser = await googleOAuthService.getUserInfo(tokenData.access_token, tokenData.id_token);
    console.log('[Auth] ✅ Informações do usuário obtidas:', { email: googleUser.email, id: googleUser.id });
    // Verificar se usuário existe
    console.log('[Auth] Verificando se usuário existe...');
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE google_id = ? OR email = ?',
      [googleUser.id, googleUser.email]
    );

    let user = (existingUsers as any[])[0];
    let isNewUser = false;

    if (!user) {
      // Criar novo usuário
      console.log('[Auth] Usuário novo, criando...');
      isNewUser = true;

      await pool.query(
        `INSERT INTO users 
        (email, google_id, first_name, last_name, is_verified, is_active, subscription_plan, subscription_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          googleUser.email,
          googleUser.id,
          googleUser.firstName || 'User',
          googleUser.lastName || '',
          true, // Email automaticamente verificado
          true,
          'free',
          'active'
        ]
      );

      // Buscar o usuário recém-criado
      const [newUsers] = await pool.query(
        'SELECT * FROM users WHERE google_id = ?',
        [googleUser.id]
      );
      user = (newUsers as any[])[0];
      console.log('[Auth] ✅ Usuário novo criado:', { id: user.id, email: user.email });
    } else if (!user.google_id) {
      // Usuário existe mas sem Google ID, atualizar
      console.log('[Auth] Usuário existente, atualizando Google ID...');
      await pool.query(
        'UPDATE users SET google_id = ? WHERE id = ?',
        [googleUser.id, user.id]
      );
      user.google_id = googleUser.id;
    }

    if (!user.is_active) {
      console.log('[Auth] ❌ Usuário inativo');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=user_inactive`);
    }

    // Atualizar last_login
    console.log('[Auth] Atualizando last_login...');
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Gerar token
    console.log('[Auth] Gerando JWT token...');
    const token = generateToken(user.id, user.email);

    // Redirecionar para frontend com token
    console.log('[Auth] ✅ Autenticação completa, redirecionando...');
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/google/callback`);
    redirectUrl.searchParams.append('token', token);
    redirectUrl.searchParams.append('isNewUser', isNewUser ? 'true' : 'false');
    redirectUrl.searchParams.append('user', JSON.stringify({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role || 'user',
      plan: user.subscription_plan,
      twoFaEnabled: user.two_fa_enabled,
      picture: googleUser.picture || '', // Incluir foto do perfil Google
    }));

    res.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error('[Auth] ❌ Erro no Google callback:', error.message);
    console.error('[Auth] Stack:', error.stack);
    
    // Extrair mensagem de erro mais informativa
    const errorMsg = error.message || 'callback_failed';
    const encodedError = encodeURIComponent(errorMsg.substring(0, 100));
    
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error&details=${encodedError}`);
  }
};

