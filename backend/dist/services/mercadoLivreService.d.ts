interface MercadoLivreSearchParams {
    query: string;
    limit?: number;
    offset?: number;
    category?: string;
    sort?: 'price_asc' | 'price_desc' | 'relevance';
    userId?: number;
}
interface SellerItemsSearchParams {
    sellerId: number;
    limit?: number;
    offset?: number;
    search_type?: 'normal' | 'scan';
    scroll_id?: string;
    include_filters?: boolean;
    status?: 'active' | 'paused' | 'closed' | 'pending' | 'not_yet_active' | 'programmed';
    sub_status?: 'deleted' | 'forbidden' | 'freezed' | 'held' | 'suspended' | 'waiting_for_patch' | 'warning';
    orders?: 'stop_time_asc' | 'stop_time_desc' | 'start_time_asc' | 'start_time_desc' | 'price_asc' | 'price_desc' | 'available_quantity_asc' | 'available_quantity_desc' | 'last_updated_asc' | 'last_updated_desc' | 'inventory_id_asc';
    sku?: string;
    seller_sku?: string;
    missing_product_identifiers?: boolean;
    buying_mode?: 'buy_it_now' | 'classified' | 'auction';
    listing_type_id?: 'gold_pro' | 'gold_special' | 'gold_premium' | 'gold' | 'silver' | 'bronze' | 'free';
    shipping_mode?: string;
    shipping_free_methods?: string;
    shipping_tags?: string;
    listing_source?: 'tucarro' | 'tuinmueble' | 'tumoto' | 'tulancha' | 'autoplaza' | 'autoplaza_ml';
    reputation_health_gauge?: 'healthy' | 'warning' | 'unhealthy';
    labels?: Array<'few_available' | 'with_bids' | 'without_bids' | 'accepts_mercadopago' | 'ending_soon' | 'with_mercadolibre_envios' | 'without_mercadolibre_envios' | 'with_low_quality_image' | 'with_free_shipping' | 'without_free_shipping' | 'with_automatic_relist' | 'waiting_for_payment' | 'suspended' | 'cancelled' | 'being_reviewed' | 'fix_required' | 'waiting_for_documentation' | 'without_stock' | 'incomplete_technical_specs' | 'loyalty_discount_eligible' | 'with_fbm_contingency' | 'with_shipping_self_service'>;
    logistic_type?: string;
}
interface PublicSearchFilters {
    q?: string;
    seller_id?: number;
    nickname?: string;
    category?: string;
    price_min?: number;
    price_max?: number;
    condition?: 'new' | 'used';
    shipping?: 'free';
    sort?: 'price_asc' | 'price_desc' | 'relevance' | 'stop_time_asc' | 'stop_time_desc';
    limit?: number;
    offset?: number;
}
interface Product {
    id: string;
    title: string;
    price: number;
    currency: string;
    thumbnail: string;
    condition: string;
    seller: {
        id: number;
        nickname: string;
        type: string;
    };
    shipping: {
        free_shipping: boolean;
    };
    attributes?: Array<{
        name: string;
        value_name: string;
    }>;
}
interface ProductDetails {
    id: string;
    title: string;
    price: number;
    currency: string;
    initial_quantity: number;
    sold_quantity: number;
    available_quantity: number;
    condition: string;
    description: {
        plain_text: string;
    };
    pictures: Array<{
        url: string;
        secure_url: string;
    }>;
    category_id: string;
    category_name: string;
    seller_id: number;
    attributes?: Array<{
        name: string;
        value_name: string;
    }>;
}
declare class MercadoLivreService {
    private apiClient;
    private baseURL;
    private cache;
    private cacheTTL;
    private appId;
    private secretKey;
    constructor();
    /**
     * Obter token OAuth do usuário
     */
    private getUserOAuthToken;
    searchProducts(params: MercadoLivreSearchParams): Promise<Product[]>;
    /**
     * Obter detalhes completos do produto
     */
    getProductDetails(productId: string): Promise<ProductDetails>;
    /**
     * ✨ NOVO: Buscar itens de um vendedor (dados REAIS, não referenciais)
     * Recomendado pela documentação oficial ML
     * GET /users/{user_id}/items/search
     *
     * Retorna `available_quantity` com valores REAIS (não referencial)
     * Requer token OAuth do seller
     */
    searchSellerItems(params: SellerItemsSearchParams, userToken?: string): Promise<any>;
    /**
     * ✨ NOVO: Verificar restrições de um seller
     * GET /users/{user_id}/items/search/restrictions
     *
     * Se vendedor tem 200k+ itens:
     * - aggregations_allowed: false (não retorna filters/available_filters)
     * - query_allowed: true (pode buscar)
     * - sort_allowed: true (pode ordenar)
     */
    getSellerRestrictions(sellerId: number, userToken?: string): Promise<any>;
    /**
     * ✨ NOVO: Buscar múltiplos itens em 1 requisição (Multiget)
     * GET /items?ids=$ID1,$ID2,...&attributes=$FIELD1,$FIELD2
     *
     * Vantagem: Reduzir 20 requisições em 1 chamada
     * Máximo: 20 IDs por requisição
     * Retorna response verbose com status code por item
     */
    getItemsMulti(itemIds: string[], attributes?: string[]): Promise<any>;
    /**
     * ✨ NOVO: Buscar múltiplos usuários em 1 requisição
     * GET /users?ids=$USER1,$USER2
     *
     * Máximo: 20 usuários por requisição
     */
    getUsersMulti(userIds: number[]): Promise<any>;
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
    searchPublicWithFilters(filters: PublicSearchFilters): Promise<any>;
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
    findCompetitors(productId: string): Promise<Product[]>;
    /**
     * Buscar produtos por categoria
     */
    searchByCategory(categoryId: string, limit?: number): Promise<Product[]>;
    /**
     * Obter histórico de preços de um produto
     */
    getPriceHistory(productId: string): Promise<Array<{
        date: string;
        price: number;
    }>>;
    /**
     * Limpar cache (útil para testes)
     */
    clearCache(): void;
    /**
     * Mapear resposta da API para objeto Product
     */
    private mapProduct;
    /**
     * Mapear resposta detalhada do produto
     */
    private mapProductDetails;
    /**
     * Mapear informações do vendedor
     */
    private mapSellerInfo;
    /**
     * Mapear parâmetro de ordenação
     */
    private mapSortParam;
    /**
     * Extrair palavras-chave do título
     */
    private extractKeywords;
    /**
     * Tratamento de erros
     */
    private handleError;
    /**
     * Testar conexão com a API real do Mercado Livre (sem fallback para mock)
     */
    testAPIConnection(): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }>;
    /**
     * Comparar múltiplos produtos
     */
    compareProducts(productIds: string[]): Promise<any>;
}
declare const _default: MercadoLivreService;
export default _default;
//# sourceMappingURL=mercadoLivreService.d.ts.map