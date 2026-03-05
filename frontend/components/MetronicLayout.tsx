'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';

interface MetronicLayoutProps {
  children: ReactNode;
}

export default function MetronicLayout({ children }: MetronicLayoutProps) {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { user, logout, token } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const colors = {
    headerBg: '#1a1a27',
    headerText: '#ffffff',
    border: isDarkMode ? '#404050' : '#dee2e6',
    sidebarBg: isDarkMode ? '#1a1a27' : '#f8f9fa',
    sidebarText: isDarkMode ? '#ffffff' : '#333',
    sidebarHover: isDarkMode ? '#252835' : '#e8ecf1',
  };

  const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
    { icon: '👤', label: 'Perfil', href: '/profile', id: 'profile' },
    { icon: '💳', label: 'Plano', href: '/plans', id: 'plans' },
    { icon: '📋', label: 'Minha Assinatura', href: '/subscription', id: 'subscription' },
    { icon: '🔒', label: 'Segurança', href: '/security', id: 'security' },
    { icon: '📚', label: 'Ajuda', href: '/help', id: 'help' },
    ...(user?.role === 'admin' ? [{ icon: '⚙️', label: 'Admin', href: '/admin', id: 'admin' }] : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#1a1a27] text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-[#1a1a27] text-white sticky top-0 z-50 border-b border-gray-700"
        style={{
          padding: '1rem 0',
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%',
        }}>
          {/* Left Section - Logo and Sidebar Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            paddingLeft: '1.5rem',
            backgroundColor: colors.headerBg,
          }}>
            {/* Sidebar Toggle */}
            {mounted && token && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: colors.headerText,
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  transition: 'opacity 0.3s ease',
                }}
                title="Toggle Sidebar"
              >
                ☰
              </button>
            )}
            
            {/* Logo */}
            <Link href="/" style={{
              textDecoration: 'none',
              color: colors.headerText,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              transition: 'opacity 0.3s ease',
            }}>
              SmartSale
            </Link>
          </div>

          {/* Right Section - User Info, Logout, and Dark Mode Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            paddingRight: '1.5rem',
          }}>
            {/* User Info */}
            {mounted && token && user && (
              <>
                <span style={{
                  color: colors.headerText,
                  fontSize: '0.9rem',
                }}>
                  Olá, {user.firstName}
                </span>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#F64E60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    transition: 'background-color 0.3s ease',
                  }}
                  title="Logout"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d63050';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F64E60';
                  }}
                >
                  Sair
                </button>
              </>
            )}

            {/* Dark Mode Toggle - Last Element */}
            <button
              onClick={toggleDarkMode}
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'transparent',
                border: 'none',
                color: colors.headerText,
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'opacity 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {mounted && token && (
          <aside 
            className="bg-gray-100 dark:bg-[#1a1a27] border-r border-gray-300 dark:border-gray-700 overflow-hidden transition-all duration-300 pt-6"
            style={{
              width: !sidebarOpen && sidebarHovered ? '250px' : sidebarOpen ? '250px' : '80px',
            }}
            onMouseEnter={() => !sidebarOpen && setSidebarHovered(true)}
            onMouseLeave={() => setSidebarHovered(false)}
          >
            <nav>
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem 1.5rem',
                    color: colors.sidebarText,
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    borderLeft: '4px solid transparent',
                    gap: '1rem',
                    justifyContent: sidebarOpen || sidebarHovered ? 'flex-start' : 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.sidebarHover;
                    e.currentTarget.style.borderLeftColor = '#3699FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                  title={!sidebarOpen && !sidebarHovered ? item.label : undefined}
                >
                  <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                  {(sidebarOpen || sidebarHovered) && (
                    <span style={{ fontWeight: '500', whiteSpace: 'nowrap' }}>{item.label}</span>
                  )}
                </Link>
              ))}
            </nav>
          </aside>
        )}


        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-white dark:bg-[#1a1a27]">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-[#252835] border-t border-gray-300 dark:border-gray-700 px-6 py-6 text-gray-800 dark:text-gray-300 text-sm"
        style={{
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="m-0">&copy; 2026 SmartSale. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Termos de Serviço
            </a>
            <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Política de Privacidade
            </a>
            <a href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Sobre
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
