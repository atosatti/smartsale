'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';
import toast from 'react-hot-toast';

interface Payment {
  id: string | number;
  amount: number | string;
  currency: string;
  status: string;
  created: string;
  description: string;
  invoice_url?: string;
}

interface PaymentHistoryTableProps {
  token: string;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({ token }) => {
  const { isDarkMode } = useThemeStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${apiUrl}/payments/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar histórico de pagamentos');
      }

      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err: any) {
      console.error('Erro:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const formatCurrency = (amount: number | string, currency: string) => {
    // amount já está em REAIS, não em centavos
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(numAmount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      succeeded: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: '✅ Sucesso' },
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: '⏳ Pendente' },
      failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: '❌ Falhou' },
      canceled: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', label: '⊘ Cancelado' },
    };

    const config = statusMap[status] || statusMap['pending'];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
        <p className={isDarkMode ? 'text-red-300' : 'text-red-700'}>Erro: {error}</p>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className={`p-8 rounded-lg border text-center ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Nenhum pagamento encontrado
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-lg shadow-md overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">💳 Histórico de Pagamentos</h3>
              <p className="text-blue-100 text-sm mt-1">{payments.length} transações encontradas</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Data</th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Valor</th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Descrição</th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>ID da Transação</th>
                <th className={`px-6 py-4 text-center text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className={`border-b transition-colors ${
                    isDarkMode
                      ? 'border-gray-700 hover:bg-gray-700/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatDate(payment.created)}
                  </td>
                  <td className={`px-6 py-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {payment.description || 'Pagamento de assinatura'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className={`px-6 py-4 text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span title={String(payment.id)}>{String(payment.id).substring(0, 12)}...</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {payment.invoice_url && (
                      <a
                        href={payment.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        📄 Invoice
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          🔄 Atualizar
        </button>
      </div>
    </>
  );
};
