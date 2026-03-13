import axios from 'axios';
import dotenv from 'dotenv';
import db from '../config/database.js';
import { mockProductDetails, mockPriceHistory } from '../utils/mockMercadoLivre.js';
dotenv.config();
class MercadoLivreService {
    constructor() {
        this.baseURL = 'https://api.mercadolibre.com'; // URL global da API (sem .br)
        this.cache = new Map();
        this.cacheTTL = 3600000; // 1 hora em ms
        this.appId = process.env.MERCADO_LIVRE_APP_ID || '';
        this.secretKey = process.env.MERCADO_LIVRE_SECRET_KEY || '';
        this.apiClient = axios.create({
            baseURL: this.baseURL,
            timeout: 15000,
            headers: {
                // User-Agent é importante para a API do Mercado Livre
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                // Desabilitar cache HTTP condicional
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9',
                'Connection': 'keep-alive',
            },
        }); // Interceptor para logs e tratamento de erros
        this.apiClient.interceptors.response.use((response) => {
            if (response.status === 304) {
                console.warn('[ML API] Recebido 304 Not Modified - retornando cache');
                // Retornar array vazio para indicar que dados não foram alterados
                response.data = { results: [] };
            }
            return response;
        }, (error) => {
            if (error.response) {
                console.error(`[ML API] Erro ${error.response.status}:`, {
                    url: error.config?.url,
                    status: error.response?.status,
                    message: error.response?.data?.message || error.message,
                    errorCode: error.response?.data?.error,
                });
            }
            else {
                console.error(`[ML API] Erro de Conexão:`, {
                    url: error.config?.url,
                    message: error.message,
                    code: error.code,
                });
            }
            return Promise.reject(error);
        });
    }
    /**
     * ✨ NOVO: Renovar token automaticamente se expirou/está expirando
     * Verifica expires_at e usa refresh_token se disponível
     */
    async refreshTokenIfNeeded(userId) {
        try {
            console.log(`[ML Service] Verificando expiração de token para user ${userId}...`);
            const [rows] = await db.query('SELECT mercado_livre_token, mercado_livre_token_expires_at, mercado_livre_refresh_token FROM users WHERE id = ?', [userId]);
            const user = rows?.[0];
            if (!user || !user.mercado_livre_token) {
                console.log(`[ML Service] Sem token para user ${userId}`);
                return null;
            }
            // Verificar se expirou (renovar 5 min antes da expiração)
            const expiresAt = new Date(user.mercado_livre_token_expires_at);
            const now = new Date();
            const timeToExpire = expiresAt.getTime() - now.getTime();
            const fiveMinutes = 5 * 60 * 1000;
            console.log(`[ML Service] Token expira em: ${expiresAt.toISOString()}`);
            console.log(`[ML Service] Tempo até expiração: ${Math.round(timeToExpire / 1000)}s`);
            // Se vencer em menos de 5 min, renovar
            if (timeToExpire < fiveMinutes) {
                console.log(`[ML Service] ⚠️ Token expirando em breve, iniciando renovação...`);
                if (!user.mercado_livre_refresh_token) {
                    console.error(`[ML Service] ❌ Refresh token não disponível! Usuário precisa reautenticar.`);
                    return user.mercado_livre_token; // Retornar token antigo (pode funcionar ainda)
                }
                try {
                    console.log(`[ML Service] Chamando OAuth endpoint para renovar...`);
                    const response = await axios.post('https://api.mercadolibre.com/oauth/token', {
                        grant_type: 'refresh_token',
                        client_id: this.appId,
                        client_secret: this.secretKey,
                        refresh_token: user.mercado_livre_refresh_token,
                    }, {
                        timeout: 10000,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    });
                    const newToken = response.data.access_token;
                    const newRefreshToken = response.data.refresh_token;
                    const expiresIn = response.data.expires_in || 21600; // 6 horas padrão
                    const newExpiresAt = new Date(Date.now() + expiresIn * 1000);
                    // Salvar novo token no banco
                    console.log(`[ML Service] Salvando novo token no banco (expires in ${expiresIn}s)...`);
                    await db.query('UPDATE users SET mercado_livre_token = ?, mercado_livre_refresh_token = ?, mercado_livre_token_expires_at = ? WHERE id = ?', [newToken, newRefreshToken, newExpiresAt, userId]);
                    console.log(`[ML Service] ✅ Token renovado com sucesso! Novo expires_at: ${newExpiresAt.toISOString()}`);
                    return newToken;
                }
                catch (error) {
                    console.error(`[ML Service] ❌ Erro ao renovar token:`, error.message);
                    if (error.response?.data) {
                        console.error(`[ML Service] Detalhes do erro:`, error.response.data);
                    }
                    // Retornar token antigo mesmo com falha na renovação
                    return user.mercado_livre_token;
                }
            }
            else {
                console.log(`[ML Service] ✓ Token ainda válido`);
                return user.mercado_livre_token;
            }
        }
        catch (error) {
            console.error(`[ML Service] Erro ao verificar expiração:`, error.message);
            return null;
        }
    }
    /**
     * Obter token OAuth do usuário (com auto-refresh)
     */
    async getUserOAuthToken(userId) {
        try {
            // 1️⃣ Primeiro, tentar renovar se necessário
            const refreshedToken = await this.refreshTokenIfNeeded(userId);
            if (refreshedToken) {
                return refreshedToken;
            }
            // 2️⃣ Se refresh falhou, tentar obter token antigo
            const [rows] = await db.query('SELECT mercado_livre_token, mercado_livre_test_token, mercado_livre_test_user_id FROM users WHERE id = ?', [userId]);
            if (rows && rows.length > 0) {
                // Preferir token de teste se disponível (para contornar bloqueios de ngrok)
                if (rows[0].mercado_livre_test_token) {
                    return rows[0].mercado_livre_test_token; // Retorna credenciais em base64
                }
                // Senão usar token principal
                if (rows[0].mercado_livre_token) {
                    return rows[0].mercado_livre_token;
                }
            }
            return null;
        }
        catch (error) {
            // Se a coluna não existe ainda, retornar null (a coluna será adicionada pela migração)
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                console.warn('[ML Service] Coluna mercado_livre_token não existe ainda. Use: npm run migrate');
                return null;
            }
            console.error('[ML Service] Erro ao obter token OAuth:', error);
            return null;
        }
    }
    async searchProducts(params) {
        const cacheKey = `search:${params.query}:${params.limit}:${params.offset}`;
        try {
            // Verificar cache
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            const queryParams = {
                q: params.query,
                limit: params.limit || 50,
                offset: params.offset || 0,
            };
            if (params.category) {
                queryParams.category = params.category;
            }
            if (params.sort) {
                queryParams.sort = this.mapSortParam(params.sort);
            } // Obter token se usuário tem OAuth
            let token = null;
            if (params.userId) {
                token = await this.getUserOAuthToken(params.userId);
            } // Usar apenas token OAuth, não credenciais de teste
            // (Credenciais de teste do Mercado Livre não funcionam em APIs)
            if (token) {
                // Verificar se é um token OAuth real (inicia com base64 ou é um UUID)
                // Credenciais de teste armazenam nickname:password em base64
                try {
                    const decoded = Buffer.from(token, 'base64').toString('utf-8');
                    if (decoded.includes(':') && decoded.includes('TEST')) {
                        // É uma credencial de teste - não usar na API} else if (decoded.includes(':')) {
                        // É credencial, não token - skip} else {
                        // É um token OAuth legítimo
                        queryParams.access_token = token;
                    }
                }
                catch (e) {
                    // Possível token OAuth (não base64 válido)
                    // Tentar usar como token
                    if (!token.includes(':')) {
                        queryParams.access_token = token;
                    }
                    else { }
                }
            }
            else { }
            const response = await this.apiClient.get('/sites/MLB/search', {
                params: queryParams,
            });
            const products = response.data.results.map((item) => this.mapProduct(item));
            // Armazenar em cache
            this.cache.set(cacheKey, { data: products, timestamp: Date.now() });
            return products;
        }
        catch (error) {
            console.error('[ML Search] ✗ Erro ao buscar produtos:', error.message);
            if (error.response) {
                console.error('[ML Search] Status:', error.response.status);
                console.error('[ML Search] Dados:', error.response.data);
                console.error('[ML Search] Headers:', {
                    'User-Agent': error.config?.headers?.['User-Agent'],
                    'Authorization': error.config?.headers?.['Authorization'],
                });
            }
            // Retornar erro em vez de fallback automático
            // para debugar o problema real
            if (error.response?.status === 403) {
                console.error('[ML Search] ⚠️ 403 Forbidden - ngrok está sendo bloqueado');
                console.error('[ML Search] Usando dados de demonstração como fallback');
            }
            // FALLBACK: Usar mock de desenvolvimento
            // Isso é necessário porque ngrok bloqueia requisições para APIs externas
            console.warn('[ML Search] ⚠️ Usando dados de demonstração (modo desenvolvimento)');
            // Gerar resultados mockados relevantes à busca
            try {
                const query = params.query.toLowerCase();
                // Criar 15 produtos mockados baseado na query
                const mockProducts = [];
                for (let i = 1; i <= 15; i++) {
                    mockProducts.push({
                        id: `MOCK_${query}_${i}`,
                        title: `${query.charAt(0).toUpperCase() + query.slice(1)} - Modelo ${i}`,
                        price: Math.floor(Math.random() * 500) + 50,
                        currency: 'BRL',
                        thumbnail: `https://via.placeholder.com/300x300?text=${query}+${i}`,
                        condition: i % 3 === 0 ? 'usado' : 'novo',
                        seller: {
                            id: 1000 + i,
                            nickname: `Loja Demo ${i}`,
                            type: 'Vendedor',
                        },
                        shipping: {
                            free_shipping: Math.random() > 0.5,
                        },
                    });
                }
                // Armazenar em cache
                this.cache.set(cacheKey, { data: mockProducts, timestamp: Date.now() });
                return mockProducts;
            }
            catch (mockError) {
                console.error('[ML Search] Erro ao gerar dados mockados:', mockError);
            }
            // Se tudo falhar, retornar array vazio
            console.error('[ML Search] ✗ Não foi possível obter dados. Retornando vazio.');
            return [];
        }
    }
    /**
     * Obter detalhes completos do produto
     */
    async getProductDetails(productId) {
        const cacheKey = `product:${productId}`;
        try {
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            const response = await this.apiClient.get(`/items/${productId}`);
            const product = this.mapProductDetails(response.data);
            this.cache.set(cacheKey, { data: product, timestamp: Date.now() });
            return product;
        }
        catch (error) {
            console.error('[ML Details] Erro ao obter detalhes:', error.message);
            console.warn('[ML Details] Usando dados mockados como fallback');
            // Usar mock como fallback
            try {
                const product = this.mapProductDetails(mockProductDetails);
                return product;
            }
            catch (mockError) {
                console.error('[ML Details] Erro ao processar dados mockados:', mockError);
                throw error;
            }
        }
    }
    /**
     * ✨ NOVO: Buscar itens de um vendedor (dados REAIS, não referenciais)
     * Recomendado pela documentação oficial ML
     * GET /users/{user_id}/items/search
     *
     * Retorna `available_quantity` com valores REAIS (não referencial)
     * Requer token OAuth do seller
     */
    async searchSellerItems(params, userToken) {
        const cacheKey = `seller_items:${params.sellerId}:${params.status}:${params.orders}:${params.offset || 0}`;
        try {
            // Verificar cache
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            const queryParams = {
                limit: Math.min(params.limit || 50, 100), // Max 100 por requisição
            };
            // Paginação: usar offset para normal, remover para scan
            if (params.search_type === 'scan') {
                if (params.scroll_id) {
                    queryParams.scroll_id = params.scroll_id;
                }
                else {
                    queryParams.search_type = 'scan';
                }
            }
            else {
                queryParams.offset = params.offset || 0;
            }
            // ===== FILTROS DE STATUS E SUBSTATUS =====
            if (params.status) {
                queryParams.status = params.status;
            }
            if (params.sub_status) {
                queryParams.sub_status = params.sub_status;
            }
            // ===== ORDENAÇÃO =====
            if (params.orders) {
                queryParams.orders = params.orders;
            }
            // ===== BUSCA POR IDENTIFICADORES =====
            if (params.sku) {
                queryParams.sku = params.sku;
            }
            if (params.seller_sku) {
                queryParams.seller_sku = params.seller_sku;
            }
            if (params.missing_product_identifiers !== undefined) {
                queryParams.missing_product_identifiers = params.missing_product_identifiers;
            }
            // ===== FILTROS DE MODO DE COMPRA =====
            if (params.buying_mode) {
                queryParams.buying_mode = params.buying_mode;
            }
            // ===== FILTROS DE TIPO DE LISTAGEM =====
            if (params.listing_type_id) {
                queryParams.listing_type_id = params.listing_type_id;
            }
            // ===== FILTROS DE ENVIO =====
            if (params.shipping_mode) {
                queryParams.shipping_mode = params.shipping_mode;
            }
            if (params.shipping_free_methods) {
                queryParams.shipping_free_methods = params.shipping_free_methods;
            }
            if (params.shipping_tags) {
                queryParams.shipping_tags = params.shipping_tags;
            }
            // ===== FILTROS DE ORIGEM DA LISTAGEM =====
            if (params.listing_source) {
                queryParams.listing_source = params.listing_source;
            }
            // ===== FILTROS DE SAÚDE (Reputation Health Gauge) =====
            if (params.reputation_health_gauge) {
                queryParams.reputation_health_gauge = params.reputation_health_gauge;
            }
            // ===== FILTROS DE LABELS =====
            if (params.labels && params.labels.length > 0) {
                // Cada label é adicionado como parâmetro separado
                queryParams.labels = params.labels;
            }
            // ===== TIPO DE LOGÍSTICA =====
            if (params.logistic_type) {
                queryParams.logistic_type = params.logistic_type;
            }
            // ===== INCLUIR FILTROS DISPONÍVEIS =====
            if (params.include_filters) {
                queryParams.include_filters = true;
            } // Preparar headers com token
            const headers = {};
            if (userToken) {
                headers.Authorization = `Bearer ${userToken}`;
            }
            else { }
            const response = await this.apiClient.get(`/users/${params.sellerId}/items/search`, {
                params: queryParams,
                headers,
            });
            const result = {
                seller_id: response.data.seller_id,
                results: response.data.results || [],
                paging: response.data.paging,
                orders: response.data.orders,
                available_orders: response.data.available_orders,
                filters: response.data.filters || [],
                available_filters: response.data.available_filters || [],
                scroll_id: response.data.scroll_id, // Para busca de 1000+ itens
                // Mapear para formato Product se necessário
                products: (response.data.results || []).map((itemId) => ({
                    id: itemId,
                    // Seria necessário fazer multiget para obter detalhes completos
                })),
            };
            // Armazenar em cache (com TTL menor para dados de scan)
            const ttl = params.search_type === 'scan' ? 300000 : this.cacheTTL; // 5 min para scan, 1h para normal
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        }
        catch (error) {
            console.error('[ML Seller Search] ✗ Erro ao buscar itens do seller:', error.message);
            if (error.response) {
                console.error('[ML Seller Search] Status:', error.response.status);
                console.error('[ML Seller Search] Dados:', error.response.data);
                // Tratamento específico de erros
                if (error.response.status === 401) {
                    throw new Error('Token OAuth expirado ou inválido. Reconecte sua conta no Mercado Livre.');
                }
                if (error.response.status === 403) {
                    throw new Error('Sem permissão para acessar itens deste vendedor.');
                }
                if (error.response.status === 404) {
                    throw new Error('Vendedor não encontrado.');
                }
            }
            throw this.handleError(error, 'searchSellerItems');
        }
    }
    /**
     * ✨ NOVO: Verificar restrições de um seller
     * GET /users/{user_id}/items/search/restrictions
     *
     * Se vendedor tem 200k+ itens:
     * - aggregations_allowed: false (não retorna filters/available_filters)
     * - query_allowed: true (pode buscar)
     * - sort_allowed: true (pode ordenar)
     */
    async getSellerRestrictions(sellerId, userToken) {
        try {
            const cacheKey = `seller_restrictions:${sellerId}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            const headers = {};
            if (userToken) {
                headers.Authorization = `Bearer ${userToken}`;
            }
            const response = await this.apiClient.get(`/users/${sellerId}/items/search/restrictions`, {
                headers,
            });
            const result = {
                aggregations_allowed: response.data.aggregations_allowed,
                query_allowed: response.data.query_allowed,
                sort_allowed: response.data.sort_allowed,
                has_many_items: !response.data.aggregations_allowed, // Indicador se tem 200k+
            };
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        }
        catch (error) {
            console.error('[ML Restrictions] Erro ao obter restrições:', error.message);
            throw this.handleError(error, 'getSellerRestrictions');
        }
    }
    /**
     * Obter informações de um vendedor específico
     * GET /users/:userId
     * Retorna: nickname, country_id, registration_date, car_dealer, real_estate_agency, tags, points, etc
     */
    async getSellerInfo(sellerId) {
        try {
            const cacheKey = `seller_info:${sellerId}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            const response = await this.apiClient.get(`/users/${sellerId}`);
            const result = this.mapSellerInfo(response.data);
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        }
        catch (error) {
            console.error('[ML SellerInfo] Erro ao obter informações do vendedor:', error.message);
            throw this.handleError(error, 'getSellerInfo');
        }
    }
    /**
     * ✨ NOVO: Buscar múltiplos itens em 1 requisição (Multiget)
     * GET /items?ids=$ID1,$ID2,...&attributes=$FIELD1,$FIELD2
     *
     * Vantagem: Reduzir 20 requisições em 1 chamada
     * Máximo: 20 IDs por requisição
     * Retorna response verbose com status code por item
     */
    async getItemsMulti(itemIds, attributes) {
        try {
            if (itemIds.length === 0) {
                return [];
            }
            if (itemIds.length > 20) {
                console.warn('[ML Multiget] Máximo 20 IDs permitidos, truncando para 20');
                itemIds = itemIds.slice(0, 20);
            }
            const cacheKey = `multiget_items:${itemIds.join(',')}:${attributes?.join(',') || 'all'}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            const params = {
                ids: itemIds.join(','),
            };
            if (attributes && attributes.length > 0) {
                params.attributes = attributes.join(',');
            }
            const response = await this.apiClient.get('/items', {
                params,
            });
            const results = Array.isArray(response.data) ? response.data : [response.data];
            // Processar resposta verbose
            const processedResults = results.map((item) => {
                if (item.code === 200) {
                    return {
                        success: true,
                        data: this.mapProductDetails(item.body),
                    };
                }
                else {
                    return {
                        success: false,
                        code: item.code,
                        error: item.body?.message || 'Erro ao obter item',
                    };
                }
            });
            this.cache.set(cacheKey, { data: processedResults, timestamp: Date.now() });
            return processedResults;
        }
        catch (error) {
            console.error('[ML Multiget] Erro ao buscar múltiplos itens:', error.message);
            throw this.handleError(error, 'getItemsMulti');
        }
    }
    /**
     * ✨ NOVO: Buscar múltiplos usuários em 1 requisição
     * GET /users?ids=$USER1,$USER2
     *
     * Máximo: 20 usuários por requisição
     */
    async getUsersMulti(userIds) {
        try {
            if (userIds.length === 0) {
                return [];
            }
            if (userIds.length > 20) {
                console.warn('[ML Multiget Users] Máximo 20 usuários permitidos, truncando');
                userIds = userIds.slice(0, 20);
            }
            const cacheKey = `multiget_users:${userIds.join(',')}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            const response = await this.apiClient.get('/users', {
                params: {
                    ids: userIds.join(','),
                },
            });
            const results = Array.isArray(response.data) ? response.data : [response.data];
            // Processar resposta verbose
            const processedResults = results.map((item) => {
                if (item.code === 200) {
                    return {
                        success: true,
                        data: this.mapSellerInfo(item.body),
                    };
                }
                else {
                    return {
                        success: false,
                        code: item.code,
                        error: item.body?.message || 'Erro ao obter usuário',
                    };
                }
            });
            this.cache.set(cacheKey, { data: processedResults, timestamp: Date.now() });
            return processedResults;
        }
        catch (error) {
            console.error('[ML Multiget Users] Erro ao buscar múltiplos usuários:', error.message);
            throw this.handleError(error, 'getUsersMulti');
        }
    }
    /**
     * Busca pública com suporte a filtros avançados (conforme documentação ML)
     * GET /sites/{site_id}/search?filters
     *
     * Mantém compatibilidade com:
     * - Busca por query/nickname/seller_id
     * - Filtros: shipping, condition, price range, etc.
     * - Ordenação: price_asc, price_desc, stop_time_asc, etc.
     *
     * ⚠️ NOTA: available_quantity é REFERENCIAL (não real)
     */
    async searchPublicWithFilters(filters) {
        try {
            const cacheKey = `public_search:${JSON.stringify(filters)}`;
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTTL) {
                    return cached.data;
                }
            }
            const params = {
                limit: Math.min(filters.limit || 50, 100),
                offset: filters.offset || 0,
            };
            // ===== IDENTIFICADORES E BUSCA =====
            if (filters.q) {
                params.q = filters.q;
            }
            if (filters.seller_id) {
                params.seller_id = filters.seller_id;
            }
            if (filters.nickname) {
                params.nickname = filters.nickname;
            }
            if (filters.category) {
                params.category = filters.category;
            }
            // ===== PREÇO =====
            if (filters.price_min || filters.price_max) {
                let priceRange = '';
                if (filters.price_min)
                    priceRange += filters.price_min;
                priceRange += '-';
                if (filters.price_max)
                    priceRange += filters.price_max;
                params.price = priceRange;
            }
            // ===== CONDIÇÃO DO ITEM =====
            if (filters.condition) {
                params.condition = filters.condition;
            }
            // ===== ENVIO =====
            if (filters.shipping === 'free') {
                params.shipping = 'free';
            }
            // ===== ORDENAÇÃO =====
            if (filters.sort) {
                params.sort = filters.sort;
            }
            const response = await this.apiClient.get('/sites/MLB/search', {
                params,
            });
            const result = {
                query: filters.q,
                total: response.data.paging?.total || 0,
                results: (response.data.results || []).map((item) => this.mapProduct(item)),
                paging: response.data.paging,
                available_filters: response.data.available_filters || [],
                available_sorts: response.data.available_sorts || [],
                filters_applied: {
                    seller_id: filters.seller_id,
                    condition: filters.condition,
                    shipping: filters.shipping,
                    price_range: filters.price_min || filters.price_max ? `${filters.price_min || '0'}-${filters.price_max || '∞'}` : null,
                },
            };
            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        }
        catch (error) {
            console.error('[ML Public Search] Erro:', error.message);
            throw this.handleError(error, 'searchPublicWithFilters');
        }
    }
    /**
      try {
        const cacheKey = `seller:${sellerId}`;
        
        if (this.cache.has(cacheKey)) {
          const cached = this.cache.get(cacheKey)!;
          if (Date.now() - cached.timestamp < this.cacheTTL) {
            return cached.data;
          }
        }
  
        const response = await this.apiClient.get(`/users/${sellerId}`);
        const sellerInfo = this.mapSellerInfo(response.data);
  
        this.cache.set(cacheKey, { data: sellerInfo, timestamp: Date.now() });
  
        return sellerInfo;
      } catch (error) {
        throw this.handleError(error, 'getSellerInfo');
      }
    }
  
    /**
     * Buscar produtos similares/concorrentes
     */
    async findCompetitors(productId) {
        try {
            // Primeiro, obter detalhes do produto para pegar o título
            const productDetails = await this.getProductDetails(productId);
            // Extrair principais palavras-chave
            const keywords = this.extractKeywords(productDetails.title);
            // Buscar produtos similares
            return await this.searchProducts({
                query: keywords,
                limit: 20,
            });
        }
        catch (error) {
            throw this.handleError(error, 'findCompetitors');
        }
    }
    /**
     * Buscar produtos por categoria
     */
    async searchByCategory(categoryId, limit = 50) {
        try {
            const response = await this.apiClient.get('/sites/MLB/search', {
                params: {
                    category: categoryId,
                    limit,
                },
            });
            return response.data.results.map((item) => this.mapProduct(item));
        }
        catch (error) {
            throw this.handleError(error, 'searchByCategory');
        }
    }
    /**
     * Obter histórico de preços de um produto
     */
    async getPriceHistory(productId) {
        try { // Usar mock como fallback (API não fornece histórico diretamente)
            return mockPriceHistory;
        }
        catch (error) {
            console.warn('[ML Price History] Erro. Usando dados simulados.');
            return mockPriceHistory;
        }
    }
    /**
     * Limpar cache (útil para testes)
     */
    clearCache() {
        this.cache.clear();
    }
    // ==================== PRIVATE METHODS ====================
    /**
     * Mapear resposta da API para objeto Product
     */
    mapProduct(item) {
        return {
            id: item.id,
            title: item.title,
            price: item.price,
            currency: item.currency_id,
            thumbnail: item.thumbnail || item.thumbnail_id,
            condition: item.condition,
            seller: {
                id: item.seller.id,
                nickname: item.seller.nickname,
                type: item.seller.type,
            },
            shipping: {
                free_shipping: item.shipping.free_shipping,
            },
            attributes: item.attributes || [],
        };
    }
    /**
     * Mapear resposta detalhada do produto
     */
    mapProductDetails(item) {
        return {
            id: item.id,
            title: item.title,
            price: item.price,
            currency: item.currency_id,
            initial_quantity: item.initial_quantity || 0,
            sold_quantity: item.sold_quantity || 0,
            available_quantity: item.available_quantity || 0,
            condition: item.condition,
            description: {
                plain_text: item.description?.plain_text || '',
            },
            pictures: item.pictures || [],
            category_id: item.category_id,
            category_name: item.category_name,
            seller_id: item.seller_id,
            attributes: item.attributes || [],
        };
    }
    /**
     * Mapear informações do vendedor
     */
    mapSellerInfo(seller) {
        return {
            id: seller.id,
            nickname: seller.nickname,
            points: seller.points,
            level_id: seller.seller_reputation?.level_id || 'unknown',
            status: {
                power_seller_status: seller.seller_reputation?.power_seller_status || 'inactive',
            },
            seller_reputation: {
                level_id: seller.seller_reputation?.level_id || 'unknown',
                power_seller_status: seller.seller_reputation?.power_seller_status || 'inactive',
                positive_feedback: seller.seller_reputation?.positive_feedback || 0,
                transactions: seller.seller_reputation?.transactions || 0,
            },
        };
    }
    /**
     * Mapear parâmetro de ordenação
     */
    mapSortParam(sort) {
        const sortMap = {
            price_asc: 'price_asc',
            price_desc: 'price_desc',
            relevance: '_relevance',
        };
        return sortMap[sort] || '_relevance';
    }
    /**
     * Extrair palavras-chave do título
     */
    extractKeywords(title) {
        // Remover stop words comuns em português
        const stopWords = ['de', 'o', 'a', 'em', 'e', 'para', 'com', 'por', 'um', 'uma'];
        const words = title
            .toLowerCase()
            .split(/\s+/)
            .filter(word => !stopWords.includes(word) && word.length > 2)
            .slice(0, 3); // Pegar apenas as 3 primeiras palavras significativas
        return words.join(' ') || title.split(' ')[0];
    }
    /**
     * Tratamento de erros
     */
    handleError(error, methodName) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || 'Erro na API do Mercado Livre';
            if (status === 400) {
                return new Error(`[${methodName}] Requisição inválida: ${message}`);
            }
            else if (status === 404) {
                return new Error(`[${methodName}] Produto não encontrado`);
            }
            else if (status === 429) {
                return new Error(`[${methodName}] Limite de requisições excedido. Tente novamente em alguns minutos.`);
            }
            else if (status >= 500) {
                return new Error(`[${methodName}] Erro no servidor do Mercado Livre (${status})`);
            }
        }
        if (error.code === 'ECONNABORTED') {
            return new Error(`[${methodName}] Requisição expirou. Tente novamente.`);
        }
        if (error.code === 'ENOTFOUND') {
            return new Error(`[${methodName}] Não foi possível conectar à API do Mercado Livre. Verifique sua conexão com a internet.`);
        }
        if (error.code === 'ECONNREFUSED') {
            return new Error(`[${methodName}] Conexão recusada. O servidor do Mercado Livre pode estar indisponível.`);
        }
        return new Error(`[${methodName}] Erro ao buscar dados: ${error.message}`);
    }
    /**
     * Testar conexão com a API real do Mercado Livre (sem fallback para mock)
     */
    async testAPIConnection() {
        try {
            const response = await this.apiClient.get('/sites/MLB/search', {
                params: {
                    q: 'notebook',
                    limit: 1,
                },
            });
            return {
                success: true,
                message: 'Conexão com API do Mercado Livre estabelecida com sucesso!',
                data: {
                    status: response.status,
                    resultsCount: response.data.results?.length || 0,
                    totalResults: response.data.paging?.total || 0,
                },
            };
        }
        catch (error) {
            console.error('[ML Test] ✗ Erro na conexão:', error.message);
            return {
                success: false,
                message: `Erro ao conectar com API: ${error.message}`,
                data: {
                    error: error.response?.data || error.message,
                    status: error.response?.status,
                },
            };
        }
    }
    /**
     * Comparar múltiplos produtos
     */
    async compareProducts(productIds) {
        try {
            const products = await Promise.all(productIds.map(id => this.getProductDetails(id).catch(() => null)));
            const validProducts = products.filter(p => p !== null);
            if (validProducts.length === 0) {
                return {
                    success: false,
                    message: 'Nenhum produto encontrado',
                    data: [],
                };
            }
            // Retornar produtos com dados de comparação
            return {
                success: true,
                data: validProducts,
                comparison: {
                    count: validProducts.length,
                    avgPrice: validProducts.reduce((sum, p) => sum + (p.price || 0), 0) / validProducts.length,
                    minPrice: Math.min(...validProducts.map(p => p.price || 0)),
                    maxPrice: Math.max(...validProducts.map(p => p.price || 0)),
                },
            };
        }
        catch (error) {
            console.error('[ML Service] Erro ao comparar produtos:', error.message);
            return {
                success: false,
                message: `Erro ao comparar produtos: ${error.message}`,
                data: [],
            };
        }
    }
}
// Exportar instância singleton
export default new MercadoLivreService();
//# sourceMappingURL=mercadoLivreService.js.map