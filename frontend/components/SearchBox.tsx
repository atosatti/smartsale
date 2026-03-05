'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { productAPI } from '@/lib/services';
import { useSearchStore } from '@/store/searchStore';
import { useSubscriptionExpiredModal } from '@/hooks/useSubscriptionExpiredModal';
import { SubscriptionExpiredModal } from './SubscriptionExpiredModal';

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const { setResults, setLoading } = useSearchStore();
  const { showExpiredModal, setShowExpiredModal, handleSubscriptionError } = useSubscriptionExpiredModal();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast.error('Digite um produto para pesquisar');
      return;
    }

    setLoading(true);
    try {
      const response = await productAPI.search(query);
      setResults(response.data.results);
      toast.success(`${response.data.results.length} produtos encontrados`);
    } catch (error: any) {
      // Verifica se é erro de assinatura expirada
      if (handleSubscriptionError(error)) {
        return;
      }

      toast.error(error.response?.data?.error || 'Erro na pesquisa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite o produto que deseja pesquisar..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Pesquisar
        </button>
      </form>

      {/* Modal de assinatura expirada */}
      <SubscriptionExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
      />
    </>
  );
}
