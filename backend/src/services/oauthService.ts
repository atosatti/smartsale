import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

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

class OAuthService {
  private appId = process.env.MERCADO_LIVRE_APP_ID || '';
  private secretKey = process.env.MERCADO_LIVRE_SECRET_KEY || '';
  private redirectUri = process.env.MERCADO_LIVRE_REDIRECT_URI || 'http://localhost:3002/api/auth/mercado-livre/callback';
  private codeVerifierCache: Map<string, string> = new Map(); // Armazenar code_verifier temporariamente

  /**
   * Gerar um code verifier para PKCE
   */
  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('hex').substring(0, 128);
  }

  /**
   * Gerar code challenge a partir do code verifier
   */
  private generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Gerar URL de autorização para Mercado Livre com PKCE
   */
  getAuthorizationUrl(): string {
    const baseUrl = 'https://auth.mercadolibre.com/authorization';
    const state = this.generateState();
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    // Armazenar code_verifier usando o state como chave
    this.codeVerifierCache.set(state, codeVerifier);const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      state,
      scope: 'offline_access',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Recuperar code_verifier pelo state
   */
  private getCodeVerifier(state: string): string | null {
    const verifier = this.codeVerifierCache.get(state);
    if (verifier) {
      this.codeVerifierCache.delete(state); // Usar apenas uma vez
    }
    return verifier || null;
  }

  /**
   * Trocar código de autorização por access token com PKCE
   */
  async exchangeCodeForToken(code: string, state?: string): Promise<OAuthTokenResponse> {
    try {// Recuperar code_verifier
      const codeVerifier = state ? this.getCodeVerifier(state) : null;
      if (!codeVerifier) {
        console.warn('[OAuth] Code verifier não encontrado para state:', state);
      }

      const tokenRequest: any = {
        grant_type: 'authorization_code',
        client_id: this.appId,
        client_secret: this.secretKey,
        code,
        redirect_uri: this.redirectUri,
      };

      // Adicionar code_verifier se disponível
      if (codeVerifier) {
        tokenRequest.code_verifier = codeVerifier;
      }const response = await axios.post(
        'https://api.mercadolibre.com/oauth/token',
        tokenRequest
      );return response.data as OAuthTokenResponse;
    } catch (error: any) {
      console.error('[OAuth] Erro ao trocar código:', error.response?.data || error.message);
      throw new Error('Falha ao obter token do Mercado Livre');
    }
  }

  /**
   * Obter informações do usuário autenticado
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    try {const response = await axios.get('https://api.mercadolibre.com/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });return response.data as OAuthUserInfo;
    } catch (error: any) {
      console.error('[OAuth] Erro ao obter usuário:', error.response?.data || error.message);
      throw new Error('Falha ao obter informações do usuário');
    }
  }

  /**
   * Renovar access token usando refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokenResponse> {
    try {const response = await axios.post(
        'https://api.mercadolibre.com/oauth/token',
        {
          grant_type: 'refresh_token',
          client_id: this.appId,
          client_secret: this.secretKey,
          refresh_token: refreshToken,
        }
      );return response.data as OAuthTokenResponse;
    } catch (error: any) {
      console.error('[OAuth] Erro ao renovar token:', error.response?.data || error.message);
      throw new Error('Falha ao renovar token');
    }
  }

  /**
   * Gerar state aleatório para segurança CSRF
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Validar state para segurança CSRF
   */
  validateState(state: string, sessionState: string): boolean {
    return state === sessionState;
  }

  /**
   * Criar um usuário de teste no Mercado Livre
   * Requer um access token válido
   */
  async createTestUser(accessToken: string, siteId: string = 'MLB'): Promise<{
    id: number;
    nickname: string;
    password: string;
    site_status: string;
  }> {
    try {const response = await axios.post(
        'https://api.mercadolibre.com/users/test_user',
        {
          site_id: siteId,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );return response.data;
    } catch (error: any) {
      console.error('[OAuth Service] ❌ Erro ao criar usuário de teste');
      console.error('[OAuth Service] Status:', error.response?.status);
      console.error('[OAuth Service] Resposta:', error.response?.data);
      console.error('[OAuth Service] Mensagem:', error.message);
      throw new Error(
        `Falha ao criar usuário de teste: ${error.response?.data?.message || error.message}`
      );
    }
  }
}

export default new OAuthService();
