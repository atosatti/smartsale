import { Router } from 'express';
import {
  searchProducts,
  getProductDetails,
  compareProducts,
  getPriceHistory,
} from '../controllers/mercadoLivreController.js';
import { authMiddleware, subscriptionActiveMiddleware } from '../middleware/auth.js';
import mercadoLivreService from '../services/mercadoLivreService.js';

const router = Router();

// Search products - Verifica se assinatura está ativa
router.post('/search', authMiddleware as any, subscriptionActiveMiddleware as any, searchProducts as any);

// Get product details
router.get('/product/:productId', authMiddleware as any, getProductDetails as any);

// Compare products
router.post('/compare', authMiddleware as any, compareProducts as any);

// Get price history
router.get('/price-history/:productId', authMiddleware as any, getPriceHistory as any);

// Test API connection (DEBUG)
router.get('/test', async (req, res) => {
  try {
    const result = await mercadoLivreService.testAPIConnection();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Debug endpoint - Testa integração real sem mock
import db from '../config/database.js';
router.get('/debug/search', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { query = 'notebook', limit = 5 } = req.query;

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    console.log('\n=== ML DEBUG SEARCH ===');
    console.log(`User ID: ${userId}`);
    console.log(`Query: ${query}`);

    // 1. Buscar token no banco
    const [rows]: any = await db.query(
      'SELECT mercado_livre_token, mercado_livre_user_id FROM users WHERE id = ?',
      [userId]
    );

    const user = rows?.[0];
    const hasToken = !!user?.mercado_livre_token;

    console.log(`Has Token: ${hasToken}`);
    if (hasToken) {
      console.log(`Token (first 20 chars): ${user.mercado_livre_token.substring(0, 20)}...`);
      console.log(`ML User ID: ${user.mercado_livre_user_id}`);
    }

    // 2. Fazer busca SEM mock (force real API)
    console.log(`\nAttempting real API search...`);
    
    let results: any = [];
    let error: any = null;

    try {
      // Usar axios direto para evitar fall back com mock
      const axios = require('axios');
      const response = await axios.get('https://api.mercadolibre.com/sites/MLB/search', {
        params: {
          q: query,
          limit: limit,
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'SmartSale/1.0 (Debug Test)',
        }
      });

      results = response.data?.results || [];
      console.log(`✓ Real API Success: ${results.length} products found`);
    } catch (err: any) {
      error = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      };
      console.log(`✗ Real API Error: ${error.message}`);
    }

    res.json({
      user: { id: userId, hasToken, mlUserId: user?.mercado_livre_user_id },
      api: {
        tested: true,
        success: results.length > 0,
        resultsCount: results.length,
        error: error,
      },
      results: results.slice(0, 3).map((r: any) => ({
        id: r.id,
        title: r.title,
        price: r.price,
      })),
    });
  } catch (err: any) {
    console.error('[ML Debug Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para renovar token manualmente
router.post('/refresh-token', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    console.log(`\n[ML Refresh] Iniciando renovação manual para user ${userId}...`);

    // Chamar serviço para renovar (força renovação ao chamar getUserOAuthToken)
    const token = await mercadoLivreService.searchProducts({
      query: 'test',
      limit: 1,
      userId
    }).then(() => {
      // Apenas para triggrar o refresh
      return null;
    }).catch((err) => {
      console.error('[ML Refresh] Erro durante renovação:', err);
    });

    // Buscar status atualizado
    const [rows]: any = await db.query(
      'SELECT mercado_livre_token_expires_at FROM users WHERE id = ?',
      [userId]
    );

    const expiresAt = rows?.[0]?.mercado_livre_token_expires_at;

    res.json({
      success: true,
      message: 'Token renovation initiated',
      expires_at: expiresAt,
      next_renewal: new Date(new Date(expiresAt).getTime() - 5 * 60 * 1000).toISOString()
    });
  } catch (error: any) {
    console.error('[ML Refresh] Erro:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
