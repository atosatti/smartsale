import { Router } from 'express';
import { searchProducts, getProductDetails, compareProducts, getPriceHistory } from '../controllers/shopeeController.js';
import { authMiddleware, subscriptionActiveMiddleware } from '../middleware/auth.js';
import shopeeService from '../services/shopeeService.js';
const router = Router();
router.post('/search', authMiddleware, subscriptionActiveMiddleware, searchProducts);
router.get('/product/:productId', authMiddleware, getProductDetails);
router.post('/compare', authMiddleware, compareProducts);
router.get('/price-history/:productId', authMiddleware, getPriceHistory);
// Debug/test endpoint
router.get('/test', async (req, res) => {
    try {
        const result = await shopeeService.testAPIConnection();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, message: error?.message || 'Test failed' });
    }
});
export default router;
//# sourceMappingURL=shopeeRoutes.js.map