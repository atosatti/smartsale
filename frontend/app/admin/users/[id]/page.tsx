'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';

interface UserDetail {
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
  stripe_customer_id?: string;
  admin_notes?: string;
  total_searches: number;
  total_products: number;
  subscription_count: number;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Subscription {
  id: number;
  plan: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

interface ActivityLog {
  type: string;
  description: string;
  created_at: string;
}

export default function UserDetail() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAuthStore();
  const userId = params.id as string;

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Form states
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [isActive, setIsActive] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    fetchUserDetail();
  }, [currentUser, router, userId]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/admin/users/${userId}`);
      setUserDetail(response.data.user);
      setPayments(response.data.payments);
      setSubscriptions(response.data.subscriptions);

      // Set form states
      setRole(response.data.user.role);
      setIsActive(response.data.user.is_active);
      setAdminNotes(response.data.user.admin_notes || '');
      setSubscriptionPlan(response.data.user.subscription_plan);

      // Fetch activity
      fetchActivity();
    } catch (err) {
      console.error('Erro ao carregar detalhes do usuário:', err);
      if ((err as any).response?.status === 404) {
        setError('Usuário não encontrado');
      } else if ((err as any).response?.status === 403) {
        setError('Você não tem permissão para acessar');
      } else {
        setError('Erro ao carregar detalhes do usuário');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await api.get(`/admin/users/${userId}/activity`);
      setActivity(response.data.activity);
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
    }
  };

  const handleSave = async () => {
    if (!userDetail) return;

    try {
      setSaving(true);
      setError(null);

      await api.put(`/admin/users/${userId}`, {
        role,
        is_active: isActive,
        admin_notes: adminNotes,
        subscription_plan: subscriptionPlan,
      });

      // Recarregar dados
      fetchUserDetail();
      alert('Usuário atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError('Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Tem certeza que deseja deletar este usuário? Esta ação marcará o usuário como inativo.'
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      await api.delete(`/admin/users/${userId}`);
      alert('Usuário deletado com sucesso!');
      router.push('/admin/users');
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      setError('Erro ao deletar usuário');
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando detalhes do usuário...</p>
        </div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error || 'Usuário não encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {userDetail.first_name} {userDetail.last_name}
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {userDetail.email}
            </p>
          </div>
          <div className="text-right">
            {userDetail.role === 'admin' && (
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-semibold">ADMINISTRADOR</span>
              </div>
            )}
            <div
              className={`text-sm font-medium ${
                userDetail.is_active ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {userDetail.is_active ? '✓ Ativo' : '✗ Inativo'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Informações Pessoais</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase">Telefone</label>
              <p className="text-white mt-1">{userDetail.phone || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Data de Criação</label>
              <p className="text-white mt-1">
                {new Date(userDetail.created_at).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Último Acesso</label>
              <p className="text-white mt-1">
                {userDetail.last_login
                  ? new Date(userDetail.last_login).toLocaleDateString('pt-BR')
                  : 'Nunca acessou'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Verificado</label>
              <p className="text-white mt-1 flex items-center gap-2">
                {userDetail.is_verified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Sim
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    Não
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Segurança</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 uppercase">2FA Status</label>
              <p className="text-white mt-1 flex items-center gap-2">
                {userDetail.two_fa_enabled ? (
                  <>
                    <Lock className="w-4 h-4 text-green-400" />
                    <span>Ativado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <span>Desativado</span>
                  </>
                )}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase">Stripe Customer ID</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-white text-sm bg-gray-900 px-3 py-1 rounded flex-1 truncate">
                  {userDetail.stripe_customer_id || 'Não informado'}
                </code>
                {userDetail.stripe_customer_id && (
                  <button
                    onClick={() => copyToClipboard(userDetail.stripe_customer_id!)}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Controles de Admin</h2>
        <div className="space-y-4">
          {/* Role */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Função</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-300">Status do Usuário</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-900 border-gray-700"
              />
              <span className="text-sm text-gray-300">
                {isActive ? 'Ativo' : 'Inativo'}
              </span>
            </label>
          </div>

          {/* Subscription Plan */}
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Plano</label>
            <select
              value={subscriptionPlan}
              onChange={(e) => setSubscriptionPlan(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="free">Gratuito</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-gray-300">Notas de Admin</label>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                {showNotes ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            {showNotes && (
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Adicione notas internas sobre este usuário..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                rows={3}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Deletar Usuário
            </button>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">Total de Buscas</p>
          <p className="text-2xl font-bold text-blue-400">{userDetail.total_searches}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">Produtos Salvos</p>
          <p className="text-2xl font-bold text-green-400">{userDetail.total_products}</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-xs text-gray-400 uppercase mb-1">Assinaturas</p>
          <p className="text-2xl font-bold text-purple-400">{userDetail.subscription_count}</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Histórico de Pagamentos</h2>
        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-xs text-gray-400 uppercase py-2">Data</th>
                  <th className="text-left text-xs text-gray-400 uppercase py-2">Valor</th>
                  <th className="text-left text-xs text-gray-400 uppercase py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-700/50">
                    <td className="py-3 text-gray-300">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 text-white">
                      R$ {(p.amount / 100).toFixed(2)} {p.currency}
                    </td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Nenhum pagamento encontrado</p>
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Atividade Recente</h2>
        {activity.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {activity.map((log, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-700/50 last:border-b-0">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{log.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleDateString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Nenhuma atividade encontrada</p>
        )}
      </div>
    </div>
  );
}
