import pool from '../config/database.js';
import mercadoLivreService from '../services/mercadoLivreService.js';
/**
 * Busca produtos no Mercado Livre
 * GET /api/products/search?query=...&limit=50&offset=0&sort=relevance
 * Supports both public and seller search with comprehensive filters
 */
export const searchProducts = async (req, res) => {
    try {
        const { query = '', limit = 50, offset = 0, sort = 'relevance', category, search_mode = 'public', seller_id, price_min, price_max, condition, shipping, status, orders, listing_type_id, buying_mode, shipping_mode, reputation_health_gauge, labels, 
        // ... outros filtros conforme necessário
        ...otherFilters } = req.query;
        const userId = req.user?.id;
        // Validações
        if (search_mode === 'public' && !query) {
            return res.status(400).json({ error: 'Query parameter é obrigatório para busca pública' });
        }
        if (search_mode === 'seller' && !seller_id) {
            return res.status(400).json({ error: 'seller_id é obrigatório para busca de vendedor' });
        } // Para busca de vendedor (seller items)
        if (search_mode === 'seller') {
            // Extrair todos os filtros de query params
            const sellerFilters = {
                status: status ? String(status) : undefined,
                orders: orders ? String(orders) : undefined,
                listing_type_id: listing_type_id ? String(listing_type_id) : undefined,
                buying_mode: buying_mode ? String(buying_mode) : undefined,
                shipping_mode: shipping_mode ? String(shipping_mode) : undefined,
                reputation_health_gauge: reputation_health_gauge ? String(reputation_health_gauge) : undefined,
                labels: labels ? (Array.isArray(labels) ? labels : String(labels).split(',')) : undefined,
                limit: parseInt(String(limit), 10),
                offset: parseInt(String(offset), 10),
                ...Object.keys(otherFilters).reduce((acc, key) => {
                    if (otherFilters[key] !== undefined)
                        acc[key] = otherFilters[key];
                    return acc;
                }, {}),
            };
            const products = await mercadoLivreService.searchSellerItems({
                sellerId: String(seller_id),
                ...sellerFilters,
                userId: userId,
            });
            return res.status(200).json({
                success: true,
                count: products.length,
                data: products,
            });
        }
        // Para busca pública
        const searchParams = {
            query: String(query),
            limit: parseInt(String(limit), 10),
            offset: parseInt(String(offset), 10),
            sort: sort || 'relevance',
            category: category ? String(category) : undefined,
            price_min: price_min ? parseInt(String(price_min), 10) : undefined,
            price_max: price_max ? parseInt(String(price_max), 10) : undefined,
            condition: condition ? String(condition) : undefined,
            shipping: shipping ? String(shipping) : undefined,
            userId: userId,
        };
        const products = await mercadoLivreService.searchProducts(searchParams);
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    }
    catch (error) {
        console.error('[ProductController] Erro ao buscar produtos:', error.message);
        res.status(500).json({
            error: error.message || 'Erro ao buscar produtos',
        });
    }
};
/**
 * Obtém detalhes completos de um produto
 * GET /api/products/:productId
/**
 * Obtém detalhes completos de um produto
 * GET /api/products/:productId
 */
export const getProductDetails = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ error: 'Product ID é obrigatório' });
        }
        const product = await mercadoLivreService.getProductDetails(productId);
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error('[ProductController] Erro ao obter detalhes:', error.message);
        res.status(500).json({
            error: error.message || 'Erro ao obter detalhes do produto',
        });
    }
};
/**
 * Obtém informações do vendedor
 * GET /api/products/seller/:sellerId
 */
export const getSellerInfo = async (req, res) => {
    try {
        const { sellerId } = req.params;
        if (!sellerId) {
            return res.status(400).json({ error: 'Seller ID é obrigatório' });
        }
        const seller = await mercadoLivreService.getSellerInfo(parseInt(sellerId, 10));
        res.status(200).json({
            success: true,
            data: seller,
        });
    }
    catch (error) {
        console.error('[ProductController] Erro ao obter vendedor:', error.message);
        res.status(500).json({
            error: error.message || 'Erro ao obter informações do vendedor',
        });
    }
};
/**
 * Encontra produtos concorrentes
 * GET /api/products/:productId/competitors
 */
export const findCompetitors = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ error: 'Product ID é obrigatório' });
        }
        const competitors = await mercadoLivreService.findCompetitors(productId);
        res.status(200).json({
            success: true,
            count: competitors.length,
            data: competitors,
        });
    }
    catch (error) {
        console.error('[ProductController] Erro ao buscar concorrentes:', error.message);
        res.status(500).json({
            error: error.message || 'Erro ao buscar concorrentes',
        });
    }
};
/**
 * Busca por categoria
 * GET /api/products/category/:categoryId?limit=50
 */
export const searchByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { limit = 50 } = req.query;
        if (!categoryId) {
            return res.status(400).json({ error: 'Category ID é obrigatório' });
        }
        const products = await mercadoLivreService.searchByCategory(categoryId, parseInt(String(limit), 10));
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    }
    catch (error) {
        console.error('[ProductController] Erro ao buscar por categoria:', error.message);
        res.status(500).json({
            error: error.message || 'Erro ao buscar por categoria',
        });
    }
};
/**
 * Salva um produto na base de dados do usuário
 * POST /api/products/save (autenticado)
 */
export const saveProduct = async (req, res) => {
    try {
        const { name, description, productId, price, seller } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        if (!productId) {
            return res.status(400).json({ error: 'Product ID é obrigatório' });
        } // Inserir produto na base de dados
        const [result] = await pool.query(`INSERT INTO products 
        (user_id, name, description, mercado_livre_id, price, seller_info, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`, [userId, name, description || '', productId, price || 0, JSON.stringify(seller)]);
        res.status(201).json({
            success: true,
            message: 'Produto salvo com sucesso',
            data: {
                id: result.insertId,
                productId,
                name,
                price,
            },
        });
    }
    catch (error) {
        console.error('[ProductController] Erro ao salvar produto:', error.message);
        res.status(500).json({
            error: error.message || 'Erro ao salvar produto',
        });
    }
};
/**
 * Obtém produtos salvos do usuário
 * GET /api/products/saved (autenticado)
 */
export const getSavedProducts = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Não autenticado' });
        }
        const [products] = await pool.query('SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    }
    catch (error) {
        console.error('[ProductController] Erro ao obter produtos salvos:', error.message);
        res.status(500).json({
            error: error.message || 'Erro ao obter produtos salvos',
        });
    }
};
//# sourceMappingURL=productController.js.map