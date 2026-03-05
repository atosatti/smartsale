import axios from 'axios';
import jwt from 'jsonwebtoken';

class GoogleOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback';

    console.log('[GoogleOAuthService] Constructor chamado');
    console.log('[GoogleOAuthService] GOOGLE_CLIENT_ID present:', !!this.clientId, this.clientId.substring(0, 10) + '...***');
    console.log('[GoogleOAuthService] GOOGLE_CLIENT_SECRET present:', !!this.clientSecret, this.clientSecret.substring(0, 10) + '...***');
    console.log('[GoogleOAuthService] GOOGLE_CALLBACK_URL:', this.redirectUri);

    if (!this.clientId || !this.clientSecret) {
      console.error('[GoogleOAuthService] ❌ ERRO: Credenciais do Google não configuradas!');
      console.error('[GoogleOAuthService] Variáveis esperadas: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET');
    }
  }

  /**
   * Gera a URL de autorização do Google
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state })
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Troca o código de autorização por tokens
   */
  async exchangeCodeForToken(code: string) {
    try {
      console.log('[GoogleOAuthService] Trocando código por token...');
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code'
      });
      console.log('[GoogleOAuthService] ✅ Token obtido com sucesso');
      console.log('[GoogleOAuthService] Campos recebidos:', Object.keys(response.data).join(', '));
      return response.data;
    } catch (error: any) {
      console.error('[GoogleOAuthService] ❌ Erro ao trocar código por token:', error.response?.data || error.message);
      throw new Error('Falha ao obter token do Google');
    }
  }

  /**
   * Extrai informações do usuário do id_token (JWT) sem chamar API externa
   */
  getUserInfoFromIdToken(idToken: string) {
    try {
      console.log('[GoogleOAuthService] Decodificando id_token...');
      const decoded = jwt.decode(idToken) as any;
      
      if (!decoded) {
        throw new Error('Falha ao decodificar id_token');
      }
      
      console.log('[GoogleOAuthService] ✅ id_token decodificado com sucesso');
      console.log('[GoogleOAuthService] Email:', decoded.email);
      
      return {
        id: decoded.sub,
        email: decoded.email,
        firstName: decoded.given_name || 'User',
        lastName: decoded.family_name || '',
        picture: decoded.picture || ''
      };
    } catch (error: any) {
      console.error('[GoogleOAuthService] ❌ Erro ao decodificar id_token:', error.message);
      throw new Error('Falha ao decodificar id_token do Google');
    }
  }

  /**
   * Obtém informações do usuário do Google
   * Primeiro tenta usar id_token (JWT), se não houver tenta access_token
   */
  async getUserInfo(accessToken: string, idToken?: string) {
    try {
      // Se tiver id_token, decodifica diretamente (mais rápido e seguro)
      if (idToken) {
        console.log('[GoogleOAuthService] Usando id_token para obter informações...');
        return this.getUserInfoFromIdToken(idToken);
      }
      
      console.log('[GoogleOAuthService] ⚠️ Sem id_token, tentando access_token (pode falhar)...');
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        timeout: 5000
      });
      
      console.log('[GoogleOAuthService] ✅ Informações obtidas via API');
      return {
        id: response.data.id,
        email: response.data.email,
        firstName: response.data.given_name || 'User',
        lastName: response.data.family_name || '',
        picture: response.data.picture || ''
      };
    } catch (error: any) {
      console.error('[GoogleOAuthService] ❌ Erro ao obter informações do usuário:');
      console.error('  Status:', error.response?.status);
      console.error('  Data:', error.response?.data);
      console.error('  Message:', error.message);
      throw new Error(`Falha ao obter informações do usuário: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Verifica se o token é válido
   */
  async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default new GoogleOAuthService();
