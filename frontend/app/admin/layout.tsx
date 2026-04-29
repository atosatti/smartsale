'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import Link from 'next/link';
import { 
  Users, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Activity,
  Settings,
  Home,
  Book
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, setUser, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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
      console.log('[AdminLayout] Token encontrado, carregando dados do usuário...');
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
            console.log('[AdminLayout] Usuário carregado:', data.user);
          } else {
            // Token inválido
            localStorage.removeItem('token');
            router.push('/login');
          }
        } catch (error) {
          console.error('[AdminLayout] Erro ao carregar usuário:', error);
          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      };
      loadUser();
    } else {
      // User já existe
      setIsLoading(false);
    }
  }, [user, router, setUser]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      label: 'Voltar ao Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Dashboard Admin',
      href: '/admin',
      icon: BarChart3,
    },
    {
      label: 'Usuários',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'Integrações',
      href: '/admin/integrations',
      icon: Shield,
    },
    {
      label: 'Auditoria',
      href: '/admin/audit-logs',
      icon: Activity,
    },
    {
      label: 'Configurações',
      href: '/admin/settings',
      icon: Settings,
    },
    {
      label: 'Documentação',
      href: '/admin/documentacao',
      icon: Book,
    },
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 flex flex-col overflow-hidden border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        {/* Logo/Header */}
        <div className={`h-16 flex items-center justify-between px-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-500" />
              <span className={`font-bold whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.href}>
                {index === 1 && (
                  <div className={`my-2 px-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                )}
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-2 group ${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm font-medium whitespace-nowrap group-hover:text-white">
                      {item.label}
                    </span>
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className={`border-t p-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-red-500/10 hover:text-red-400' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-sm font-medium">Sair</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Top Bar */}
        <div className={`h-16 flex items-center justify-between px-6 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SmartSale Admin</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            {user && (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <Shield className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className={`flex-1 overflow-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
