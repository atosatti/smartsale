import { Request, Response } from 'express';
import shopeeOAuthService from '../services/shopeeOAuthService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

/**
 * GET /api/oauth/shopee/authorize
 * Inicia o fluxo OAuth - redireciona para Shopee
 */
export const startShopeeAuth = (req: Request, res: Response) => {
  try {
    const authUrl = shopeeOAuthService.generateAuthorizationUrl();
    console.log('[ShopeeAuthController] Redirecting to Shopee OAuth');
    res.redirect(authUrl);
  } catch (error) {
    console.error('[ShopeeAuthController] Error starting auth:', error);
    res.status(500).json({
      error: 'Failed to initiate OAuth',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/oauth/shopee/callback
 * Callback do OAuth - Shopee redireciona com código
 * Query params: code=XXXX&shop_id=YYYY
 */
export const handleShopeeCallback = async (req: Request, res: Response) => {
  try {
    const { code, shop_id } = req.query;

    if (!code || !shop_id) {
      return res.status(400).json({
        error: 'Missing code or shop_id',
        message: 'OAuth callback missing required parameters',
      });
    }

    console.log(`[ShopeeAuthController] Received callback - Shop: ${shop_id}, Code: ${String(code).substring(0, 20)}...`);

    // Trocar código por token
    const tokenResponse = await shopeeOAuthService.exchangeCodeForToken(
      String(code),
      String(shop_id)
    );

    // Salvar token no banco (usuário será admin por enquanto)
    // Em um fluxo completo, a loja teria seu próprio usuário
    await shopeeOAuthService.saveToken(
      tokenResponse.shop_id,
      1, // Admin user ID (deverá ser configurado dinamicamente em produção)
      tokenResponse.access_token,
      tokenResponse.refresh_token,
      tokenResponse.expire_in
    );

    console.log(`[ShopeeAuthController] Successfully authorized shop ${shop_id}`);

    // Redirecionar para admin panel com mensagem de sucesso
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/integrations?shopee=connected&shop_id=${shop_id}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('[ShopeeAuthController] Error handling callback:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/integrations/shopee/disconnect
 * Desconectar uma loja autorizada
 */
export const disconnectShopee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({
        error: 'Missing shopId',
        message: 'shopId é obrigatório',
      });
    }

    const success = await shopeeOAuthService.disconnectShop(shopId);

    if (!success) {
      return res.status(404).json({
        error: 'Shop not found',
        message: `Nenhuma autorização encontrada para a loja ${shopId}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Loja ${shopId} desconectada com sucesso`,
    });
  } catch (error) {
    console.error('[ShopeeAuthController] Error disconnecting shop:', error);
    res.status(500).json({
      error: 'Failed to disconnect shop',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/integrations/shopee/status
 * Verificar status de conexão Shopee
 */
export const getShopeeStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const shops = await shopeeOAuthService.listAuthorizedShops(req.user?.id);

    res.status(200).json({
      connected: shops.length > 0,
      shops,
      totalAuthorized: shops.length,
      message: shops.length > 0 ? 'Conectada' : 'Não conectada',
    });
  } catch (error) {
    console.error('[ShopeeAuthController] Error getting status:', error);
    res.status(500).json({
      error: 'Failed to get Shopee status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/integrations/shopee/authorized-shops
 * Listar lojas autorizadas (para admin)
 */
export const getAuthorizedShops = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const shops = await shopeeOAuthService.listAuthorizedShops();

    res.status(200).json({
      success: true,
      shops,
      total: shops.length,
    });
  } catch (error) {
    console.error('[ShopeeAuthController] Error getting authorized shops:', error);
    res.status(500).json({
      error: 'Failed to get authorized shops',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/integrations/shopee/revoke/:shopId
 * Revogar acesso de uma loja específica (admin)
 */
export const revokeShopeeAccess = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return res.status(400).json({
        error: 'Missing shopId',
      });
    }

    const success = await shopeeOAuthService.disconnectShop(shopId);

    if (!success) {
      return res.status(404).json({
        error: 'Shop not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Acesso revogado para loja ${shopId}`,
    });
  } catch (error) {
    console.error('[ShopeeAuthController] Error revoking access:', error);
    res.status(500).json({
      error: 'Failed to revoke access',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/integrations/shopee/refresh-token
 * Forçar refresh de token para uma loja
 */
export const forceTokenRefresh = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return res.status(400).json({
        error: 'Missing shopId',
      });
    }

    const newToken = await shopeeOAuthService.validateAndRefreshToken(shopId);

    res.status(200).json({
      success: true,
      message: 'Token renovado com sucesso',
      token: newToken,
    });
  } catch (error) {
    console.error('[ShopeeAuthController] Error refreshing token:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
