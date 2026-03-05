import dotenv from 'dotenv';

dotenv.config();

export const shopeeConfig = {
  // Partner credentials
  partnerId: process.env.SHOPEE_PARTNER_ID || '',
  partnerKey: process.env.SHOPEE_PARTNER_KEY || '',

  // API Endpoints
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://partner.shopeemobile.com/api/v2'
    : 'https://partner.test-stable.shopeemobile.com/api/v2',

  // OAuth
  redirectUri: process.env.SHOPEE_OAUTH_REDIRECT_URI || 'http://localhost:3001/api/oauth/shopee/callback',
  
  // Rate limiting
  rateLimitPerMinute: 100,
  
  // Token timing
  accessTokenTTL: 4 * 60 * 60, // 4 hours in seconds
  refreshTokenTTL: 30 * 24 * 60 * 60, // 30 days in seconds
  refreshMargin: 15 * 60, // Refresh 15 minutes before expiry

  // Cache TTL (in seconds)
  cache: {
    productPrice: 15 * 60, // 15 minutes
    productVariations: 30 * 60, // 30 minutes
    productReviews: 60 * 60, // 1 hour
    shopInfo: 60 * 60, // 1 hour
    categories: 24 * 60 * 60, // 24 hours
  },

  // API Endpoints mapping
  endpoints: {
    // Auth
    authPartner: '/shop/auth_partner',
    tokenGet: '/auth/token/get',
    tokenRefresh: '/auth/access_token/get',

    // Products
    getItemList: '/product/get_item_list',
    getItemBaseInfo: '/product/get_item_base_info',
    getModelList: '/product/get_model_list',
    getComment: '/product/get_comment',
    getItemExtraInfo: '/product/get_item_extra_info',

    // Shop
    getShopInfo: '/shop/get_shop_info',
    getCategory: '/product/get_category',
  },
};

export default shopeeConfig;
