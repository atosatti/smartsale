'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import api from '@/lib/api';
import {
  Users as UsersIcon,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Lock,
  DollarSign,
} from 'lucide-react';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    twoFA: number;
    verified: number;
    byPlan: Array<{ subscription_plan: string; count: number }>;
  };
  revenue: {
    total: number;
    lastMonth: number;
  };
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'blue',
  isDarkMode = true,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  isDarkMode?: boolean;
}) => {
  const colorMapDark = {
    blue: 'bg-blue-600/30 text-blue-200 border-blue-500/50',
    green: 'bg-green-600/30 text-green-200 border-green-500/50',
    yellow: 'bg-amber-600/30 text-amber-200 border-amber-500/50',
    red: 'bg-red-600/30 text-red-200 border-red-500/50',
  };

  const colorMapLight = {
    blue: 'bg-blue-100 text-blue-900 border-blue-300',
    green: 'bg-green-100 text-green-900 border-green-300',
    yellow: 'bg-amber-100 text-amber-900 border-amber-300',
    red: 'bg-red-100 text-red-900 border-red-300',
  };

  const colorMap = isDarkMode ? colorMapDark : colorMapLight;

  return (
    <div className={`p-6 rounded-lg border ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{label}</p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{value}</p>
          {subtext && <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{subtext}</p>}
        </div>
        <Icon className={`w-8 h-8 opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há token armazenado
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (!storedToken && !user) {
      // Sem token e sem user - redirecionar para login
      router.push('/login');
      return;
    }

    // Se tem token mas não tem user, tentar carregar dados do servidor
    if (storedToken && !user) {
      console.log('[AdminDashboard] Token encontrado, carregando dados do usuário...');
      const loadUser = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          const response = await fetch(`${apiUrl}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            console.log('[AdminDashboard] Usuário carregado:', data.user);
            // Agora carregar as estatísticas
            fetchStats();
          } else {
            // Token inválido
            localStorage.removeItem('token');
            router.push('/login');
          }
        } catch (error) {
          console.error('[AdminDashboard] Erro ao carregar usuário:', error);
          router.push('/login');
        }
      };
      loadUser();
    } else if (user) {
      // User já existe - carregar estatísticas
      fetchStats();
    }
  }, [user, router, setUser]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      if ((err as any).response?.status === 403) {
        setError('Você não tem permissão para acessar o painel admin');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError('Erro ao carregar estatísticas');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border rounded-lg p-4 ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-400">
        Nenhum dado disponível
      </div>
    );
  }

  const planData = stats.users.byPlan || [];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard Admin</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Visão geral do sistema e estatísticas</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UsersIcon}
          label="Total de Usuários"
          value={stats.users.total}
          color="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={CheckCircle}
          label="Usuários Ativos"
          value={stats.users.active}
          subtext={`${Math.round((stats.users.active / stats.users.total) * 100)}% do total`}
          color="green"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={Lock}
          label="Com 2FA Ativado"
          value={stats.users.twoFA}
          subtext={`${Math.round((stats.users.twoFA / stats.users.total) * 100)}% segurança`}
          color="yellow"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={AlertCircle}
          label="Verificados"
          value={stats.users.verified}
          subtext={`${Math.round((stats.users.verified / stats.users.total) * 100)}% verificados`}
          color="blue"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          icon={DollarSign}
          label="Receita Total"
          value={`R$ ${(stats.revenue.total / 100).toFixed(2)}`}
          color="green"
          isDarkMode={isDarkMode}
        />
        <StatCard
          icon={TrendingUp}
          label="Receita (Últimos 30 dias)"
          value={`R$ ${(stats.revenue.lastMonth / 100).toFixed(2)}`}
          subtext={`${
            stats.revenue.total > 0
              ? ((stats.revenue.lastMonth / stats.revenue.total) * 100).toFixed(0) + '% do total'
              : 'sem histórico'
          }`}
          color="blue"
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Plans Breakdown */}
      <div className={`border rounded-lg p-6 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Distribuição por Plano</h2>
        <div className="space-y-4">
          {planData.map((plan) => (
            <div key={plan.subscription_plan} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium capitalize ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {plan.subscription_plan === 'free'
                      ? 'Gratuito'
                      : plan.subscription_plan.charAt(0).toUpperCase() + plan.subscription_plan.slice(1)}
                  </span>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{plan.count} usuários</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(plan.count / stats.users.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/admin/users"
          className={`border rounded-lg p-6 hover:shadow-lg transition-all ${isDarkMode ? 'bg-blue-600/40 border-blue-500 hover:bg-blue-600/50' : 'bg-blue-50 border-blue-300 hover:bg-blue-100'}`}
        >
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-900'}`}>Gerenciar Usuários</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Visualize, edite e gerencie todos os usuários do sistema
          </p>
        </a>
        <a
          href="/admin/audit-logs"
          className={`border rounded-lg p-6 hover:shadow-lg transition-all ${isDarkMode ? 'bg-purple-600/40 border-purple-500 hover:bg-purple-600/50' : 'bg-purple-50 border-purple-300 hover:bg-purple-100'}`}
        >
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-purple-200' : 'text-purple-900'}`}>Logs de Auditoria</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Rastreie todas as ações realizadas por administradores
          </p>
        </a>
      </div>
    </div>
  );
}
