'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import MetronicLayout from '@/components/MetronicLayout';

export default function Dashboard() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push('/login');
    }
  }, [token, router, mounted]);

  if (!mounted) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando...</div>;
  }

  if (!token) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando...</div>;
  }

  const colors = {
    cardBg: isDarkMode ? '#252835' : '#ffffff',
    border: isDarkMode ? '#404050' : '#ddd',
    text: isDarkMode ? '#e0e0e0' : '#333',
    lightText: isDarkMode ? '#999' : '#666',
    bg: isDarkMode ? '#1a1a27' : '#f8f9fa',
  };

  const shortcuts = [
    { icon: '🔍', label: 'Pesquisar', color: '#3699FF' },
    { icon: '💰', label: 'Planos', color: '#1BC5BD' },
    { icon: '🔒', label: '2FA', color: '#FFA800' },
    { icon: '❤️', label: 'Favoritos', color: '#F64E60' },
    { icon: '📊', label: 'Análise', color: '#8950FC' },
    { icon: '⚙️', label: 'Config', color: '#6C757D' },
  ];

  return (
    <MetronicLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', paddingBottom: '2rem' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', color: colors.text }}>
            Bem-vindo, {user?.firstName}! 👋
          </h1>
          <p style={{ margin: 0, color: colors.lightText }}>
            Gerencie seus produtos e pesquisas de forma inteligente
          </p>
        </div>

        {/* Quick Shortcuts */}
        <div style={{
          backgroundColor: colors.cardBg,
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.border}`,
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: colors.text,
          }}>
            Ações Rápidas
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
          }}>
            {shortcuts.map((shortcut, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (shortcut.label === 'Pesquisar') {
                    router.push('/search');
                  } else if (shortcut.label === 'Planos') {
                    router.push('/plans');
                  } else if (shortcut.label === '2FA') {
                    router.push('/setup-2fa');
                  } else if (shortcut.label === 'Config') {
                    router.push('/profile');
                  }
                }}
                style={{
                  padding: '1rem',
                  backgroundColor: shortcut.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>{shortcut.icon}</div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{shortcut.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Card 1: Perfil */}
          <div style={{
            backgroundColor: colors.cardBg,
            padding: '1.5rem',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem',
            }}>
              👤
            </div>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              color: colors.text,
              fontSize: '1.1rem',
            }}>
              Seu Perfil
            </h3>
            <p style={{
              margin: 0,
              color: colors.lightText,
              fontSize: '0.9rem',
            }}>
              {user?.email}
            </p>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: colors.lightText,
              fontSize: '0.9rem',
            }}>
              Plano: <strong style={{ color: colors.text }}>{user?.plan}</strong>
            </p>
          </div>

          {/* Card 2: Plano */}
          <div style={{
            backgroundColor: colors.cardBg,
            padding: '1.5rem',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem',
            }}>
              💳
            </div>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              color: colors.text,
              fontSize: '1.1rem',
            }}>
              Plano de Assinatura
            </h3>
            <p style={{
              margin: 0,
              color: colors.lightText,
              fontSize: '0.9rem',
            }}>
              Status: <strong style={{ color: '#1BC5BD' }}>Ativo</strong>
            </p>
            <button style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#3699FF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#357abd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3699FF';
            }}>
              Gerenciar Plano
            </button>
          </div>

          {/* Card 3: Segurança */}
          <div style={{
            backgroundColor: colors.cardBg,
            padding: '1.5rem',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem',
            }}>
              🔒
            </div>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              color: colors.text,
              fontSize: '1.1rem',
            }}>
              Segurança 2FA
            </h3>
            <p style={{
              margin: 0,
              color: colors.lightText,
              fontSize: '0.9rem',
            }}>
              Status: <strong style={{ color: user?.twoFaEnabled ? '#1BC5BD' : '#FFA800' }}>
                {user?.twoFaEnabled ? 'Ativado' : 'Desativado'}
              </strong>
            </p>
            <button style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: user?.twoFaEnabled ? '#6C757D' : '#FFA800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = user?.twoFaEnabled ? '#5a6268' : '#e09000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = user?.twoFaEnabled ? '#6C757D' : '#FFA800';
            }}>
              {user?.twoFaEnabled ? '✓ Ativado' : 'Ativar 2FA'}
            </button>
          </div>

          {/* Card 4: Logout */}
          <div style={{
            backgroundColor: colors.cardBg,
            padding: '1.5rem',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem',
            }}>
              🚪
            </div>
            <h3 style={{
              margin: '0 0 0.5rem 0',
              color: colors.text,
              fontSize: '1.1rem',
            }}>
              Sair da Conta
            </h3>
            <p style={{
              margin: '0 0 1rem 0',
              color: colors.lightText,
              fontSize: '0.9rem',
            }}>
              Encerrar sua sessão atual
            </p>
            <button 
              onClick={() => {
                const { logout } = useAuthStore.getState();
                logout();
                router.push('/login');
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#F64E60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e03e4a';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F64E60';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              Logout
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div style={{
          backgroundColor: colors.cardBg,
          padding: '2rem',
          borderRadius: '8px',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: colors.text,
          }}>
            🔍 Pesquisar Produtos
          </h2>
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <input
              type="text"
              placeholder="Digite o nome do produto..."
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                backgroundColor: colors.bg,
                color: colors.text,
                fontSize: '1rem',
              }}
            />
            <button style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#3699FF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#357abd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3699FF';
            }}>
              Pesquisar
            </button>
          </div>
          <p style={{
            margin: 0,
            color: colors.lightText,
            fontSize: '0.9rem',
          }}>
            💡 Pesquise produtos em múltiplos e-commerce e compare preços em tempo real
          </p>
        </div>
      </div>
    </MetronicLayout>  );
}