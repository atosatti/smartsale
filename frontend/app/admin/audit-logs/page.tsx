'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import api from '@/lib/api';
import { Search, Eye, EyeOff } from 'lucide-react';

interface AuditLog {
  id: number;
  admin_user_id: number;
  target_user_id?: number;
  action: string;
  resource_type?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const actionColors: Record<string, string> = {
  view: 'bg-blue-600/40 text-blue-100',
  view_details: 'bg-blue-600/40 text-blue-100',
  view_activity: 'bg-blue-600/40 text-blue-100',
  list: 'bg-purple-600/40 text-purple-100',
  create: 'bg-green-600/40 text-green-100',
  update: 'bg-amber-600/40 text-amber-100',
  edit: 'bg-amber-600/40 text-amber-100',
  delete: 'bg-red-600/40 text-red-100',
  soft_delete: 'bg-red-600/40 text-red-100',
  hard_delete: 'bg-red-700/40 text-red-100',
  restore: 'bg-green-600/40 text-green-100',
};

export default function AdminAuditLogs() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchLogs();
  }, [user, router, currentPage, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '50');
      if (actionFilter) params.append('action', actionFilter);

      const response = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
      if ((err as any).response?.status === 403) {
        setError('Você não tem permissão para acessar');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError('Erro ao carregar logs de auditoria');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Carregando logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Logs de Auditoria</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Total: <span className="font-semibold">{pagination?.total || 0}</span> ações
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${isDarkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-300 text-gray-900'}`}
        >
          <option value="">Todas as Ações</option>
          <option value="view">Visualizar</option>
          <option value="view_details">Ver Detalhes</option>
          <option value="list">Listar</option>
          <option value="create">Criar</option>
          <option value="update">Atualizar</option>
          <option value="delete">Deletar</option>
          <option value="soft_delete">Deletar (Soft)</option>
          <option value="hard_delete">Deletar (Hard)</option>
        </select>
      </div>

      {error && (
        <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {error}
        </div>
      )}

      {/* Logs List */}
      <div className="space-y-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`border rounded-lg hover:border-opacity-100 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-400'}`}
          >
            <button
              onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium capitalize border ${
                      actionColors[log.action] || (isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-300')
                    }`}
                  >
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  {log.resource_type && (
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      em {log.resource_type}
                    </span>
                  )}
                  {log.target_user_id && (
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      (usuário #{log.target_user_id})
                    </span>
                  )}
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Admin: #{log.admin_user_id} • {new Date(log.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <button
                className={`ml-4 p-1 rounded transition-colors flex-shrink-0 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                onClick={(e) => e.stopPropagation()}
              >
                {expandedId === log.id ? (
                  <EyeOff className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                ) : (
                  <Eye className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                )}
              </button>
            </button>

            {/* Expanded Details */}
            {expandedId === log.id && (
              <div className={`border-t px-6 py-4 rounded-b-lg ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className="space-y-3 text-sm">
                  {log.changes && (
                    <div>
                      <p className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>Alterações:</p>
                      <div className={`rounded p-3 overflow-auto max-h-48 ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-300'}`}>
                        <pre className={`text-xs whitespace-pre-wrap break-words ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {log.ip_address && (
                    <div>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>IP: <code className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>{log.ip_address}</code></p>
                    </div>
                  )}

                  {log.user_agent && (
                    <div>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>User Agent:</p>
                      <p className={`text-xs break-all ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{log.user_agent}</p>
                    </div>
                  )}

                  <div>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-800'}>
                      ID do Log: <code className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>#{log.id}</code>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {logs.length === 0 && (
        <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Nenhum log encontrado
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Página {pagination.page} de {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'}`}
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className={`px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'}`}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
