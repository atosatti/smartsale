import { Request, Response } from 'express';
import axios from 'axios';
import oauthService from '../services/oauthService.js';
import oauthTokenService from '../services/oauthTokenService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import db from '../config/database.js';
import pool from '../config/database.js';

/**
 * Iniciar processo de autenticação com Mercado Livre
 * GET /api/oauth/mercado-livre/authorize
 */
export const startMercadoLivreAuth = (req: Request, res: Response) => {
  try {
    const authUrl = oauthService.getAuthorizationUrl();res.redirect(authUrl);
  } catch (error: any) {
    console.error('[OAuth Controller] Erro ao iniciar autenticação:', error.message);
    res.status(500).json({ error: 'Falha ao iniciar autenticação' });
  }
};

/**
 * Callback do Mercado Livre
 * GET /api/oauth/mercado-livre/callback?code=XXX&state=XXX
 */
export const handleMercadoLivreCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Código de autorização não fornecido' });
    }// Trocar código por token (passar state para PKCE)
    const tokenData = await oauthService.exchangeCodeForToken(code as string, state as string);// Obter informações do usuário
    const userInfo = await oauthService.getUserInfo(tokenData.access_token);// Redirecionar de volta para o frontend com o token, refresh_token e expires_in
    // Usar FRONTEND_URL se disponível (para ngrok), senão usar localhost
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = new URL(`${frontendUrl}/admin/integrations`);
    redirectUrl.searchParams.append('ml_token', tokenData.access_token);
    redirectUrl.searchParams.append('ml_user', userInfo.nickname);
    redirectUrl.searchParams.append('ml_refresh_token', tokenData.refresh_token || '');
    redirectUrl.searchParams.append('ml_expires_in', String(tokenData.expires_in || 21600));res.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error('[OAuth Controller] Erro no callback:', error.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/admin/integrations?error=oauth_failed`);
  }
};

/**
 * Salvar token OAuth do Mercado Livre
 * POST /api/oauth/mercado-livre/save-token
 * Body: { ml_token, ml_user_id, refresh_token, expires_in }
 */
export const saveMercadoLivreToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    // Aceitar tanto ml_* quanto versão sem ml_
    const ml_token = req.body.ml_token;
    const ml_user_id = req.body.ml_user_id;
    const refresh_token = req.body.ml_refresh_token || req.body.refresh_token;
    const expires_in = req.body.ml_expires_in || req.body.expires_in;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (!ml_token || !ml_user_id) {
      return res.status(400).json({ error: 'Token e user_id são obrigatórios' });
    }// Calcular data de expiração (garantir que é um número válido)
    let expiresIn_val = 21600; // 6 horas por padrão
    if (expires_in && typeof expires_in === 'number' && expires_in > 0) {
      expiresIn_val = expires_in;
    }
    
    const expiresAt = new Date(Date.now() + expiresIn_val * 1000);// Salvar token no banco de dados
    await db.query(
      `UPDATE users SET 
        mercado_livre_token = ?, 
        mercado_livre_user_id = ?,
        mercado_livre_refresh_token = ?,
        mercado_livre_token_expires_at = ?
       WHERE id = ?`,
      [ml_token, ml_user_id, refresh_token || null, expiresAt, userId]
    );res.status(200).json({ 
      success: true, 
      message: 'Token do Mercado Livre salvo com sucesso',
      connected: true,
      expiresAt: expiresAt
    });
  } catch (error: any) {
    console.error('[OAuth Controller] Erro ao salvar token:', error.message);
    res.status(500).json({ error: 'Falha ao salvar token' });
  }
};

/**
 * Desconectar do Mercado Livre
 * POST /api/oauth/mercado-livre/disconnect
 */
export const disconnectMercadoLivre = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Remover token do banco de dados
    await db.query('UPDATE users SET mercado_livre_token = NULL, mercado_livre_user_id = NULL WHERE id = ?', [userId]);

    res.status(200).json({ success: true, message: 'Desconectado do Mercado Livre' });
  } catch (error: any) {
    console.error('[OAuth Controller] Erro ao desconectar:', error.message);
    res.status(500).json({ error: 'Falha ao desconectar' });
  }
};

/**
 * Obter status da autenticação
 * GET /api/oauth/mercado-livre/status
 */
export const getMercadoLivreStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const [rows]: any = await db.query(
      'SELECT mercado_livre_token, mercado_livre_user_id FROM users WHERE id = ?',
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = rows[0];
    const isConnected = !!user.mercado_livre_token;

    res.status(200).json({
      success: true,
      connected: isConnected,
      mlUserId: user.mercado_livre_user_id,
    });
  } catch (error: any) {
    console.error('[OAuth Controller] Erro ao obter status:', error.message);
    res.status(500).json({ error: 'Falha ao obter status' });
  }
};

export const createTestUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Buscar token do Mercado Livre da tabela oauth_tokens (CENTRALIZADO)
    const token = await oauthTokenService.getActiveToken('mercado-livre');

    if (!token || !token.access_token) {
      res.status(401).json({
        error: 'Token de acesso inválido',
        message: 'Nenhum token do Mercado Livre configurado. Por favor, conecte sua conta primeiro.',
      });
      return;
    }

    let mlToken = token.access_token;
    const refreshToken = token.refresh_token;

    // Verificar se token está expirado
    if (oauthTokenService.isTokenExpired(token)) {if (!refreshToken) {res.status(401).json({
          error: 'Token expirado',
          message: 'Seu token do Mercado Livre expirou e não pode ser renovado automaticamente. Por favor, reconecte sua conta.',
        });
        return;
      }

      try {
        const newTokenData = await oauthService.refreshAccessToken(refreshToken);
        mlToken = newTokenData.access_token;} catch (refreshError: any) {
        console.error('[OAuth Controller] ❌ Erro ao renovar token:', refreshError.message);
        res.status(401).json({
          error: 'Token expirado',
          message: 'Seu token do Mercado Livre expirou e não pôde ser renovado. Por favor, reconecte sua conta.',
        });
        return;
      }
    }try {
      const testUser = await oauthService.createTestUser(mlToken, 'MLB');// Salvar usuário de teste centralizado na tabela oauth_tokens
      await pool.query(
        `UPDATE oauth_tokens SET 
          test_user_id = ?, 
          test_nickname = ?,
          test_password = ?
        WHERE provider = 'mercado-livre' AND is_active = TRUE`,
        [testUser.id, testUser.nickname, testUser.password]
      );res.status(200).json({
        success: true,
        message: '⚠️ IMPORTANTE: Salve essas credenciais agora. A senha não pode ser recuperada!',
        testUser: {
          id: testUser.id,
          nickname: testUser.nickname,
          password: testUser.password,
          site_status: testUser.site_status,
        },
      });
    } catch (apiError: any) {
      console.error('[OAuth Controller] ❌ Erro ao chamar API do ML:', apiError.message);
      console.error('[OAuth Controller] Status:', apiError.response?.status);
      console.error('[OAuth Controller] Data:', apiError.response?.data);
      
      // Verificar se é erro de JSON (HTML response)
      if (apiError.response?.status === 401 || apiError.message.includes('invalid access token')) {
        res.status(401).json({
          error: 'Token inválido',
          message: 'O token do Mercado Livre é inválido ou expirou. Por favor, reconecte sua conta.',
        });
      } else {
        res.status(500).json({
          error: 'Falha ao criar usuário de teste',
          message: apiError.response?.data?.message || apiError.message,
        });
      }
    }
  } catch (error: any) {
    console.error('[OAuth Controller] ❌ Erro ao criar usuário de teste:', error.message);
    console.error('[OAuth Controller] Stack:', error.stack);
    res.status(500).json({
      error: 'Falha ao criar usuário de teste',
      message: error.message,
    });
  }
};

/**
 * Autenticar e salvar token de um usuário de teste (CENTRALIZADO)
 * POST /api/oauth/mercado-livre/authenticate-test-user
 */
export const authenticateTestUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nickname, password } = req.body;

    if (!nickname || !password) {
      res.status(400).json({ error: 'nickname e password são obrigatórios' });
      return;
    }// Salvar credenciais do usuário de teste centralizadamente em oauth_tokens
    try {
      await pool.query(
        `UPDATE oauth_tokens 
         SET test_nickname = ?, test_password = ? 
         WHERE provider = 'mercado-livre' AND is_active = TRUE`,
        [nickname, password]
      );res.status(200).json({
        success: true,
        message: '✅ Usuário de teste configurado! As credenciais serão usadas nas próximas buscas por todos os usuários.',
        testNickname: nickname,
      });
    } catch (error: any) {
      console.error('[OAuth Controller] ❌ Erro ao salvar credenciais:', error.message);
      throw new Error(`Falha ao salvar credenciais: ${error.message}`);
    }
  } catch (error: any) {
    console.error('[OAuth Controller] ❌ Erro:', error.message);
    res.status(500).json({
      error: 'Falha ao autenticar usuário de teste',
      message: error.message,
    });
  }
};
export const getTestUserInfo = async (req: any, res: any) => {
  try {let tokens: any[];
    try {
      const [result]: any = await pool.query(
        'SELECT test_user_id, test_nickname, test_password FROM oauth_tokens WHERE provider = ? AND is_active = TRUE LIMIT 1',
        ['mercado-livre']
      );
      tokens = result || [];
    } catch (dbError: any) {
      console.error('[OAuth Controller] Erro DB:', dbError);
      return res.status(503).json({ 
        error: 'Erro ao conectar ao banco de dados',
        details: dbError.message,
        hasTestUser: false 
      });
    }

    if (!tokens || tokens.length === 0) {return res.status(200).json({ 
        hasTestUser: false,
        testUser: null
      });
    }

    const testUserId = tokens[0].test_user_id;
    const testNickname = tokens[0].test_nickname;
    const testPassword = tokens[0].test_password;

    if (!testUserId || !testNickname) {return res.status(200).json({ 
        hasTestUser: false,
        testUser: null
      });
    }return res.json({
      hasTestUser: true,
      testUser: {
        id: testUserId,
        nickname: testNickname,
        password: testPassword || null,
        site_status: 'active',
      },
    });
  } catch (error: any) {
    console.error('[OAuth Controller] Erro:', error);
    return res.status(500).json({
      error: 'Erro ao buscar informações de teste',
      details: error.message
    });
  }
};