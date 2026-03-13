import { Router } from 'express';
import { searchProducts, getProductDetails, compareProducts, getPriceHistory, testConnection } from '../controllers/shopeeController.js';
import { authMiddleware, subscriptionActiveMiddleware } from '../middleware/auth.js';
import shopeeService from '../services/shopeeService.js';

const router = Router();

router.post('/search', authMiddleware as any, subscriptionActiveMiddleware as any, searchProducts as any);
router.get('/product/:productId', authMiddleware as any, getProductDetails as any);
router.post('/compare', authMiddleware as any, compareProducts as any);
router.get('/price-history/:productId', authMiddleware as any, getPriceHistory as any);

// Debug/test endpoint
router.get('/test', async (req, res) => {
  try {
    const result = await shopeeService.testAPIConnection();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Test failed' });
  }
});

export default router;
