import express from 'express';
import * as shopeeAuthController from '../controllers/shopeeAuthController.js';

const router = express.Router();

/**
 * Shopee OAuth Routes (Public)
 * Mounted at: /api/oauth/shopee
 */

// Iniciar fluxo OAuth (redireciona para Shopee)
// GET /api/oauth/shopee/authorize
router.get('/authorize', shopeeAuthController.startShopeeAuth);

// Callback do OAuth (Shopee redireciona aqui com código)
// GET /api/oauth/shopee/callback
router.get('/callback', shopeeAuthController.handleShopeeCallback);

export default router;
