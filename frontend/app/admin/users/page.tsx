'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import api from '@/lib/api';
import {
  Search,
  Filter,
  ChevronRight,
  Shield,
  CheckCircle,
  AlertCircle,
  Lock,
  Eye,
  Trash2,
} from 'lucide-react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'user' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  two_fa_enabled: boolean;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  last_login?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const roleIcon = (role: string) => {
  if (role === 'admin') {
    return <Shield className="w-4 h-4 text-yellow-400" />;
  }
  return null;
};

const statusIndicator = (user: User) => {
  if (!user.is_active) {
    return <AlertCircle className="w-4 h-4 text-red-400" />;
  }
  if (user.two_fa_enabled) {
    return <Lock className="w-4 h-4 text-green-400" />;
  }
  return null;
};

export default function AdminUsers() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUsers();
  }, [user, router, currentPage, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      if ((err as any).response?.status === 403) {
        setError('Você não tem permissão para acessar');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError('Erro ao carregar usuários');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: number) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleDeleteUser = async (userId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      alert('Erro ao deletar usuário');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
            isDarkMode ? 'border-blue-500' : 'border-blue-600'
          }`}></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Gerenciar Usuários</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Total: <span className="font-semibold">{pagination?.total || 0}</span> usuários
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              type="text"
              placeholder="Buscar por email, nome..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full pl-10 pr-4 py-2 rounded-lg placeholder:transition-colors focus:outline-none focus:border-blue-500 ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500'
                  : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Filters */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border border-gray-700 text-white'
                : 'bg-white border border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">Todas as Funções</option>
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${
              isDarkMode
                ? 'bg-gray-800 border border-gray-700 text-white'
                : 'bg-white border border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {error && (
        <div className={`rounded-lg p-4 border ${
          isDarkMode
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className={`rounded-lg overflow-hidden border ${
        isDarkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${
                isDarkMode
                  ? 'border-gray-700 bg-gray-900/50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Usuário
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Email
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Plano
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  2FA
                </th>
                <th className={`px-6 py-4 text-left text-xs font-medium uppercase ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => handleUserClick(u.id)}
                  className={`border-b cursor-pointer transition-colors ${
                    isDarkMode
                      ? 'border-gray-700 hover:bg-gray-700/30'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {roleIcon(u.role)}
                      <div>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {u.first_name} {u.last_name}
                        </p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-600'
                        }`}>ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      isDarkMode
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {u.subscription_plan === 'free' ? 'Gratuito' : u.subscription_plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {statusIndicator(u)}
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {u.is_active ? (
                          <span className="text-green-400">Ativo</span>
                        ) : (
                          <span className="text-red-400">Inativo</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.two_fa_enabled ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Ativado
                      </span>
                    ) : (
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-600'
                      }`}>Desativado</span>
                    )}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUserClick(u.id)}
                        className={`p-2 rounded transition-colors ${
                          isDarkMode
                            ? 'hover:bg-gray-600/50'
                            : 'hover:bg-gray-100'
                        }`}
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteUser(u.id, e)}
                        className={`p-2 rounded transition-colors ${
                          isDarkMode
                            ? 'hover:bg-red-500/10'
                            : 'hover:bg-red-50'
                        }`}
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className={`px-6 py-12 text-center ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Nenhum usuário encontrado
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Página {pagination.page} de {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
                  : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDarkMode
                  ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
                  : 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
