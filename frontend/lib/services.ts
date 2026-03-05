import api from './api';
import { Product, ProductDetails } from '../store/productStore';

export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => api.post('/auth/register', data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  verify2FA: (token: string, twoFAToken: string) =>
    api.post('/auth/verify-2fa', { token, twoFAToken }),

  setup2FA: () => api.get('/auth/setup-2fa'),

  confirm2FA: (secret: string, token: string) =>
    api.post('/auth/confirm-2fa', { secret, token }),

  updateProfile: (data: { first_name: string; last_name: string }) =>
    api.put('/auth/profile', data),

  getCurrentUser: () => api.get('/auth/me'),

  getProfile: () => api.get('/auth/profile'),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => api.post('/auth/change-password', data),
};

export const productAPI = {
  /**
   * Busca produtos no Mercado Livre
   * @param query - Termo de busca (para busca pública)
   * @param limit - Número máximo de resultados (padrão: 50)
   * @param offset - Número de resultados a pular (paginação)
   * @param sort - Ordenação: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
   * @param category - ID de categoria (opcional)
   * @param additionalFilters - Filtros adicionais (preço, condição, etc)
   * @param searchMode - 'public' para busca geral | 'seller' para itens de vendedor
   * @param sellerId - ID do vendedor (necessário para searchMode='seller')
   */
  search: (
    query: string = '',
    limit = 50,
    offset = 0,
    sort = 'relevance',
    category?: string,
    additionalFilters?: Record<string, any>,
    searchMode: 'public' | 'seller' = 'public',
    sellerId?: string | null
  ) => {
    // Construir parâmetros base
    let endpoint = '/products/search';
    const params: Record<string, any> = {
      limit,
      offset,
      sort,
      search_mode: searchMode,
      ...(query && { query }),
      ...(category && { category }),
      ...(sellerId && { seller_id: sellerId }),
    };

    // Adicionar filtros adicionais
    if (additionalFilters) {
      Object.keys(additionalFilters).forEach((key) => {
        const value = additionalFilters[key];
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });
    }

    return api.get<{ success: boolean; count: number; data: Product[] }>(endpoint, {
      params,
    });
  },

  /**
   * Obtém detalhes completos de um produto
   */
  getDetails: (productId: string) =>
    api.get<{ success: boolean; data: ProductDetails }>(`/products/${productId}`),

  /**
   * Encontra produtos concorrentes
   */
  getCompetitors: (productId: string) =>
    api.get<{ success: boolean; count: number; data: Product[] }>(
      `/products/${productId}/competitors`
    ),

  /**
   * Obtém informações do vendedor
   */
  getSellerInfo: (sellerId: string) =>
    api.get(`/products/seller/${sellerId}`),

  /**
   * Busca por categoria
   */
  searchByCategory: (categoryId: string, limit = 50) =>
    api.get<{ success: boolean; count: number; data: Product[] }>(
      `/products/category/${categoryId}`,
      { params: { limit } }
    ),

  /**
   * Salva um produto para análise posterior
   */
  saveProduct: (data: {
    name: string;
    description?: string;
    productId: string;
    price: number;
    seller: any;
  }) => api.post('/products/save', data),

  /**
   * Obtém todos os produtos salvos pelo usuário
   */
  getSavedProducts: () =>
    api.get<{ success: boolean; count: number; data: any[] }>('/products/saved'),
};

export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),

  createSubscription: (planId: string, paymentMethodId: string) =>
    api.post('/subscriptions/create', { planId, paymentMethodId }),

  cancelSubscription: () => api.post('/subscriptions/cancel'),

  getUserSubscription: () => api.get('/subscriptions/my-subscription'),
};

export const mercadoLivreAPI = {
  searchProducts: (query: string, limit: number = 20, offset: number = 0, sort?: string) =>
    api.post('/mercado-livre/search', { query, limit, offset, sort }),

  getProductDetails: (productId: string) =>
    api.get(`/mercado-livre/product/${productId}`),

  compareProducts: (productIds: string[]) =>
    api.post('/mercado-livre/compare', { productIds }),

  getPriceHistory: (productId: string) =>
    api.get(`/mercado-livre/price-history/${productId}`),
};
