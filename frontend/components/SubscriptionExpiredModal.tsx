'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/themeStore';
import { AlertCircle, Clock } from 'lucide-react';

export function SubscriptionExpiredModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isDarkMode } = useThemeStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Cores dinâmicas para dark mode
  const colors = {
    overlay: 'rgba(0, 0, 0, 0.7)',
    modal: isDarkMode ? '#1e293b' : '#fff',
    textPrimary: isDarkMode ? '#e0e0e0' : '#333',
    textSecondary: isDarkMode ? '#999' : '#666',
    border: isDarkMode ? '#404050' : '#ddd',
    error: isDarkMode ? '#ef4444' : '#dc2626',
    errorBg: isDarkMode ? '#7f1d1d' : '#fee2e2',
    button: isDarkMode ? '#2d3748' : '#f0f0f0',
    buttonHover: isDarkMode ? '#4a5568' : '#e0e0e0',
    primary: '#3b82f6',
    primaryHover: '#1d4ed8',
  };

  const handleRenew = async () => {
    setLoading(true);
    onClose();
    router.push('/plans');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          backgroundColor: colors.modal,
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              backgroundColor: colors.errorBg,
              borderRadius: '50%',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertCircle size={24} color={colors.error} />
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: colors.textPrimary,
                margin: '0 0 0.25rem 0',
              }}
            >
              Assinatura Expirada
            </h2>
            <p style={{ color: colors.textSecondary, margin: 0, fontSize: '0.875rem' }}>
              Seu período de acesso terminou
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '2rem' }}>
          <p
            style={{
              color: colors.textPrimary,
              fontSize: '0.95rem',
              lineHeight: '1.6',
              margin: '0 0 1rem 0',
            }}
          >
            Sua assinatura foi cancelada e o período de acesso expirou. Para continuar buscando produtos e
            acessando todas as funcionalidades do SmartSale, você precisa fazer uma nova assinatura.
          </p>

          {/* Info Box */}
          <div
            style={{
              backgroundColor: colors.errorBg,
              border: `1px solid ${colors.error}`,
              borderRadius: '8px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Clock size={20} color={colors.error} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ color: colors.error, fontSize: '0.875rem', fontWeight: '500', margin: '0 0 0.25rem 0' }}>
                Acesso Bloqueado
              </p>
              <p style={{ color: colors.textSecondary, fontSize: '0.8rem', margin: 0 }}>
                As buscas e análises estão desativadas até a renovação
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.button,
              color: colors.textPrimary,
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = colors.buttonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.button;
            }}
          >
            Fechar
          </button>

          <button
            onClick={handleRenew}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: colors.primary,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            {loading ? 'Redirecionando...' : 'Renovar Assinatura'}
          </button>
        </div>
      </div>
    </div>
  );
}
