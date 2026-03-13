import express from 'express';
import * as shopeeAuthController from '../controllers/shopeeAuthController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * Shopee Integration Management Routes (Authenticated)
 * Mounted at: /api/integrations/shopee
 */

// Verificar status de conexão
// GET /api/integrations/shopee/status
router.get('/status', authMiddleware as any, shopeeAuthController.getShopeeStatus as any);

// Listar lojas autorizadas (admin)
// GET /api/integrations/shopee/authorized-shops
router.get('/authorized-shops', authMiddleware as any, shopeeAuthController.getAuthorizedShops as any);

// Desconectar uma loja
// POST /api/integrations/shopee/disconnect
router.post('/disconnect', authMiddleware as any, shopeeAuthController.disconnectShopee as any);

// Revogar acesso de uma loja (admin)
// DELETE /api/integrations/shopee/revoke/:shopId
router.delete('/revoke/:shopId', authMiddleware as any, shopeeAuthController.revokeShopeeAccess as any);

// Forçar refresh de token
// POST /api/integrations/shopee/refresh-token
router.post('/refresh-token', authMiddleware as any, shopeeAuthController.forceTokenRefresh as any);

export default router;
