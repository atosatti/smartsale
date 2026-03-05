import { OAuthToken } from '../models/types.js';
declare class OAuthTokenService {
    /**
     * Obter o token ativo de um provider
     */
    getActiveToken(provider: string): Promise<OAuthToken | null>;
    /**
     * Salvar novo token OAuth
     */
    saveToken(provider: string, accessToken: string, refreshToken: string | null, expiresIn: number | null, providerUserId: string | null, scope: string | null, adminUserId: number, ipAddress?: string, userAgent?: string): Promise<OAuthToken>;
    /**
     * Atualizar token (refresh)
     */
    refreshToken(tokenId: number, newAccessToken: string, newRefreshToken?: string, newExpiresIn?: number, adminUserId?: number, ipAddress?: string, userAgent?: string): Promise<OAuthToken>;
    /**
     * Verificar se token está expirado
     */
    isTokenExpired(token: OAuthToken): boolean;
    /**
     * Obter token ativo e renovar automaticamente se expirado
     * Retorna token válido pronto para usar
     */
    getActiveTokenWithAutoRefresh(provider: string): Promise<OAuthToken | null>;
    /**
     * Desconectar token
     */
    disconnectToken(provider: string, adminUserId: number, ipAddress?: string, userAgent?: string): Promise<void>;
    /**
     * Registrar ação na auditoria
     */
    private logAuditToken;
}
declare const _default: OAuthTokenService;
export default _default;
//# sourceMappingURL=oauthTokenService.d.ts.map