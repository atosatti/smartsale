declare class GoogleOAuthService {
    private clientId;
    private clientSecret;
    private redirectUri;
    constructor();
    /**
     * Gera a URL de autorização do Google
     */
    getAuthorizationUrl(state?: string): string;
    /**
     * Troca o código de autorização por tokens
     */
    exchangeCodeForToken(code: string): Promise<any>;
    /**
     * Extrai informações do usuário do id_token (JWT) sem chamar API externa
     */
    getUserInfoFromIdToken(idToken: string): {
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        picture: any;
    };
    /**
     * Obtém informações do usuário do Google
     * Primeiro tenta usar id_token (JWT), se não houver tenta access_token
     */
    getUserInfo(accessToken: string, idToken?: string): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        picture: any;
    }>;
    /**
     * Verifica se o token é válido
     */
    verifyToken(accessToken: string): Promise<boolean>;
}
declare const _default: GoogleOAuthService;
export default _default;
//# sourceMappingURL=googleOAuthService.d.ts.map