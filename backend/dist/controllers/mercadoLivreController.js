import mercadoLivreService from '../services/mercadoLivreService.js';
export const searchProducts = async (req, res) => {
    try {
        const { query, limit = 20, offset = 0, sort } = req.body;
        const userId = req.user?.id;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        console.log(`[ML Controller] Search: user=${userId}, query="${query}", limit=${limit}`);
        const products = await mercadoLivreService.searchProducts({
            query,
            limit,
            offset,
            userId,
            sort: sort,
        });
        res.status(200).json({
            success: true,
            platform: 'mercado_livre',
            query,
            results: products,
            total: products.length,
        });
    }
    catch (error) {
        console.error('[ML Controller] Search error:', error.message);
        res.status(500).json({
            error: error.message || 'Failed to search Mercado Livre',
            platform: 'mercado_livre',
        });
    }
};
export const getProductDetails = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        console.log(`[ML Controller] GetDetails: productId=${productId}`);
        const details = await mercadoLivreService.getProductDetails(productId);
        res.status(200).json({
            success: true,
            platform: 'mercado_livre',
            details,
        });
    }
    catch (error) {
        console.error('[ML Controller] Get details error:', error.message);
        res.status(500).json({
            error: error.message || 'Failed to get product details',
            platform: 'mercado_livre',
        });
    }
};
export const compareProducts = async (req, res) => {
    try {
        const { productIds } = req.body;
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'Product IDs array is required' });
        }
        console.log(`[ML Controller] Compare: ${productIds.length} products`);
        const comparison = await mercadoLivreService.compareProducts(productIds);
        res.status(200).json({
            success: true,
            platform: 'mercado_livre',
            comparison,
        });
    }
    catch (error) {
        console.error('[ML Controller] Compare error:', error.message);
        res.status(500).json({
            error: error.message || 'Failed to compare products',
            platform: 'mercado_livre',
        });
    }
};
export const getPriceHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        console.log(`[ML Controller] PriceHistory: productId=${productId}`);
        const history = await mercadoLivreService.getPriceHistory(productId);
        res.status(200).json({
            success: true,
            platform: 'mercado_livre',
            history,
        });
    }
    catch (error) {
        console.error('[ML Controller] Price history error:', error.message);
        res.status(500).json({
            error: error.message || 'Failed to get price history',
            platform: 'mercado_livre',
        });
    }
};
//# sourceMappingURL=mercadoLivreController.js.map