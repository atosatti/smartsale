import { ShopeeOAuthToken } from '../models/types.js';
interface ShopeeTokenResponse {
    access_token: string;
    refresh_token: string;
    expire_in: number;
    shop_id: string;
}
declare class ShopeeOAuthService {
    private partnerId;
    private partnerKey;
    private baseUrl;
    constructor();
    /**
     * Gera assinatura HMAC-SHA256 conforme documento Shopee
     * base_string = partner_id + api_path + timestamp + access_token + shop_id
     * sign = HMAC-SHA256(base_string, partner_key)
     */
    private generateSignature;
    /**
     * Gera URL de autorização para o vendedor
     * Redireciona para Shopee OAuth login
     */
    generateAuthorizationUrl(): string;
    /**
     * Troca o código de autorização por access_token
     * Executado no callback após o vendedor autorizar
     */
    exchangeCodeForToken(code: string, shopId: string): Promise<ShopeeTokenResponse>;
    /**
     * Renova access_token usando refresh_token
     * Deve ser chamado antes do access_token expirar (margem 15 min)
     */
    refreshAccessToken(refreshToken: string, shopId: string): Promise<string>;
    /**
     * Salva token OAuth no banco de dados
     * Encriptado para segurança
     */
    saveToken(shopId: string, userId: number, accessToken: string, refreshToken: string, expiresIn: number, shopInfo?: any): Promise<ShopeeOAuthToken>;
    /**
     * Obtém token ativo para uma loja específica
     */
    getShopToken(shopId: string): Promise<ShopeeOAuthToken | null>;
    /**
     * Valida e renova token se necessário (margem 15 min)
     */
    validateAndRefreshToken(shopId: string): Promise<string>;
    /**
     * Desconectar uma loja (revogar autorização)
     */
    disconnectShop(shopId: string): Promise<boolean>;
    /**
     * Lista todas as lojas autorizadas
     */
    listAuthorizedShops(userId?: number): Promise<ShopeeOAuthToken[]>;
}
declare const _default: ShopeeOAuthService;
export default _default;
//# sourceMappingURL=shopeeOAuthService.d.ts.map