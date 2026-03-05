export interface User {
  id: number;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  google_id?: string;
  facebook_id?: string;
  two_fa_enabled: boolean;
  two_fa_secret?: string;
  subscription_plan: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';
  is_verified: boolean;
  is_active: boolean;
  role: 'user' | 'admin';
  admin_notes?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  billing_email?: string;
  billing_name?: string;
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ProductPrice {
  id: number;
  product_id: number;
  platform: string; // amazon, mercado_livre, shopee, etc
  price: number;
  currency: string;
  url: string;
  in_stock: boolean;
  rating: number;
  reviews_count: number;
  last_updated: Date;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  start_date: Date;
  end_date?: Date;
  stripe_subscription_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AdminAuditLog {
  id: number;
  admin_user_id: number;
  target_user_id?: number;
  action: string;
  resource_type?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface SearchLog {
  id: number;
  user_id: number;
  search_query: string;
  results_count: number;
  created_at: Date;
}
export interface OAuthToken {
  id: number;
  provider: string;
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number;
  expires_at?: Date;
  scope?: string;
  provider_user_id?: string;
  is_active: boolean;
  created_by: number;
  created_at: Date;
  updated_by?: number;
  updated_at: Date;
  last_refreshed_at?: Date;
}

export interface OAuthTokenAuditLog {
  id: number;
  oauth_token_id?: number;
  provider: string;
  action: 'connect' | 'refresh' | 'disconnect' | 'rotate';
  reason?: string;
  admin_user_id: number;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface AppSetting {
  id: number;
  setting_key: string;
  setting_value?: string;
  data_type: 'string' | 'json' | 'boolean' | 'number';
  created_by?: number;
  created_at: Date;
  updated_by?: number;
  updated_at: Date;
}

export interface AppSettingAuditLog {
  id: number;
  setting_key: string;
  action: 'create' | 'update' | 'delete';
  old_value?: string;
  new_value?: string;
  admin_user_id: number;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// ===== SHOPEE TYPES =====

export interface ShopeeOAuthToken {
  id?: number;
  shop_id: string; // Shopee shop_id (único por loja)
  user_id: number; // SmartSale user_id (admin que autorizou)
  access_token: string; // Token de forma encrypted no DB
  refresh_token: string; // Refresh token encrypted no DB
  token_expires_at: Date; // Quando access_token expira (4h)
  refresh_token_expires_at?: Date; // Quando refresh_token expira (30d)
  shop_name?: string;
  shop_rating?: number;
  shop_follower_count?: number;
  shop_status?: 'normal' | 'banned' | 'suspended'; // Status da loja
  is_preferred_seller?: boolean; // Shopee Mall / Preferred Seller
  is_verified?: boolean;
  last_refreshed_at?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ShopeeProductInfo {
  item_id: string;
  shop_id: string;
  item_name: string;
  description: string;
  price: number;
  discount_price?: number;
  currency: string;
  stock_count: number;
  sold_count?: number;
  rating: number;
  review_count: number;
  image_url?: string;
  images?: string[];
  category_id: string;
  brand?: string;
  status: 'NORMAL' | 'BANNED' | 'DELETED';
  condition?: 'NEW' | 'USED';
  weight?: number;
  dimensions?: {
    height: number;
    length: number;
    width: number;
  };
}

export interface ShopeeProductVariation {
  model_id: string;
  item_id: string;
  shop_id: string;
  price: number;
  discount_price?: number;
  stock: number;
  sku: string;
  tier_index?: number[];
  tier_variation?: Array<{
    name: string;
    option: string;
  }>;
}

export interface ShopeeShopInfo {
  shop_id: string;
  shop_name: string;
  shop_rating: number;
  response_rate: number;
  response_time?: string;
  follower_count: number;
  shop_status: 'NORMAL' | 'BANNED' | 'SUSPENDED';
  is_preferred_seller: boolean;
  is_verified: boolean;
  is_shopee_mall: boolean;
  region?: string;
  location?: string;
}

export interface ShopeeReview {
  comment_id: string;
  item_id: string;
  shop_id: string;
  author?: string;
  rating: number;
  comment_text: string;
  images?: string[];
  reply_time?: Date;
  reply_text?: string;
  created_at: Date;
}