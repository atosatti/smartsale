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
    platform: string;
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
//# sourceMappingURL=types.d.ts.map