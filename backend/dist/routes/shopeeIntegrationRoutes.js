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
router.get('/status', authMiddleware, shopeeAuthController.getShopeeStatus);
// Listar lojas autorizadas (admin)
// GET /api/integrations/shopee/authorized-shops
router.get('/authorized-shops', authMiddleware, shopeeAuthController.getAuthorizedShops);
// Desconectar uma loja
// POST /api/integrations/shopee/disconnect
router.post('/disconnect', authMiddleware, shopeeAuthController.disconnectShopee);
// Revogar acesso de uma loja (admin)
// DELETE /api/integrations/shopee/revoke/:shopId
router.delete('/revoke/:shopId', authMiddleware, shopeeAuthController.revokeShopeeAccess);
// Forçar refresh de token
// POST /api/integrations/shopee/refresh-token
router.post('/refresh-token', authMiddleware, shopeeAuthController.forceTokenRefresh);
export default router;
//# sourceMappingURL=shopeeIntegrationRoutes.js.map