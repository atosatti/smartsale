import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export interface MercadoLivreStatus {
  connected: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  lastRefreshed?: Date;
  providerUserId?: string;
  connectedSince?: Date;
  hasRefreshToken?: boolean;
  hasTestUser?: boolean;
  testUserNickname?: string | null;
  message: string;
}

export interface MercadoLivreUserData {
  id: number;
  nickname: string;
  email: string;
  firstName: string;
  lastName: string;
  countryId: string;
  siteId: string;
  userType: string;
  tags: string[];
  permalink: string;
}

export const useMercadoLivreIntegration = () => {
  const [status, setStatus] = useState<MercadoLivreStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/integrations/mercado-livre/status');
      setStatus(response.data);
    } catch (err) {
      console.error('Erro ao carregar status:', err);
      setError('Erro ao carregar status de integração');
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/integrations/mercado-livre/refresh-token');
      toast.success(response.data.message || 'Token renovado com sucesso!');
      await fetchStatus();
      return true;
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMsg = errorData?.message || err.message || 'Erro ao renovar token';
      const details = errorData?.details;
      
      // Mostrar erro com detalhes se houver
      const fullError = details ? `${errorMsg} - ${details}` : errorMsg;
      toast.error(fullError);
      
      if (errorData?.action === 'reconnect') {
        setError(fullError);
      }
      
      console.error('Erro ao refresh token:', err);
      return false;
    }
  };

  const disconnect = async () => {
    try {
      const response = await api.post('/integrations/mercado-livre/disconnect');
      toast.success(response.data.message || 'Desconectado com sucesso!');
      await fetchStatus();
      return true;
    } catch (err) {
      const errorMsg = (err as any).response?.data?.message || 'Erro ao desconectar';
      toast.error(errorMsg);
      console.error('Erro ao desconectar:', err);
      return false;
    }
  };

  const saveToken = async (
    mlToken: string,
    mlUserId: string,
    mlRefreshToken?: string,
    mlExpiresIn?: number
  ) => {
    try {
      const payload = {
        ml_token: mlToken,
        ml_user_id: mlUserId,
        ml_refresh_token: mlRefreshToken,
        ml_expires_in: mlExpiresIn
      };
      console.log('[saveToken] Enviando payload:', payload);
      
      const response = await api.post('/integrations/mercado-livre/save-token', payload);
      
      toast.success(response.data.message || 'Conta conectada com sucesso!');
      await fetchStatus();
      return true;
    } catch (err: any) {
      console.error('[saveToken] Erro completo:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erro ao salvar token';
      const errorDetails = err.response?.data?.details || '';
      const fullError = errorDetails ? `${errorMsg} - ${errorDetails}` : errorMsg;
      toast.error(fullError);
      console.error('[saveToken] Erro ao salvar token:', err);
      return false;
    }
  };

  const validateConnection = async () => {
    try {
      const response = await api.get('/integrations/mercado-livre/validate');
      // Recarregar status após validação para atualizar hasRefreshToken
      await fetchStatus();
      return response.data;
    } catch (err) {
      const errorData = (err as any).response?.data;
      const errorMsg = errorData?.message || 'Erro ao validar conexão';
      
      if (errorData?.action === 'reconnect') {
        setError('Token expirado. Reconecte sua conta.');
        return { valid: false, action: 'reconnect', ...errorData };
      }
      
      return { valid: false, ...errorData };
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    error,
    fetchStatus,
    refreshToken,
    disconnect,
    saveToken,
    validateConnection
  };
};
