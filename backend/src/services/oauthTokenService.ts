import pool from '../config/database.js';
import { OAuthToken, OAuthTokenAuditLog } from '../models/types.js';

class OAuthTokenService {
  /**
   * Obter o token ativo de um provider
   */
  async getActiveToken(provider: string): Promise<OAuthToken | null> {
    try {
      const [tokens] = await pool.query(
        `SELECT * FROM oauth_tokens 
         WHERE provider = ? AND is_active = TRUE
         LIMIT 1`,
        [provider]
      );

      return (tokens as OAuthToken[])[0] || null;
    } catch (error) {
      console.error(`[OAuthTokenService] Erro ao buscar token ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Salvar novo token OAuth
   */
  async saveToken(
    provider: string,
    accessToken: string,
    refreshToken: string | null,
    expiresIn: number | null,
    providerUserId: string | null,
    scope: string | null,
    adminUserId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<OAuthToken> {
    try {
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
      const now = new Date();

      // Usar INSERT ... ON DUPLICATE KEY UPDATE para evitar erro de duplicate
      const [result] = await pool.query(
        `INSERT INTO oauth_tokens 
         (provider, access_token, refresh_token, token_type, expires_in, expires_at, scope, provider_user_id, is_active, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
         ON DUPLICATE KEY UPDATE
         access_token = VALUES(access_token),
         refresh_token = VALUES(refresh_token),
         expires_in = VALUES(expires_in),
         expires_at = VALUES(expires_at),
         scope = VALUES(scope),
         provider_user_id = VALUES(provider_user_id),
         is_active = TRUE,
         updated_at = NOW()`,
        [provider, accessToken, refreshToken, 'Bearer', expiresIn, expiresAt, scope, providerUserId, adminUserId, now]
      );

      // Log na auditoria
      await this.logAuditToken(
        (result as any).insertId || (result as any).affectedRows,
        provider,
        'connect',
        `Token do ${provider} atualizado/conectado`,
        adminUserId,
        ipAddress,
        userAgent
      );return {
        id: (result as any).insertId,
        provider,
        access_token: accessToken,
        refresh_token: refreshToken || undefined,
        token_type: 'Bearer',
        expires_in: expiresIn || undefined,
        expires_at: expiresAt || undefined,
        scope: scope || undefined,
        provider_user_id: providerUserId || undefined,
        is_active: true,
        created_by: adminUserId,
        created_at: now,
        updated_at: new Date()
      };
    } catch (error) {
      console.error(`[OAuthTokenService] Erro ao salvar token ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Atualizar token (refresh)
   */
  async refreshToken(
    tokenId: number,
    newAccessToken: string,
    newRefreshToken?: string,
    newExpiresIn?: number,
    adminUserId?: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<OAuthToken> {
    try {
      const [tokens] = await pool.query(
        `SELECT * FROM oauth_tokens WHERE id = ?`,
        [tokenId]
      );

      const token = (tokens as OAuthToken[])[0];
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const expiresAt = newExpiresIn ? new Date(Date.now() + newExpiresIn * 1000) : token.expires_at;

      // Atualizar token
      await pool.query(
        `UPDATE oauth_tokens 
         SET access_token = ?, 
             refresh_token = COALESCE(?, refresh_token),
             expires_in = COALESCE(?, expires_in),
             expires_at = ?,
             last_refreshed_at = NOW(),
             updated_by = COALESCE(?, updated_by)
         WHERE id = ?`,
        [newAccessToken, newRefreshToken || null, newExpiresIn || null, expiresAt, adminUserId || null, tokenId]
      );

      // Log na auditoria
      await this.logAuditToken(
        tokenId,
        token.provider,
        'refresh',
        'Token renovado com sucesso',
        adminUserId || 0,
        ipAddress,
        userAgent
      );return {
        ...token,
        access_token: newAccessToken,
        refresh_token: newRefreshToken || token.refresh_token,
        expires_in: newExpiresIn || token.expires_in,
        expires_at: expiresAt,
        last_refreshed_at: new Date(),
        updated_by: adminUserId,
        updated_at: new Date()
      };
    } catch (error) {
      console.error(`[OAuthTokenService] Erro ao renovar token:`, error);
      throw error;
    }
  }

  /**
   * Verificar se token está expirado
   */
  isTokenExpired(token: OAuthToken): boolean {
    if (!token.expires_at) {
      return false; // Token sem expiração
    }

    const now = new Date();
    const expiresAt = new Date(token.expires_at);
    
    // Considerar expirado 5 minutos antes da data real (buffer)
    const bufferMs = 5 * 60 * 1000;
    return now.getTime() >= (expiresAt.getTime() - bufferMs);
  }

  /**
   * Obter token ativo e renovar automaticamente se expirado
   * Retorna token válido pronto para usar
   */
  async getActiveTokenWithAutoRefresh(provider: string): Promise<OAuthToken | null> {
    try {
      const token = await this.getActiveToken(provider);
      
      if (!token) {
        return null;
      }

      // Se não está expirado, retornar normalmente
      if (!this.isTokenExpired(token)) {return token;
      }

      // Token expirado - tentar renovar se houver refresh_token
      if (!token.refresh_token) {
        console.warn(`[OAuthTokenService] ⚠️ Token ${provider} expirado sem refresh_token disponível`);
        return null;
      }try {
        // Renovar token com Mercado Livre
        const response = await fetch('https://api.mercadolibre.com/oauth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: process.env.MERCADO_LIVRE_APP_ID || '',
            client_secret: process.env.MERCADO_LIVRE_SECRET_KEY || '',
            refresh_token: token.refresh_token
          })
        });

        if (!response.ok) {
          const error = await response.json() as any;
          console.error(`[OAuthTokenService] Erro ao renovar token ${provider}:`, error);
          return null;
        }

        const data = await response.json() as any;

        // Atualizar token no banco
        await this.refreshToken(
          token.id,
          data.access_token,
          data.refresh_token,
          data.expires_in,
          0, // adminUserId = 0 para renovação automática
          '0.0.0.0', // IP para sistema automático
          'auto-renewal'
        );// Retornar token atualizado
        const updatedToken = await this.getActiveToken(provider);
        return updatedToken;
      } catch (refreshError: any) {
        console.error(`[OAuthTokenService] Falha ao renovar token ${provider}:`, refreshError.message);
        return null;
      }
    } catch (error) {
      console.error(`[OAuthTokenService] Erro em getActiveTokenWithAutoRefresh:`, error);
      throw error;
    }
  }

  /**
   * Desconectar token
   */
  async disconnectToken(
    provider: string,
    adminUserId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const [tokens] = await pool.query(
        `SELECT id FROM oauth_tokens WHERE provider = ? AND is_active = TRUE LIMIT 1`,
        [provider]
      );

      const token = (tokens as any[])[0];
      if (token) {
        await pool.query(
          `UPDATE oauth_tokens SET is_active = FALSE WHERE id = ?`,
          [token.id]
        );

        // Log na auditoria
        await this.logAuditToken(
          token.id,
          provider,
          'disconnect',
          'Token desconectado',
          adminUserId,
          ipAddress,
          userAgent
        );}
    } catch (error) {
      console.error(`[OAuthTokenService] Erro ao desconectar token:`, error);
      throw error;
    }
  }

  /**
   * Registrar ação na auditoria
   */
  private async logAuditToken(
    tokenId: number | null,
    provider: string,
    action: 'connect' | 'refresh' | 'disconnect' | 'rotate',
    reason: string,
    adminUserId: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO oauth_tokens_audit_log 
         (oauth_token_id, provider, action, reason, admin_user_id, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [tokenId, provider, action, reason, adminUserId, ipAddress || null, userAgent || null]
      );
    } catch (error) {
      console.error('[OAuthTokenService] Erro ao registrar auditoria:', error);
    }
  }
}

export default new OAuthTokenService();
