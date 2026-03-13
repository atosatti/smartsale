import crypto from 'crypto';
import axios, { AxiosError } from 'axios';
import shopeeConfig from '../config/shopee.js';
import pool from '../config/database.js';
class ShopeeOAuthService {
    constructor() {
        this.partnerId = shopeeConfig.partnerId;
        this.partnerKey = shopeeConfig.partnerKey;
        this.baseUrl = shopeeConfig.baseUrl;
        if (!this.partnerId || !this.partnerKey) {
            console.warn('⚠️ Warning: SHOPEE_PARTNER_ID or SHOPEE_PARTNER_KEY not configured');
        }
    }
    /**
     * Gera assinatura HMAC-SHA256 conforme documento Shopee
     * base_string = partner_id + api_path + timestamp + access_token + shop_id
     * sign = HMAC-SHA256(base_string, partner_key)
     */
    generateSignature(path, timestamp, accessToken, shopId) {
        const baseString = `${this.partnerId}${path}${timestamp}${accessToken || ''}${shopId || ''}`;
        return crypto
            .createHmac('sha256', this.partnerKey)
            .update(baseString)
            .digest('hex');
    }
    /**
     * Gera URL de autorização para o vendedor
     * Redireciona para Shopee OAuth login
     */
    generateAuthorizationUrl() {
        const timestamp = Math.floor(Date.now() / 1000);
        const path = shopeeConfig.endpoints.authPartner;
        const sign = this.generateSignature(path, timestamp);
        const authUrl = `${this.baseUrl}${path}` +
            `?partner_id=${this.partnerId}` +
            `&timestamp=${timestamp}` +
            `&sign=${sign}` +
            `&redirect=${encodeURIComponent(shopeeConfig.redirectUri)}`;
        console.log('[ShopeeOAuth] Generated authorization URL');
        return authUrl;
    }
    /**
     * Troca o código de autorização por access_token
     * Executado no callback após o vendedor autorizar
     */
    async exchangeCodeForToken(code, shopId) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = shopeeConfig.endpoints.tokenGet;
            const sign = this.generateSignature(path, timestamp);
            console.log(`[ShopeeOAuth] Exchanging code for token - Shop: ${shopId}`);
            const response = await axios.post(`${this.baseUrl}${path}`, {
                code,
                shop_id: shopId,
                partner_id: this.partnerId,
                timestamp,
                sign,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            if (!response.data || response.data.error) {
                throw new Error(`Shopee API error: ${response.data?.error_description || 'Unknown error'}`);
            }
            console.log(`[ShopeeOAuth] Successfully obtained access token for shop ${shopId}`);
            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                expire_in: response.data.expire_in || shopeeConfig.accessTokenTTL,
                shop_id: shopId,
            };
        }
        catch (error) {
            console.error('[ShopeeOAuth] Error exchanging code for token:', error);
            if (error instanceof AxiosError) {
                console.error('  Shopee API Response:', error.response?.data);
            }
            throw new Error(`Failed to exchange code for token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Renova access_token usando refresh_token
     * Deve ser chamado antes do access_token expirar (margem 15 min)
     */
    async refreshAccessToken(refreshToken, shopId) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = shopeeConfig.endpoints.tokenRefresh;
            const sign = this.generateSignature(path, timestamp);
            console.log(`[ShopeeOAuth] Refreshing access token for shop ${shopId}`);
            const response = await axios.post(`${this.baseUrl}${path}`, {
                refresh_token: refreshToken,
                partner_id: this.partnerId,
                shop_id: shopId,
                timestamp,
                sign,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            if (!response.data || response.data.error) {
                throw new Error(`Shopee API error: ${response.data?.error_description || 'Unknown error'}`);
            }
            console.log(`[ShopeeOAuth] Successfully refreshed access token for shop ${shopId}`);
            return response.data.access_token;
        }
        catch (error) {
            console.error('[ShopeeOAuth] Error refreshing access token:', error);
            if (error instanceof AxiosError) {
                console.error('  Shopee API Response:', error.response?.data);
            }
            throw new Error(`Failed to refresh access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Salva token OAuth no banco de dados
     * Encriptado para segurança
     */
    async saveToken(shopId, userId, accessToken, refreshToken, expiresIn, shopInfo) {
        try {
            const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
            const refreshTokenExpiresAt = new Date(Date.now() + shopeeConfig.refreshTokenTTL * 1000);
            // Verificar se token já existe para este shop
            const [existingTokens] = await pool.query('SELECT id FROM oauth_tokens WHERE provider = ? AND provider_user_id = ? LIMIT 1', ['shopee', shopId]);
            let result;
            if (existingTokens.length > 0) {
                // Atualizar token existente
                [result] = await pool.query(`UPDATE oauth_tokens 
           SET access_token = ?, 
               refresh_token = ?, 
               expires_at = ?, 
               is_active = TRUE,
               updated_at = NOW()
           WHERE provider = ? AND provider_user_id = ?`, [accessToken, refreshToken, tokenExpiresAt, 'shopee', shopId]);
                console.log(`[ShopeeOAuth] Updated existing token for shop ${shopId}`);
            }
            else {
                // Criar novo token
                [result] = await pool.query(`INSERT INTO oauth_tokens 
           (provider, access_token, refresh_token, expires_at, provider_user_id, scope, is_active, created_by, created_at)
           VALUES (?, ?, ?, ?, ?, ?, TRUE, ?, NOW())`, ['shopee', accessToken, refreshToken, tokenExpiresAt, shopId, 'products.read,shop.read', userId]);
                console.log(`[ShopeeOAuth] Saved new token for shop ${shopId}`);
            }
            return {
                shop_id: shopId,
                user_id: userId,
                access_token: accessToken,
                refresh_token: refreshToken,
                token_expires_at: tokenExpiresAt,
                refresh_token_expires_at: refreshTokenExpiresAt,
                shop_name: shopInfo?.shop_name,
                shop_rating: shopInfo?.shop_rating,
                shop_follower_count: shopInfo?.follower_count,
                is_preferred_seller: shopInfo?.is_preferred_seller,
                is_verified: shopInfo?.is_verified,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            };
        }
        catch (error) {
            console.error('[ShopeeOAuth] Error saving token:', error);
            throw new Error(`Failed to save token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Obtém token ativo para uma loja específica
     */
    async getShopToken(shopId) {
        try {
            const [tokens] = await pool.query(`SELECT * FROM oauth_tokens 
         WHERE provider = 'shopee' AND provider_user_id = ? AND is_active = TRUE
         LIMIT 1`, [shopId]);
            if (tokens.length === 0) {
                return null;
            }
            const token = tokens[0];
            return {
                shop_id: shopId,
                user_id: token.created_by,
                access_token: token.access_token,
                refresh_token: token.refresh_token,
                token_expires_at: new Date(token.expires_at),
                is_active: token.is_active,
                created_at: new Date(token.created_at),
                updated_at: new Date(token.updated_at),
            };
        }
        catch (error) {
            console.error('[ShopeeOAuth] Error getting shop token:', error);
            return null;
        }
    }
    /**
     * Valida e renova token se necessário (margem 15 min)
     */
    async validateAndRefreshToken(shopId) {
        try {
            const token = await this.getShopToken(shopId);
            if (!token) {
                throw new Error(`No token found for shop ${shopId}`);
            }
            // Verificar se precisa renovar (margem 15 min)
            const now = Date.now();
            const refreshThreshold = shopeeConfig.refreshMargin * 1000;
            if (token.token_expires_at.getTime() - now < refreshThreshold) {
                console.log(`[ShopeeOAuth] Token expiring soon for shop ${shopId}, refreshing...`);
                const newAccessToken = await this.refreshAccessToken(token.refresh_token, shopId);
                // Atualizar no banco
                const tokenExpiresAt = new Date(Date.now() + shopeeConfig.accessTokenTTL * 1000);
                await pool.query('UPDATE oauth_tokens SET access_token = ?, expires_at = ? WHERE provider = ? AND provider_user_id = ?', [newAccessToken, tokenExpiresAt, 'shopee', shopId]);
                return newAccessToken;
            }
            return token.access_token;
        }
        catch (error) {
            console.error('[ShopeeOAuth] Error validating/refreshing token:', error);
            throw error;
        }
    }
    /**
     * Desconectar uma loja (revogar autorização)
     */
    async disconnectShop(shopId) {
        try {
            const [result] = await pool.query('UPDATE oauth_tokens SET is_active = FALSE, updated_at = NOW() WHERE provider = ? AND provider_user_id = ?', ['shopee', shopId]);
            console.log(`[ShopeeOAuth] Disconnected shop ${shopId}`);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error('[ShopeeOAuth] Error disconnecting shop:', error);
            throw error;
        }
    }
    /**
     * Lista todas as lojas autorizadas
     */
    async listAuthorizedShops(userId) {
        try {
            let query = 'SELECT * FROM oauth_tokens WHERE provider = ? AND is_active = TRUE';
            const params = ['shopee'];
            if (userId) {
                query += ' AND created_by = ?';
                params.push(userId);
            }
            const [tokens] = await pool.query(query, params);
            return tokens.map((token) => ({
                shop_id: token.provider_user_id,
                user_id: token.created_by,
                access_token: token.access_token,
                refresh_token: token.refresh_token,
                token_expires_at: new Date(token.expires_at),
                is_active: token.is_active,
                created_at: new Date(token.created_at),
                updated_at: new Date(token.updated_at),
            }));
        }
        catch (error) {
            console.error('[ShopeeOAuth] Error listing authorized shops:', error);
            return [];
        }
    }
}
export default new ShopeeOAuthService();
//# sourceMappingURL=shopeeOAuthService.js.map