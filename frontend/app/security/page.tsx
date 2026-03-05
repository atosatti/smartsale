'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import MetronicLayout from '@/components/MetronicLayout';
import { authAPI } from '@/lib/services';
import toast from 'react-hot-toast';

export default function Security() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [loading2FA, setLoading2FA] = useState(true);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push('/login');
    }
  }, [token, router, mounted]);

  // Carregar status de 2FA
  useEffect(() => {
    if (mounted && token) {
      check2FAStatus();
    }
  }, [mounted, token]);

  const check2FAStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/auth/2fa-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTwoFAEnabled(data.twoFAEnabled);
      }
    } catch (error) {
      console.error('Erro ao carregar status de 2FA:', error);
    } finally {
      setLoading2FA(false);
    }
  };

  if (!mounted || !token) {
    return (
      <MetronicLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin mb-4">⌛</div>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </MetronicLayout>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async () => {
    setIsSaving(true);
    try {
      // Validações
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        toast.error('Todos os campos são obrigatórios');
        setIsSaving(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('As senhas não coincidem');
        setIsSaving(false);
        return;
      }

      if (formData.newPassword.length < 8) {
        toast.error('A senha deve ter no mínimo 8 caracteres');
        setIsSaving(false);
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        toast.error('A nova senha deve ser diferente da atual');
        setIsSaving(false);
        return;
      }

      const response = await authAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      toast.success('Senha alterada com sucesso!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao alterar senha';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      if (!twoFACode.trim()) {
        toast.error('Digite o código de 6 dígitos do app autenticador');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/auth/disable-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token: twoFACode }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Código inválido');
        return;
      }

      toast.success('2FA desabilitado com sucesso!');
      setTwoFAEnabled(false);
      setIsDisabling2FA(false);
      setTwoFACode('');
    } catch (error: any) {
      toast.error('Erro ao desabilitar 2FA');
      console.error(error);
    }
  };

  return (
    <MetronicLayout>
      <div className="max-w-5xl mx-auto p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-500 mb-2">
            🔒 Segurança
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerenciar configurações de segurança da sua conta
          </p>
        </div>

        {/* Change Password Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Alterar Senha
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Atualize sua senha regularmente para manter sua conta segura
            </p>

            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-300"
              >
                🔐 Alterar Senha
              </button>
            ) : (
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite sua nova senha"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Mínimo 8 caracteres
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirme sua nova senha"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className={`px-6 py-2 font-semibold rounded-lg transition-colors duration-300 text-white ${
                      isSaving
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {isSaving ? '⏳ Salvando...' : '✓ Alterar Senha'}
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setFormData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Two-Factor Authentication Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Autenticação em Duas Etapas (2FA)
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Adicione uma camada extra de segurança à sua conta com autenticação de dois fatores
            </p>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              {loading2FA ? (
                <p className="text-sm text-gray-700 dark:text-gray-300">Carregando...</p>
              ) : twoFAEnabled ? (
                <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
                  ✓ 2FA está ativado na sua conta
                </p>
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  A autenticação em duas etapas protege sua conta exigindo um código de verificação além da sua senha.
                </p>
              )}
            </div>

            {!loading2FA && (
              <>
                {!twoFAEnabled ? (
                  <button
                    onClick={() => router.push('/setup-2fa')}
                    className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    ⚙️ Configurar 2FA
                  </button>
                ) : (
                  <>
                    {!isDisabling2FA ? (
                      <button
                        onClick={() => setIsDisabling2FA(true)}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-300"
                      >
                        ⛔ Desabilitar 2FA
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Para desabilitar o 2FA, digite o código de 6 dígitos do seu app autenticador:
                        </p>
                        <div>
                          <input
                            type="text"
                            placeholder="000000"
                            value={twoFACode}
                            onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleDisable2FA}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-300"
                          >
                            ✓ Confirmar Desativação
                          </button>
                          <button
                            onClick={() => {
                              setIsDisabling2FA(false);
                              setTwoFACode('');
                            }}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-300"
                          >
                            ✕ Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Security Tips Section */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700 p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">
            💡 Dicas de Segurança
          </h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>✓ Use uma senha forte com letras maiúsculas, minúsculas, números e símbolos</li>
            <li>✓ Não compartilhe sua senha com ninguém</li>
            <li>✓ Ative a autenticação em duas etapas para maior proteção</li>
            <li>✓ Altere sua senha regularmente (a cada 3 meses)</li>
            <li>✓ Use senhas únicas para cada serviço online</li>
          </ul>
        </div>
      </div>
    </MetronicLayout>
  );
}
