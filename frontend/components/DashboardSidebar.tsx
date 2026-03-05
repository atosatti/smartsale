'use client';

import React from 'react';
import Link from 'next/link';
import { useThemeStore } from '@/store/themeStore';

interface DashboardSidebarProps {
  activeSection?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeSection = 'dashboard' }) => {
  const { isDarkMode } = useThemeStore();

  const colors = {
    sidebarBg: isDarkMode ? '#252835' : '#ffffff',
    text: isDarkMode ? '#e0e0e0' : '#333',
    lightText: isDarkMode ? '#999' : '#666',
    border: isDarkMode ? '#404050' : '#dee2e6',
    hoverBg: isDarkMode ? '#404050' : '#f5f5f5',
    activeBg: '#3699FF',
  };

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', href: '/dashboard', icon: '📊' },
    { id: 'profile', label: '👤 Perfil', href: '/profile', icon: '👤' },
    { id: 'plans', label: '💳 Plano de Assinatura', href: '/plans', icon: '💳' },
    { id: 'subscription', label: '📋 Minha Assinatura', href: '/subscription', icon: '📋' },
    { id: 'security', label: '🔒 Segurança', href: '/security', icon: '🔒' },
    { id: 'help', label: '📚 Centro de Ajuda', href: '/help', icon: '📚' },
  ];

  return (
    <aside style={{
      backgroundColor: colors.sidebarBg,
      width: '280px',
      minHeight: 'calc(100vh - 60px)',
      padding: '2rem 0',
      position: 'sticky',
      top: '60px',
      overflowY: 'auto',
      transition: 'all 0.3s ease',
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: `1px solid ${colors.border}`,
        marginBottom: '1.5rem',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '0.85rem',
          fontWeight: '700',
          color: colors.lightText,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Menu
        </h3>
      </div>

      {/* Menu Items */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '0 1rem',
      }}>
        {menuItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                textDecoration: 'none',
                color: isActive ? '#ffffff' : colors.text,
                backgroundColor: isActive ? colors.activeBg : 'transparent',
                transition: 'all 0.2s ease',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = colors.hoverBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <span>{item.label.split(' ').slice(1).join(' ')}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{
        margin: '2rem 1rem 0',
        borderTop: `1px solid ${colors.border}`,
      }} />

      {/* Info Section */}
      <div style={{
        padding: '1.5rem',
        marginTop: '1rem',
      }}>
        <div style={{
          backgroundColor: colors.hoverBg,
          padding: '1rem',
          borderRadius: '6px',
          border: `1px solid ${colors.border}`,
        }}>
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.75rem',
            fontWeight: '700',
            color: colors.lightText,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Versão
          </p>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: colors.text,
            fontWeight: '500',
          }}>
            1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
