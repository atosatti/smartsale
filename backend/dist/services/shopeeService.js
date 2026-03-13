import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
class ShopeeService {
    constructor() {
        // usar endpoint público genérico; a integração pode ser ajustada para o Partner API
        this.baseURL = process.env.SHOPEE_API_BASE_URL || 'https://shopee.com.br/api/v4';
        this.cache = new Map();
        this.cacheTTL = 60 * 60 * 1000; // 1h
        this.apiClient = axios.create({
            baseURL: this.baseURL,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SmartSale/1.0; +https://example.com)'
            }
        });
    }
    async searchProducts(params) {
        const cacheKey = `sh_search:${params.query}:${params.limit || 20}:${params.offset || 0}`;
        try {
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL)
                    return cached.data;
            }
            // Uso de endpoint público simples - pode ser substituído pela Partner API
            const response = await this.apiClient.get('/search/search_items', {
                params: {
                    page_type: 'search',
                    version: 2,
                    by: 'relevancy',
                    limit: params.limit || 20,
                    offset: params.offset || 0,
                    keyword: params.query,
                }
            });
            const items = (response.data?.items || []).map((it) => this.mapProduct(it));
            this.cache.set(cacheKey, { data: items, timestamp: Date.now() });
            return items;
        }
        catch (error) {
            console.error('[Shopee Search] Erro ao buscar produtos:', error?.message || error);
            // Fallback mock para desenvolvimento
            const mockProducts = Array.from({ length: Math.min(15, params.limit || 15) }).map((_, i) => ({
                id: `SH_MOCK_${params.query}_${i + 1}`,
                title: `${params.query} - Modelo ${i + 1}`,
                price: Math.floor(Math.random() * 300) + 50,
                currency: 'BRL',
                thumbnail: `https://via.placeholder.com/300?text=${encodeURIComponent(params.query)}`,
                sold: Math.floor(Math.random() * 500),
                rating: (Math.random() * 5).toFixed(2),
                seller: { id: 1000 + i, name: `Loja Shopee ${i + 1}` }
            }));
            this.cache.set(cacheKey, { data: mockProducts, timestamp: Date.now() });
            return mockProducts;
        }
    }
    async getProductDetails(productId) {
        const cacheKey = `sh_product:${productId}`;
        try {
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL)
                    return cached.data;
            }
            const response = await this.apiClient.get('/item/get', { params: { itemid: productId } });
            const details = this.mapProductDetails(response.data || {});
            this.cache.set(cacheKey, { data: details, timestamp: Date.now() });
            return details;
        }
        catch (error) {
            console.error('[Shopee Details] Erro ao obter detalhes:', error?.message || error);
            // Fallback simples
            return {
                id: productId,
                title: `Produto Shopee ${productId}`,
                price: 99,
                currency: 'BRL',
                sold: 0,
                rating: '0.00',
                seller: { id: 0, name: 'Desconhecido' },
                description: '',
            };
        }
    }
    async compareProducts(productIds) {
        try {
            const products = await Promise.all(productIds.map(id => this.getProductDetails(id).catch(() => null)));
            const valid = products.filter(Boolean);
            return {
                success: valid.length > 0,
                data: valid,
                comparison: {
                    count: valid.length,
                    avgPrice: valid.reduce((s, p) => s + (p.price || 0), 0) / Math.max(1, valid.length),
                }
            };
        }
        catch (error) {
            console.error('[Shopee Compare] Erro:', error?.message || error);
            return { success: false, data: [], comparison: {} };
        }
    }
    async getPriceHistory(productId) {
        // Shopee não fornece historicamente público; retornar mock para análise
        return Array.from({ length: 30 }).map((_, i) => ({
            date: new Date(Date.now() - (29 - i) * 24 * 3600 * 1000).toISOString().split('T')[0],
            price: Math.floor(80 + Math.random() * 120)
        }));
    }
    async testAPIConnection() {
        try {
            const response = await this.apiClient.get('/search/search_items', { params: { keyword: 'notebook', limit: 1 } });
            return { success: true, message: 'Conexão Shopee OK', data: { status: response.status, items: response.data?.items?.length || 0 } };
        }
        catch (error) {
            console.error('[Shopee Test] Erro:', error?.message || error);
            return { success: false, message: `Erro: ${error?.message || 'unknown'}`, data: null };
        }
    }
    mapProduct(item) {
        // Estrutura esperada de item: { item_basic: { itemid, name, price, ... } }
        const basic = item.item_basic || item;
        return {
            id: basic.itemid || basic.id || basic.item_id,
            title: basic.name || basic.title,
            price: basic.price / (basic.currency ? 100000 : 1) || basic.price || 0,
            currency: basic.currency || 'BRL',
            thumbnail: basic.image || basic.thumb || null,
            sold: basic.historical_sold || 0,
            rating: basic.rating || null,
            seller: { id: basic.shopid || basic.shop_id || null, name: basic.shopname || null }
        };
    }
    mapProductDetails(raw) {
        const basic = raw.item || raw.item_basic || raw;
        return {
            id: basic.itemid || basic.item_id || basic.id,
            title: basic.name || basic.title,
            price: basic.price || 0,
            currency: basic.currency || 'BRL',
            sold: basic.historical_sold || 0,
            rating: basic.rating || null,
            seller: { id: basic.shopid || basic.shop_id || null, name: basic.shopname || null },
            description: raw.description || ''
        };
    }
}
export default new ShopeeService();
//# sourceMappingURL=shopeeService.js.map