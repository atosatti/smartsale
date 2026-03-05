'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { subscriptionAPI } from '@/lib/services';
import MetronicLayout from '@/components/MetronicLayout';
import { StripeCheckout } from '@/components/StripeCheckout';
import toast from 'react-hot-toast';

interface Plan {
  name: string;
  display_name: string;
  monthly_price: number;
  features: string[];
}

export default function Plans() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else {
      fetchPlans();
      // Obter plano atual do usuário
      if (user?.plan) {
        setCurrentPlan(user.plan);
      }
    }
  }, [token, router, user]);

  const fetchPlans = async () => {
    try {
      const response = await subscriptionAPI.getPlans();
      console.log('Response from getPlans:', response);
      
      // Axios retorna em response.data
      const plans = response.data?.plans || response?.plans;
      if (plans) {
        setPlans(plans);
      } else {
        console.error('Planos não encontrados na resposta:', response);
        toast.error('Estrutura de resposta inválida');
      }
    } catch (error: any) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar planos: ' + (error.message || 'desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId: string, planName: string, price: number) => {
    // Se já é o plano atual, não fazer nada
    if (planId === currentPlan) {
      toast.info('Você já está neste plano!');
      return;
    }

    setSelectedPlan({
      id: planId,
      name: planName,
      price,
    });
  };

  const handlePaymentSuccess = () => {
    setSelectedPlan(null);
    toast.success('Assinatura ativada com sucesso!');
    // Recarregar user do store para pegar subscription_plan atualizado
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (loading) return <MetronicLayout><div style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando...</div></MetronicLayout>;

  return (
    <MetronicLayout>
      <div className="max-w-6xl mx-auto p-8">
        {/* Page header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Planos de Assinatura
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-base">
            Escolha o plano que melhor se adequa às suas necessidades
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {plan.display_name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    R$ {plan.monthly_price.toFixed(2)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/mês</span>
                </div>
              </div>

              <ul className="list-none p-0 m-0 mb-6 flex-1">
                {plan.features?.map((feature, idx) => (
                  <li
                    key={idx}
                    className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm"
                  >
                    <span className="text-teal-500 dark:text-teal-400 font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="px-6 pb-6">
                <button
                  onClick={() =>
                    handleUpgrade(
                      key,
                      plan.display_name,
                      (plan as any).price_cents || Math.round(plan.monthly_price * 100)
                    )
                  }
                  className={`w-full py-3 px-4 rounded font-bold transition-colors duration-300 ${
                    key === currentPlan
                      ? 'bg-green-500 hover:bg-green-600 text-white cursor-default'
                      : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                  }`}
                  disabled={key === currentPlan}
                >
                  {key === currentPlan ? 'Plano Atual' : 'Contratar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      {selectedPlan && (
        <StripeCheckout
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          amount={selectedPlan.price}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setSelectedPlan(null)}
        />
      )}
    </MetronicLayout>
  );
}
