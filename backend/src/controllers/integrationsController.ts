import { Response } from 'express';
import pool from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import oauthTokenService from '../services/oauthTokenService.js';

/**
 * GET /admin/integrations/status
 * Obter status de todas as integrações
 */
export const getIntegrationsStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [tokens] = await pool.query(
      `SELECT id, provider, provider_user_id, is_active, expires_at, last_refreshed_at, created_at, created_by
       FROM oauth_tokens
       WHERE is_active = TRUE OR provider IN ('mercado-livre', 'google', 'facebook')`
    );

    const integrations = (tokens as any[]).map(token => ({
      provider: token.provider,
      connected: token.is_active,
      providerUserId: token.provider_user_id,
      expiresAt: token.expires_at,
      lastRefreshed: token.last_refreshed_at,
      connectedSince: token.created_at,
      isExpired: token.expires_at ? new Date(token.expires_at) < new Date() : false
    }));

    res.status(200).json({ integrations });
  } catch (error) {
    console.error('Error fetching integrations status:', error);
    res.status(500).json({
      error: 'Failed to fetch integrations status',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * GET /admin/integrations/mercado-livre
 * Obter status específico do Mercado Livre
 */
export const getMercadoLivreStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const token = await oauthTokenService.getActiveToken('mercado-livre');

    const isExpired = token ? oauthTokenService.isTokenExpired(token) : false;

    res.status(200).json({
      connected: !!token && token.is_active,
      isExpired,
      expiresAt: token?.expires_at,
      lastRefreshed: token?.last_refreshed_at,
      providerUserId: token?.provider_user_id,
      connectedSince: token?.created_at,
      hasRefreshToken: !!token?.refresh_token,
      message: token ? 'Conectada' : 'Não conectada'
    });
  } catch (error) {
    console.error('Error fetching Mercado Livre status:', error);
    res.status(500).json({
      error: 'Failed to fetch integration status',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * POST /admin/integrations/mercado-livre/save-token
 * Salvar token após OAuth
 */
export const saveMercadoLivreToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { ml_token, ml_user_id, ml_refresh_token, ml_expires_in } = req.body;

    if (!ml_token || !ml_user_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'ml_token e ml_user_id são obrigatórios'
      });
    }// Salvar token centralizado
    await oauthTokenService.saveToken(
      'mercado-livre',
      ml_token,
      ml_refresh_token || null,
      ml_expires_in || undefined,
      ml_user_id,
      'offline_access',
      req.user.id,
      req.ip,
      req.get('user-agent')
    );res.status(200).json({
      success: true,
      message: 'Mercado Livre conectado com sucesso',
      provider: 'mercado-livre'
    });
  } catch (error) {
    console.error('Error saving Mercado Livre token:', error);
    res.status(500).json({
      error: 'Failed to save token',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * POST /admin/integrations/mercado-livre/refresh-token
 * Renovar token do Mercado Livre
 */
export const refreshMercadoLivreToken = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = await oauthTokenService.getActiveToken('mercado-livre');

    if (!token) {
      return res.status(400).json({
        error: 'No token available',
        message: 'Token do Mercado Livre não configurado. Conecte sua conta primeiro.',
        action: 'reconnect'
      });
    }// Se tem refresh_token, usar o fluxo de refresh
    if (token.refresh_token) {const response = await fetch('https://api.mercadolibre.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.MERCADO_LIVRE_APP_ID || '',
          client_secret: process.env.MERCADO_LIVRE_SECRET_KEY || '',
          refresh_token: token.refresh_token
        })
      });

      if (!response.ok) {
        const error = await response.json() as any;
        console.error('[IntegrationController] Erro ao refresh token:', error);
        return res.status(400).json({
          error: 'Failed to refresh token',
          message: error.message || 'Falha ao renovar token. Tente reconectar.',
          action: 'reconnect'
        });
      }

      const data = await response.json() as any;

      // Atualizar token
      await oauthTokenService.refreshToken(
        token.id,
        data.access_token,
        data.refresh_token,
        data.expires_in,
        req.user.id,
        req.ip,
        req.get('user-agent')
      );return res.status(200).json({
        success: true,
        message: 'Token renovado com sucesso',
        expiresAt: new Date(Date.now() + (data.expires_in * 1000))
      });
    } else {
      // Sem refresh_token, informar que precisa reconectar
      return res.status(400).json({
        error: 'Refresh token not available',
        message: 'Sua conta não recebeu permissão de refresh. Por favor, desconecte e conecte novamente com permissões offline.',
        details: 'Se o problema persistir, você pode precisar usar a conta de teste do Mercado Livre.',
        action: 'reconnect'
      });
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * GET /admin/integrations/mercado-livre/validate
 * Validar conexão com Mercado Livre e obter dados do usuário
 */
export const validateMercadoLivreConnection = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const token = await oauthTokenService.getActiveToken('mercado-livre');

    if (!token || !token.access_token) {
      return res.status(400).json({
        error: 'No token available',
        message: 'Token do Mercado Livre não configurado',
        valid: false
      });
    }// Fazer requisição para obter dados do usuário
    const response = await fetch('https://api.mercadolibre.com/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json() as any;
      console.error('[IntegrationController] Erro ao validar token:', error);
      
      // Se 401, token expirou
      if (response.status === 401) {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Token expirado. Reconecte sua conta.',
          valid: false,
          action: 'reconnect'
        });
      }

      return res.status(400).json({
        error: 'Validation failed',
        message: error.message || 'Erro ao validar token',
        valid: false
      });
    }

    const userData = await response.json() as any;res.status(200).json({
      valid: true,
      message: 'Token válido e funcional',
      user: {
        id: userData.id,
        nickname: userData.nickname,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        countryId: userData.country_id,
        siteId: userData.site_id,
        userType: userData.user_type,
        tags: userData.tags,
        permalink: userData.permalink,
        sellerReputation: userData.seller_reputation,
        status: userData.status
      },
      token: {
        expiresAt: token.expires_at,
        hasRefreshToken: !!token.refresh_token
      }
    });
  } catch (error) {
    console.error('Error validating connection:', error);
    res.status(500).json({
      error: 'Validation error',
      details: error instanceof Error ? error.message : String(error),
      valid: false
    });
  }
};

/**
 * POST /admin/integrations/mercado-livre/disconnect
 * Desconectar Mercado Livre
 */
export const disconnectMercadoLivre = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }await oauthTokenService.disconnectToken(
      'mercado-livre',
      req.user.id,
      req.ip,
      req.get('user-agent')
    );res.status(200).json({
      success: true,
      message: 'Mercado Livre desconectado com sucesso'
    });
  } catch (error) {
    console.error('Error disconnecting Mercado Livre:', error);
    res.status(500).json({
      error: 'Failed to disconnect',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
