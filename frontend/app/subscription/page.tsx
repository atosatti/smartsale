'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import MetronicLayout from '@/components/MetronicLayout';
import { CancelSubscriptionModal } from '@/components/CancelSubscriptionModal';
import { PaymentHistoryTable } from '@/components/PaymentHistoryTable';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

interface UserSubscription {
  id: number;
  subscription_plan: string;
  subscription_status: string;
  subscription_start_date: string;
  subscription_end_date: string;
  email: string;
  current_period_end?: string;
  canceled_at?: string;
  plan_price?: number;
}

export default function SubscriptionPage() {
  const { token, user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const router = useRouter();

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchSubscription();
  }, [token]);

  const fetchSubscription = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      // Get subscription data from subscriptions endpoint
      const response = await fetch(`${apiUrl}/subscriptions/my-subscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar assinatura');
      }

      const data = await response.json();
      
      // Backend now returns: { id, email, subscription_plan, subscription_status, subscription_start_date, subscription_end_date, plan_details, current_period_end, canceled_at }
      setSubscription({
        id: data.id || user?.id || 0,
        subscription_plan: data.subscription_plan || 'free',
        subscription_status: data.subscription_status || 'free',
        subscription_start_date: data.subscription_start_date || new Date().toISOString(),
        subscription_end_date: data.subscription_end_date || '',
        email: data.email || user?.email || '',
        current_period_end: data.current_period_end,
        canceled_at: data.canceled_at,
        plan_price: data.plan_price,
      });
    } catch (error: any) {
      console.error('Erro ao carregar assinatura:', error);
      // Fallback to default subscription
      setSubscription({
        id: user?.id || 0,
        subscription_plan: 'free',
        subscription_status: 'free',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: '',
        email: user?.email || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string | undefined) => {
    if (!plan) return '#6b7280';
    const colors: Record<string, string> = {
      free: '#6b7280',
      basic: '#3b82f6',
      premium: '#f59e0b',
      enterprise: '#8b5cf6',
    };
    return colors[plan.toLowerCase()] || '#6b7280';
  };

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return { label: 'Desconhecido', emoji: '❓' };
    const labels: Record<string, { label: string; emoji: string }> = {
      active: { label: 'Ativo', emoji: '✅' },
      past_due: { label: 'Pagamento Pendente', emoji: '⚠️' },
      canceled: { label: 'Cancelado', emoji: '❌' },
      free: { label: 'Plano Gratuito', emoji: '🆓' },
      pending_cancellation: { label: 'Cancelamento Pendente', emoji: '⏳' },
    };
    return labels[status.toLowerCase()] || { label: status, emoji: '❓' };
  };

  const handleReactivate = async () => {
    if (!token) {
      toast.error('Não autenticado');
      return;
    }

    setReactivating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/subscriptions/reactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao reativar');
      }

      const result = await response.json();
      toast.success(result.message || 'Assinatura reativada com sucesso!');
      
      // Recarregar dados
      await fetchSubscription();
    } catch (error: any) {
      console.error('Erro ao reativar:', error);
      toast.error(error.message || 'Erro ao reativar assinatura');
    } finally {
      setReactivating(false);
    }
  };

  if (loading) {
    return (
      <MetronicLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Carregando informações de assinatura...</p>
        </div>
      </MetronicLayout>
    );
  }

  if (!subscription) {
    return (
      <MetronicLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Não foi possível carregar as informações de assinatura.</p>
        </div>
      </MetronicLayout>
    );
  }

  const statusInfo = getStatusLabel(subscription?.subscription_status);
  const planColor = getPlanColor(subscription?.subscription_plan);
  
  const colors = {
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#e0e0e0' : '#333',
    lightText: isDarkMode ? '#999' : '#666',
    border: isDarkMode ? '#404050' : '#ddd',
    sectionBg: isDarkMode ? '#252835' : '#f9fafb',
  };

  return (
    <MetronicLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: colors.text }}>📋 Minha Assinatura</h1>

      {/* Card Principal */}
      <div
        style={{
          border: `2px solid ${planColor}`,
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          backgroundColor: colors.cardBg,
          color: colors.text,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: planColor,
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                }}
              >
                {subscription?.subscription_plan || 'Sem Plano'}
              </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Status</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {statusInfo.emoji} {statusInfo.label}
              </p>
            </div>

            {subscription?.subscription_start_date && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  Data de Início
                </p>
                <p style={{ fontSize: '1rem' }}>
                  {new Date(subscription.subscription_start_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {subscription?.subscription_end_date &&
              subscription.subscription_status === 'active' && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Próxima Renovação
                  </p>
                  <p style={{ fontSize: '1rem' }}>
                    {subscription.subscription_end_date ? new Date(subscription.subscription_end_date).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
              )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#666', marginBottom: '1rem' }}>Email</p>
            <p style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{subscription?.email || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Seção de Ações */}
      {subscription?.subscription_status === 'active' && (
        <div
          style={{
            backgroundColor: isDarkMode ? '#2d2818' : '#fef3c7',
            border: `1px solid ${isDarkMode ? '#4a4033' : '#fbbf24'}`,
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: isDarkMode ? '#fcd34d' : '#92400e' }}>ℹ️ Informações</h3>
          <ul style={{ paddingLeft: '1.5rem', color: isDarkMode ? '#fcd34d' : '#92400e' }}>
            <li>Você pode gerenciar sua assinatura a qualquer momento</li>
            <li>Alterações entram em vigor imediatamente</li>
            <li>Faturas anteriores estão disponíveis no email configurado</li>
          </ul>
        </div>
      )}

      {/* Botões de Ação */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {subscription?.subscription_status === 'active' && (
          <>
            <button
              onClick={() => window.location.href = '/plans'}
              style={{
                padding: '1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              🔄 Mudar Plano
            </button>

            <button
              onClick={() => setShowCancelModal(true)}
              style={{
                padding: '1rem',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b71c1c')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#d32f2f')}
            >
              ❌ Cancelar Assinatura
            </button>
          </>
        )}

        {subscription?.subscription_status === 'pending_cancellation' && (
          <>
            <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
              <div
                style={{
                  backgroundColor: isDarkMode ? '#3d2817' : '#fef3c7',
                  border: `2px solid ${isDarkMode ? '#92400e' : '#fbbf24'}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ marginBottom: '0.5rem', color: isDarkMode ? '#fcd34d' : '#92400e' }}>
                  ⏳ Cancelamento Agendado
                </h3>
                <p style={{ color: isDarkMode ? '#fcd34d' : '#92400e', marginBottom: '0.5rem' }}>
                  Sua assinatura será cancelada em:{' '}
                  <strong>
                    {subscription?.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Data não disponível'}
                  </strong>
                </p>
                <p style={{ color: isDarkMode ? '#fcd34d' : '#92400e', fontSize: '0.9rem' }}>
                  Você ainda tem acesso completo ao SmartSale até essa data. Se mudar de ideia, pode reativar a qualquer momento.
                </p>
              </div>
            </div>

            <button
              onClick={handleReactivate}
              disabled={reactivating}
              style={{
                padding: '1rem',
                backgroundColor: reactivating ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: reactivating ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                if (!reactivating) e.currentTarget.style.backgroundColor = '#059669';
              }}
              onMouseOut={(e) => {
                if (!reactivating) e.currentTarget.style.backgroundColor = '#10b981';
              }}
            >
              {reactivating ? '🔄 Reativando...' : '✅ Reativar Assinatura'}
            </button>

            <button
              onClick={() => window.location.href = '/subscription'}
              style={{
                padding: '1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4b5563')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6b7280')}
            >
              🔙 Voltar
            </button>
          </>
        )}

        {subscription?.subscription_status === 'canceled' && (
          <button
            onClick={() => window.location.href = '/plans'}
            style={{
              gridColumn: '1 / -1',
              padding: '1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#10b981')}
          >
            ✨ Voltar a Se Inscrever
          </button>
        )}
      </div>

      {/* Histórico de Pagamentos */}
      {token && (
        <div style={{ marginTop: '3rem' }}>
          <PaymentHistoryTable token={token} />
        </div>
      )}

      {/* Modal de Cancelamento */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        planName={subscription?.subscription_plan || 'Seu Plano'}
        onCancelSuccess={() => {
          fetchSubscription();
          setShowCancelModal(false);
        }}
      />
    </div>
    </MetronicLayout>
  );
}
