'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import MetronicLayout from '@/components/MetronicLayout';
import { authAPI } from '@/lib/services';
import toast from 'react-hot-toast';

interface SubscriptionInfo {
  plan_name: string;
  status: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  is_trial: boolean;
  trial_end_date: string | null;
  max_searches_per_day: number;
  payment_method_type: string | null;
  payment_method_last_4: string | null;
}

export default function Profile() {
  const router = useRouter();
  const { user, token, setUser } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (mounted && !token) {
      router.push('/login');
    } else if (user) {
      setFormData({
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        email: user.email,
      });
      // Carregar informações de assinatura
      fetchSubscriptionInfo();
    }
  }, [token, user, router, mounted]);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await authAPI.getProfile();
      const info = response.data.subscription;
      setSubscriptionInfo(info);
      
      // Calcular dias restantes
      if (info.subscription_end_date) {
        const endDate = new Date(info.subscription_end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysRemaining(diffDays > 0 ? diffDays : 0);
      }
    } catch (error) {
      console.error('Erro ao carregar informações de assinatura:', error);
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await authAPI.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      // Atualizar store com novos dados
      setUser({
        ...user!,
        firstName: response.data.user.firstName,
        lastName: response.data.user.lastName,
      });

      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao salvar perfil');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MetronicLayout>
      <div className="max-w-5xl mx-auto p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-500 mb-2">
            👤 Meu Perfil
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerenciar informações da sua conta e assinatura
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Profile Header with Avatar */}
          <div className="flex items-center gap-6 p-8 border-b border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-5xl shadow-lg">
              👤
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {user?.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Membro desde {new Date(user?.createdAt || new Date()).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Subscription Info Cards */}
          {subscriptionInfo && (
            <div className="p-8 bg-gray-50 dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Plan Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">PLANO ATUAL</div>
                <div className="text-2xl font-bold text-blue-500 capitalize">
                  {subscriptionInfo.plan_name}
                </div>
                <div className={`text-xs mt-2 px-2 py-1 rounded-full w-fit ${
                  subscriptionInfo.status === 'active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
                }`}>
                  {subscriptionInfo.status === 'active' ? '✓ Ativo' : 'Pendente'}
                </div>
              </div>

              {/* Expiration Date Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">VENCE EM</div>
                {subscriptionInfo.subscription_end_date ? (
                  <>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {daysRemaining} dias
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(subscriptionInfo.subscription_end_date).toLocaleDateString('pt-BR')}
                    </div>
                  </>
                ) : (
                  <div className="text-lg text-gray-500 dark:text-gray-400">N/A</div>
                )}
              </div>

              {/* Daily Searches Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">BUSCAS DIÁRIAS</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {!subscriptionInfo.max_searches_per_day || subscriptionInfo.max_searches_per_day === -1 || subscriptionInfo.max_searches_per_day === 0 ? '∞' : subscriptionInfo.max_searches_per_day}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  por dia
                </div>
              </div>

              {/* Trial Status Card */}
              {!!subscriptionInfo.is_trial && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                  <div className="text-sm text-orange-600 dark:text-orange-400 mb-1 font-medium">PERÍODO DE TESTE</div>
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    Ativo
                  </div>
                  <div className="text-xs text-orange-500 dark:text-orange-400 mt-2">
                    Até {new Date(subscriptionInfo.trial_end_date!).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Editable Fields */}
          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Informações Pessoais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primeiro Nome
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isEditing
                      ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-not-allowed opacity-75'
                  }`}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Último Nome
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isEditing
                      ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-not-allowed opacity-75'
                  }`}
                />
              </div>

              {/* Email (Read Only) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white cursor-not-allowed opacity-75"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email não pode ser alterado
                </p>
              </div>
            </div>

            {/* Payment Method Info */}
            {subscriptionInfo?.payment_method_type && (
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  💳 Método de Pagamento
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    {subscriptionInfo.payment_method_type === 'card' ? '💳' : subscriptionInfo.payment_method_type.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {subscriptionInfo.payment_method_type}
                    </p>
                    {subscriptionInfo.payment_method_last_4 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Terminado em {subscriptionInfo.payment_method_last_4}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => router.push('/plans')}
                    className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    📦 Gerenciar Plano
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-6 py-2 font-semibold rounded-lg transition-colors duration-300 text-white ${
                      isSaving
                        ? 'bg-gray-400 cursor-not-allowed opacity-50'
                        : 'bg-teal-500 hover:bg-teal-600'
                    }`}
                  >
                    {isSaving ? '⏳ Salvando...' : '💾 Salvar'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    ✕ Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MetronicLayout>
  );
}
