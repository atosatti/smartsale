import mercadoLivreService from '../services/mercadoLivreService.js';
export const searchProducts = async (req, res) => {
    try {
        const { query, limit = 20, offset = 0, sort } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const products = await mercadoLivreService.searchProducts({
            query,
            limit,
            offset,
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