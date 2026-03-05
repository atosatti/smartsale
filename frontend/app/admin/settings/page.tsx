'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Configurações de Admin</h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Gerencie configurações do sistema e privilégios</p>
      </div>

      {/* Coming Soon */}
      <div className={`rounded-lg p-8 text-center border ${
        isDarkMode
          ? 'bg-blue-500/10 border-blue-500/20'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <Shield className={`w-16 h-16 mx-auto mb-4 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-600'
        }`} />
        <h2 className={`text-2xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Em Desenvolvimento</h2>
        <p className={`mb-6 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Mais configurações de admin serão adicionadas em breve
        </p>
        <a
          href="/admin"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDarkMode
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Voltar ao Dashboard
        </a>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-lg p-6 border ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>API Status</h3>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Todas as rotas de admin estão funcionando corretamente
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-6 border ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Auditoria Ativa</h3>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Todas as ações de admin estão sendo registradas
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-6 border ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Middleware RBAC</h3>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Controle de acesso baseado em função está ativo
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-lg p-6 border ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>User Management</h3>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Você pode gerenciar usuários, roles e permissões
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Features */}
      <div className={`rounded-lg p-6 border ${
        isDarkMode
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Recursos Disponíveis</h2>
        <div className="space-y-3">
          <div className={`flex items-center gap-3 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Dashboard com estatísticas em tempo real</span>
          </div>
          <div className={`flex items-center gap-3 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Listagem e filtro de usuários</span>
          </div>
          <div className={`flex items-center gap-3 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Visualizar detalhes completos do usuário</span>
          </div>
          <div className={`flex items-center gap-3 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Editar informações de usuário e role</span>
          </div>
          <div className={`flex items-center gap-3 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Deletar usuários (soft delete)</span>
          </div>
          <div className={`flex items-center gap-3 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Visualizar histórico de atividades</span>
          </div>
          <div className={`flex items-center gap-3 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Logs de auditoria detalhados</span>
          </div>
          <div className={`flex items-center gap-3 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span>Notas internas por usuário</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className={`rounded-lg p-6 flex gap-4 border ${
        isDarkMode
          ? 'bg-yellow-500/10 border-yellow-500/20'
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
        }`} />
        <div>
          <h3 className={`font-semibold mb-2 ${
            isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
          }`}>Segurança</h3>
          <p className={`text-sm mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Todas as ações de administrador são registradas em logs de auditoria. Certifique-se de:
          </p>
          <ul className={`text-sm space-y-1 list-disc list-inside ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <li>Não compartilhar suas credenciais de admin</li>
            <li>Fazer logout após usar a painel</li>
            <li>Revisar logs de auditoria regularmente</li>
            <li>Usar autenticação de dois fatores (2FA)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
