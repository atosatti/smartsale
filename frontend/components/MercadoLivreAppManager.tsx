'use client';

import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Package,
  Users,
  Activity,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Download
} from 'lucide-react';

interface AppDetails {
  id: number;
  site_id: string;
  url: string;
  sandbox_mode: boolean;
  active: boolean;
  max_requests_per_hour: number;
  certification_status: string;
}

interface Grant {
  user_id: string;
  app_id: string;
  date_created: string;
  scopes: string[];
  status?: 'Novo' | 'Ativo' | 'Inativo';
}

interface ConsumedMetrics {
  app_id: number;
  total_request: number;
  request_by_status: Array<{
    total_request: number;
    status: number;
    percentage: number;
  }>;
  top_apis_consumed: Array<{
    resource_id: string;
    resource_name: string;
    hierarchy1: string;
    hierarchy2: string;
    percentage_request_successful: number;
  }>;
}

interface MercadoLivreAppManagerProps {
  isDarkMode?: boolean;
  mlUserId?: string;
}

const LoadingSpinner = ({ isDarkMode = true }: { isDarkMode?: boolean }) => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Carregando...</p>
    </div>
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  isDarkMode = true
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  isDarkMode?: boolean;
}) => (
  <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
    </div>
    <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
  </div>
);

export default function MercadoLivreAppManager({
  isDarkMode = true,
  mlUserId
}: MercadoLivreAppManagerProps) {
  const [appDetails, setAppDetails] = useState<AppDetails | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [metrics, setMetrics] = useState<ConsumedMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);  const hasInitialized = useRef(false);  const [activeTab, setActiveTab] = useState<'details' | 'grants' | 'metrics'>('details');

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchAppData();
    }
  }, []);

  const fetchAppData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('[MercadoLivre] Iniciando fetch para app-details...');
      const response = await fetch('http://localhost:3001/api/integrations/mercado-livre/app-details', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[MercadoLivre] Response status:', response.status);
      console.log('[MercadoLivre] Response statusText:', response.statusText);
      console.log('[MercadoLivre] Response ok:', response.ok);

      if (!response.ok) {
        const text = await response.text();
        console.error('[MercadoLivre] Response body (error):', text);
        
        let errorData = null;
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          errorData = { error: text };
        }
        
        throw new Error(errorData?.error || errorData?.details || `Erro ${response.status}`);
      }

      const text = await response.text();
      console.log('[MercadoLivre] Response body (success, length):', text.length);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[MercadoLivre] JSON parse error:', parseError);
        console.error('[MercadoLivre] Response text:', text.substring(0, 500));
        throw new Error('Resposta do servidor inválida');
      }

      console.log('[MercadoLivre] Dados parseados com sucesso');
      setAppDetails(data.appDetails || null);
      setGrants(data.grants || []);
      setMetrics(data.metrics || null);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido';
      setError(errorMessage);
      toast.error('❌ ' + errorMessage);
      console.error('[MercadoLivre] Erro:', errorMessage, err);
    } finally {
      setLoading(false);
    }
  };

  const downloadGrants = () => {
    if (!grants.length) {
      toast.error('Nenhum grant para exportar');
      return;
    }

    const csv = [
      ['User ID', 'App ID', 'Data de Criação', 'Status', 'Permissões'].join(','),
      ...grants.map(g => [
        g.user_id,
        g.app_id,
        new Date(g.date_created).toLocaleDateString('pt-BR'),
        g.status || 'Desconhecido',
        g.scopes.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grants-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Grants exportados com sucesso');
  };

  if (loading) {
    return <LoadingSpinner isDarkMode={isDarkMode} />;
  }

  if (!appDetails && !error) {
    return (
      <div className={`p-6 rounded-lg border flex items-center gap-4 ${
        isDarkMode ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'
      }`}>
        <AlertCircle className={`w-6 h-6 flex-shrink-0 ${
          isDarkMode ? 'text-amber-400' : 'text-amber-600'
        }`} />
        <div className="flex-1">
          <p className={`font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>
            Dados do aplicativo não disponíveis
          </p>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
            Não foi possível carregar os detalhes da sua aplicação. Verifique se o token do Mercado Livre está configurado corretamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Gerencie seu Aplicativo
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitorize e gerencie os detalhes, autorizações e consumo de sua aplicação
          </p>
        </div>
        <button
          onClick={fetchAppData}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {error && (
        <div className={`p-4 rounded-lg border flex items-start gap-3 ${
          isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isDarkMode ? 'text-red-400' : 'text-red-600'
          }`} />
          <div>
            <p className={isDarkMode ? 'text-red-200' : 'text-red-800'}>{error}</p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              Certifique-se de que você tem as permissões necessárias configuradas.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b" style={{ borderColor: isDarkMode ? '#374151' : '#e5e7eb' }}>
        {(['details', 'grants', 'metrics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? isDarkMode
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-600 text-blue-600'
                : isDarkMode
                ? 'border-transparent text-gray-400 hover:text-gray-300'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'details' && <Package className="w-4 h-4 inline mr-2" />}
            {tab === 'grants' && <Users className="w-4 h-4 inline mr-2" />}
            {tab === 'metrics' && <BarChart3 className="w-4 h-4 inline mr-2" />}
            {tab === 'details' && 'Detalhes'}
            {tab === 'grants' && 'Autorizações'}
            {tab === 'metrics' && 'Métricas'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {/* Details Tab */}
        {activeTab === 'details' && appDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard icon={Package} label="ID da Aplicação" value={appDetails.id} isDarkMode={isDarkMode} />
              <StatCard icon={Activity} label="Limite de Requisições/Hora" value={appDetails.max_requests_per_hour.toLocaleString()} isDarkMode={isDarkMode} />
            </div>

            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Informações Gerais</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Site:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{appDetails.site_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>URL:</span>
                  <a href={appDetails.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                    {appDetails.url}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Modo Sandbox:</span>
                  <span className={appDetails.sandbox_mode ? 'text-yellow-500' : 'text-green-500'}>
                    {appDetails.sandbox_mode ? '🟡 Ativado' : '🟢 Desativado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Ativa:</span>
                  <span className={appDetails.active ? 'text-green-500' : 'text-red-500'}>
                    {appDetails.active ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Status de Certificação:</span>
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                    {appDetails.certification_status === 'certified' ? '✅ Certificada' : '⏳ Não certificada'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grants Tab */}
        {activeTab === 'grants' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                Total de usuários autorizados: <span className="font-bold">{grants.length}</span>
              </p>
              <button
                onClick={downloadGrants}
                disabled={grants.length === 0}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>

            {grants.length === 0 ? (
              <div className={`p-8 text-center rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <Users className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Nenhum usuário autorizado ainda</p>
              </div>
            ) : (
              <div className={`rounded-lg border overflow-x-auto ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="w-full">
                  <thead>
                    <tr className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                      <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>User ID</th>
                      <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Data de Criação</th>
                      <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Status</th>
                      <th className={`px-4 py-3 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Permissões</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grants.map((grant, idx) => (
                      <tr key={idx} className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className={`px-4 py-3 font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{grant.user_id}</td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(grant.date_created).toLocaleDateString('pt-BR')}
                        </td>
                        <td className={`px-4 py-3 text-sm`}>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            grant.status === 'Novo'
                              ? isDarkMode ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-100 text-blue-800'
                              : grant.status === 'Ativo'
                              ? isDarkMode ? 'bg-green-900/50 text-green-200' : 'bg-green-100 text-green-800'
                              : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {grant.status || 'Desconhecido'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {grant.scopes.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                <strong>Estados de Autorização:</strong><br/>
                🟦 <strong>Novo:</strong> Grant gerado há menos de 24 horas<br/>
                🟩 <strong>Ativo:</strong> Usuário com uso ativo nos últimos 90 dias<br/>
                ⬜ <strong>Inativo:</strong> Nenhuma atividade nos últimos 90 dias
              </p>
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                icon={TrendingUp} 
                label="Total de Requisições" 
                value={metrics.total_request.toLocaleString()} 
                isDarkMode={isDarkMode} 
              />
              <StatCard 
                icon={Activity} 
                label="Requisições com Sucesso" 
                value={`${(metrics.request_by_status.find(r => r.status === 200)?.percentage || 0).toFixed(2)}%`}
                isDarkMode={isDarkMode} 
              />
              <StatCard 
                icon={AlertCircle} 
                label="Requisições com Erro" 
                value={`${(100 - (metrics.request_by_status.find(r => r.status === 200)?.percentage || 0)).toFixed(2)}%`}
                isDarkMode={isDarkMode} 
              />
            </div>

            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                APIs Mais Consumidas (Sucesso)
              </h3>
              <div className="space-y-3">
                {metrics.top_apis_consumed.slice(0, 5).map((api, idx) => (
                  <div key={idx} className={`p-3 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{api.hierarchy2}</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{api.resource_name}</p>
                      </div>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {api.percentage_request_successful.toFixed(2)}% ✅
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${api.percentage_request_successful}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Distribuição de Status HTTP
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {metrics.request_by_status
                  .sort((a, b) => b.percentage - a.percentage)
                  .slice(0, 10)
                  .map((status, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${
                          status.status === 200 ? 'text-green-500' :
                          status.status >= 400 && status.status < 500 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>{status.status}</span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {status.total_request.toLocaleString()} requisições
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="w-24 bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status.status === 200 ? 'bg-green-500' :
                              status.status >= 400 && status.status < 500 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(status.percentage * 100, 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {status.percentage.toFixed(3)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
