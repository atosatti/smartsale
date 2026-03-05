interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    user_id: number;
    refresh_token?: string;
}
interface OAuthUserInfo {
    id: number;
    nickname: string;
    email: string;
    site_id: string;
}
declare class OAuthService {
    private appId;
    private secretKey;
    private redirectUri;
    private codeVerifierCache;
    /**
     * Gerar um code verifier para PKCE
     */
    private generateCodeVerifier;
    /**
     * Gerar code challenge a partir do code verifier
     */
    private generateCodeChallenge;
    /**
     * Gerar URL de autorização para Mercado Livre com PKCE
     */
    getAuthorizationUrl(): string;
    /**
     * Recuperar code_verifier pelo state
     */
    private getCodeVerifier;
    /**
     * Trocar código de autorização por access token com PKCE
     */
    exchangeCodeForToken(code: string, state?: string): Promise<OAuthTokenResponse>;
    /**
     * Obter informações do usuário autenticado
     */
    getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
    /**
     * Renovar access token usando refresh token
     */
    refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse>;
    /**
     * Gerar state aleatório para segurança CSRF
     */
    private generateState;
    /**
     * Validar state para segurança CSRF
     */
    validateState(state: string, sessionState: string): boolean;
    /**
     * Criar um usuário de teste no Mercado Livre
     * Requer um access token válido
     */
    createTestUser(accessToken: string, siteId?: string): Promise<{
        id: number;
        nickname: string;
        password: string;
        site_status: string;
    }>;
}
declare const _default: OAuthService;
export default _default;
//# sourceMappingURL=oauthService.d.ts.map