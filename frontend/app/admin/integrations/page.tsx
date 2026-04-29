'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import api from '@/lib/api';
import { useMercadoLivreIntegration } from '@/hooks/useMercadoLivreIntegration';
import MercadoLivreAppManager from '@/components/MercadoLivreAppManager';
import CreateTestUser from '@/components/CreateTestUser';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LinkIcon,
  Unlink2,
  AlertTriangle,
  Zap,
  Beaker
} from 'lucide-react';

const StatusBadge = ({ valid, label, isDarkMode = true }: { valid: boolean; label: string; isDarkMode?: boolean }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
      {valid ? (
        <CheckCircle className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
      ) : (
        <AlertCircle className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
      )}
      <span className={valid ? (isDarkMode ? 'text-green-400' : 'text-green-700') : (isDarkMode ? 'text-amber-400' : 'text-amber-700')}>
        {label}
      </span>
    </div>
  );
};

const InfoCard = ({
  icon: Icon,
  title,
  children,
  isDarkMode = true
}: {
  icon: React.ComponentType<any>;
  title: string;
  children: React.ReactNode;
  isDarkMode?: boolean;
}) => (
  <div className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
    </div>
    {children}
  </div>
);

export default function IntegrationPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const mlIntegration = useMercadoLivreIntegration();
  const [disconnecting, setDisconnecting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [validationData, setValidationData] = useState<any>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!storedToken && !user) {
      router.push('/login');
      return;
    }

    if (storedToken && !user) {
      const loadUser = async () => {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error('Erro ao carregar usuário:', err);
          router.push('/login');
        }
      };
      loadUser();
    }

    // Capturar parâmetros de OAuth do Mercado Livre
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const mlToken = searchParams.get('ml_token');
      const mlUser = searchParams.get('ml_user');
      const mlRefreshToken = searchParams.get('ml_refresh_token');
      const mlExpiresIn = searchParams.get('ml_expires_in');
      const oauthError = searchParams.get('error');

      if (mlToken && mlUser) {
        console.log('[Integrations] Mercado Livre OAuth sucesso, salvando token:', mlUser);
        mlIntegration.saveToken(mlToken, mlUser, mlRefreshToken || undefined, mlExpiresIn ? parseInt(mlExpiresIn) : undefined);
        
        // Limpar URL dos parâmetros
        window.history.replaceState({}, '', '/admin/integrations');
      } else if (oauthError) {
        console.error('[Integrations] Erro OAuth:', oauthError);
        window.history.replaceState({}, '', '/admin/integrations');
        setPageError('Erro ao conectar com Mercado Livre');
      }
    }
  }, [user, router, setUser]);

  // Validar conexão automaticamente ao carregar a página
  useEffect(() => {
    if (mlIntegration.status?.connected && !mlIntegration.loading) {
      // Chamar validação de forma silenciosa (sem toast) para atualizar hasRefreshToken
      mlIntegration.validateConnection().catch(() => {
        // Ignorar erros silenciosamente
      });
    }
  }, []);

  const handleRefreshToken = async () => {
    const success = await mlIntegration.refreshToken();
    if (!success && mlIntegration.error) {
      setPageError(mlIntegration.error);
    }
  };

  const handleValidateConnection = async () => {
    const result = await mlIntegration.validateConnection();
    if (result.valid) {
      setValidationData(result);
      setShowValidationModal(true);
      toast.success('✅ Conexão validada com sucesso!');
    } else {
      const msg = result.message || 'Erro ao validar conexão';
      toast.error(msg);
      if (result.action === 'reconnect') {
        setPageError('Token expirado. Por favor, reconecte sua conta.');
      }
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    const success = await mlIntegration.disconnect();
    setDisconnecting(false);
    if (success) {
      setPageError(null);
    }
  };

  const handleConnectMercadoLivre = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || apiUrl.replace(/\/api\/?$/, '');
    
    console.log('[Integration] Redirecionando para OAuth com backend:', backendUrl);
    window.location.href = `${backendUrl}/api/oauth/mercado-livre/authorize`;
  };

  if (mlIntegration.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Carregando integração...</p>
        </div>
      </div>
    );
  }

  const isConnected = mlIntegration.status?.connected || false;
  const isExpired = mlIntegration.status?.isExpired || false;
  const hasTestUser = mlIntegration.status?.hasTestUser || false;
  const testUserNickname = mlIntegration.status?.testUserNickname || null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Integrações</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Gerencie as integrações da aplicação (centralizado para todos os usuários)</p>
      </div>

      {pageError && (
        <div className={`p-4 border rounded-lg flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
          <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <span className={isDarkMode ? 'text-red-200' : 'text-red-800'}>{pageError}</span>
        </div>
      )}

      {mlIntegration.error && (
        <div className={`p-4 border rounded-lg flex items-center gap-3 ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
          <AlertTriangle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
          <span className={isDarkMode ? 'text-red-200' : 'text-red-800'}>{mlIntegration.error}</span>
        </div>
      )}

      {!isConnected && (
        <div className={`p-6 border rounded-lg ${isDarkMode ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-start gap-4">
            <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            <div className="flex-1">
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>Mercado Livre não conectado</h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                A integração com Mercado Livre é obrigatória para a aplicação funcionar. Todos os usuários utilizarão este token compartilhado.
              </p>
              <button
                onClick={handleConnectMercadoLivre}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${isDarkMode ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
              >
                <LinkIcon className="w-4 h-4" />
                Conectar Mercado Livre Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mercado Livre Integration Card */}
      <InfoCard icon={Zap} title="Mercado Livre (Centralizado)" isDarkMode={isDarkMode}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
              <StatusBadge 
                valid={isConnected} 
                label={isConnected ? 'Conectada' : 'Não conectada'}
                isDarkMode={isDarkMode}
              />
            </div>
            {isConnected && isExpired && (
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expiração</p>
                <StatusBadge valid={false} label="Token expirado" isDarkMode={isDarkMode} />
              </div>
            )}
            {isConnected && (
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Usuário de Teste</p>
                <StatusBadge 
                  valid={hasTestUser} 
                  label={hasTestUser ? 'Autenticado' : 'Não autenticado'}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}
          </div>

          {isConnected && mlIntegration.status && (
            <>
              <div className={`border-t pt-4 space-y-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {mlIntegration.status.providerUserId && (
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>ID do Vendedor:</span>
                    <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{mlIntegration.status.providerUserId}</span>
                  </div>
                )}
                {testUserNickname && (
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Usuário de Teste:</span>
                    <span className={`font-mono text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{testUserNickname}</span>
                  </div>
                )}
                {mlIntegration.status.expiresAt && (
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Expiração:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(mlIntegration.status.expiresAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                {mlIntegration.status.connectedSince && (
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Conectado desde:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(mlIntegration.status.connectedSince).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
                {mlIntegration.status.lastRefreshed && (
                  <div className="flex justify-between items-center">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Último refresh:</span>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(mlIntegration.status.lastRefreshed).toLocaleDateString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Aviso se não tiver refresh_token */}
              {!mlIntegration.status?.hasRefreshToken && (
                <div className={`mt-4 p-3 rounded flex gap-3 border ${
                  isDarkMode
                    ? 'bg-orange-900/30 border-orange-700'
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isDarkMode ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                  <div className={`text-sm ${
                    isDarkMode ? 'text-orange-200' : 'text-orange-800'
                  }`}>
                    <p className="font-semibold mb-1">⚠️ Sem Permissão de Renovação Automática</p>
                    <p className="mb-2">
                      Sua conta do Mercado Livre não recebeu permissão de "offline access". 
                      Quando o token expirar, você precisará conectar novamente.
                    </p>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-orange-300' : 'text-orange-700'
                    }`}>
                      💡 Dica: Se você é desenvolvedor, use a conta de teste do Mercado Livre que permite renovação automática.
                    </p>
                  </div>
                </div>
              )}

              {/* Mensagem de sucesso se tiver refresh_token */}
              {mlIntegration.status?.hasRefreshToken && (
                <div className={`mt-4 p-3 rounded flex gap-3 border ${
                  isDarkMode
                    ? 'bg-green-900/30 border-green-700'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <div className={`text-sm ${
                    isDarkMode ? 'text-green-200' : 'text-green-800'
                  }`}>
                    <p className="font-semibold mb-1">✅ Renovação Automática Habilitada</p>
                    <p>
                      Sua conta tem permissão de "offline access". O token será renovado automaticamente quando necessário.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleRefreshToken}
                  disabled={mlIntegration.loading}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-blue-600/30 text-blue-200 hover:bg-blue-600/40 disabled:opacity-50'
                      : 'bg-blue-100 text-blue-900 hover:bg-blue-200 disabled:opacity-50'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${mlIntegration.loading ? 'animate-spin' : ''}`} />
                  {mlIntegration.loading ? 'Renovando...' : 'Renovar Token'}
                </button>
                <button
                  onClick={handleValidateConnection}
                  disabled={mlIntegration.loading}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-green-600/30 text-green-200 hover:bg-green-600/40 disabled:opacity-50'
                      : 'bg-green-100 text-green-900 hover:bg-green-200 disabled:opacity-50'
                  }`}
                >
                  <CheckCircle className={`w-4 h-4 ${mlIntegration.loading ? 'animate-spin' : ''}`} />
                  {mlIntegration.loading ? 'Validando...' : 'Validar'}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-red-600/30 text-red-200 hover:bg-red-600/40 disabled:opacity-50'
                      : 'bg-red-100 text-red-900 hover:bg-red-200 disabled:opacity-50'
                  }`}
                >
                  <Unlink2 className="w-4 h-4" />
                  {disconnecting ? 'Desconectando...' : 'Desconectar'}
                </button>
              </div>
            </>
          )}

          {!isConnected && (
            <button
              onClick={handleConnectMercadoLivre}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-4 ${
                isDarkMode
                  ? 'bg-green-600/30 text-green-200 hover:bg-green-600/40'
                  : 'bg-green-100 text-green-900 hover:bg-green-200'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              Conectar Mercado Livre
            </button>
          )}
        </div>
      </InfoCard>
      {/* Info Section */}
      <div className={`p-4 rounded-lg border flex gap-3 ${
        isDarkMode
          ? 'bg-blue-900/20 border-blue-700'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`} />
        <div className={`text-sm ${
          isDarkMode ? 'text-blue-200' : 'text-blue-800'
        }`}>
          <p className="font-semibold mb-1">🔒 Integração Centralizada</p>
          <p>
            Todos os usuários do SmartSale compartilham este token do Mercado Livre. 
            Quando você conecta sua conta ML aqui, todos os usuários podem fazer buscas de produtos automaticamente.
          </p>
        </div>
      </div>

      {/* Validation Modal */}
      {showValidationModal && validationData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className={`border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
            isDarkMode
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            {/* Header */}
            <div className={`sticky top-0 border-b p-6 flex items-center justify-between ${
              isDarkMode
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <CheckCircle className="w-6 h-6 text-green-400" />
                Validação de Conexão
              </h2>
              <button
                onClick={() => setShowValidationModal(false)}
                className={`text-2xl transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Dados do Usuário */}
              <div>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Dados do Usuário
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Apelido</p>
                    <p className={`font-mono ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{validationData.user.nickname}</p>
                  </div>
                  <div className={`p-3 rounded border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>ID</p>
                    <p className={`font-mono ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{validationData.user.id}</p>
                  </div>
                  <div className={`p-3 rounded border col-span-2 ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Email</p>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{validationData.user.email}</p>
                  </div>
                  <div className={`p-3 rounded border ${
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Nome Completo</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Nome Completo</p>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{validationData.user.firstName} {validationData.user.lastName}</p>
                  </div>
                  <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>País / Site</p>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{validationData.user.countryId} / {validationData.user.siteId}</p>
                  </div>
                  <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tipo de Usuário</p>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{validationData.user.userType}</p>
                  </div>
                </div>
              </div>

              {/* Reputação do Vendedor */}
              {validationData.user.sellerReputation && (
                <div>
                  <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📊 Reputação de Vendedor</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total de Vendas</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{validationData.user.sellerReputation.transactions.total}</p>
                    </div>
                    <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Concluídas</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{validationData.user.sellerReputation.transactions.completed}</p>
                    </div>
                    <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Canceladas</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{validationData.user.sellerReputation.transactions.canceled}</p>
                    </div>
                    <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avaliações Positivas</p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{validationData.user.sellerReputation.transactions.ratings.positive}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              {validationData.user.status && (
                <div>
                  <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🔧 Status</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded border flex items-center gap-2 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${validationData.user.status.sell.allow ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pode Vender: {validationData.user.status.sell.allow ? '✅' : '❌'}</span>
                    </div>
                    <div className={`p-3 rounded border flex items-center gap-2 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${validationData.user.status.buy.allow ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pode Comprar: {validationData.user.status.buy.allow ? '✅' : '❌'}</span>
                    </div>
                    <div className={`p-3 rounded border flex items-center gap-2 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${validationData.user.status.list.allow ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Pode Listar: {validationData.user.status.list.allow ? '✅' : '❌'}</span>
                    </div>
                    <div className={`p-3 rounded border flex items-center gap-2 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${validationData.user.status.confirmed_email ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Confirmado: {validationData.user.status.confirmed_email ? '✅' : '❌'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Token Info */}
              <div>
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🔑 Informações do Token</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expira em</p>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                      {new Date(validationData.token.expiresAt).toLocaleDateString('pt-BR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={`p-4 rounded border ${
                    validationData.token.hasRefreshToken
                      ? isDarkMode
                        ? 'bg-green-900/20 border-green-700'
                        : 'bg-green-50 border-green-200'
                      : isDarkMode
                      ? 'bg-red-900/20 border-red-700'
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={validationData.token.hasRefreshToken
                      ? isDarkMode
                        ? 'text-green-200'
                        : 'text-green-800'
                      : isDarkMode
                      ? 'text-red-200'
                      : 'text-red-800'
                    }>
                      {validationData.token.hasRefreshToken ? '✅ Refresh Token Disponível' : '❌ Sem Refresh Token'}
                    </p>
                    {!validationData.token.hasRefreshToken && (
                      <p className={`text-sm mt-2 ${
                        isDarkMode ? 'text-red-200' : 'text-red-700'
                      }`}>
                        Sua conta não recebeu permissão de renovação automática. Você precisará reconectar quando o token expirar.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`border-t p-6 flex justify-end gap-3 ${
              isDarkMode
                ? 'border-gray-700 bg-gray-800/50'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <button
                onClick={() => setShowValidationModal(false)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                }`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gerenciamento de Aplicativo */}
      {isConnected && (
        <div className="mt-12 border-t pt-8" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
          <MercadoLivreAppManager 
            isDarkMode={isDarkMode}
            mlUserId={mlIntegration.status?.providerUserId}
          />
        </div>
      )}

      {/* Usuário de Teste para Consultas */}
      {isConnected && (
        <div className="mt-12 border-t pt-8" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
          <div className="mb-6">
            <h2 className={`text-2xl font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Beaker className="w-6 h-6" />
              Usuário de Teste
            </h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Crie um usuário de teste para fazer consultas à API do Mercado Livre sem afetar sua reputação
            </p>
          </div>

          <div className={`p-6 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
            <CreateTestUser isDarkMode={isDarkMode} />
          </div>
        </div>
      )}
    </div>
  );
}
