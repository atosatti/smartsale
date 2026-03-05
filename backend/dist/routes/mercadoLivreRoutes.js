import { Router } from 'express';
import { searchProducts, getProductDetails, compareProducts, getPriceHistory, } from '../controllers/mercadoLivreController.js';
import { authMiddleware, subscriptionActiveMiddleware } from '../middleware/auth.js';
import mercadoLivreService from '../services/mercadoLivreService.js';
const router = Router();
// Search products - Verifica se assinatura está ativa
router.post('/search', authMiddleware, subscriptionActiveMiddleware, searchProducts);
// Get product details
router.get('/product/:productId', authMiddleware, getProductDetails);
// Compare products
router.post('/compare', authMiddleware, compareProducts);
// Get price history
router.get('/price-history/:productId', authMiddleware, getPriceHistory);
// Test API connection (DEBUG)
router.get('/test', async (req, res) => {
    try {
        const result = await mercadoLivreService.testAPIConnection();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
export default router;
//# sourceMappingURL=mercadoLivreRoutes.js.map