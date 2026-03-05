'use client';

import { useState, useCallback } from 'react';
import { useProductStore } from '@/store/productStore';
import { productAPI } from '@/lib/services';
import toast from 'react-hot-toast';
import { FilterPanel, PriceRangeFilter, SellerSearchFilter } from '@/components/filters';
import { useSubscriptionExpiredModal } from '@/hooks/useSubscriptionExpiredModal';
import { SubscriptionExpiredModal } from './SubscriptionExpiredModal';

interface ProductSearchProps {
  onResultsUpdate?: (count: number) => void;
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'price_asc', label: 'Preço (menor)' },
  { value: 'price_desc', label: 'Preço (maior)' },
  { value: 'newest', label: 'Mais novo' },
];

export const ProductSearch = ({ onResultsUpdate }: ProductSearchProps) => {
  const {
    searchQuery,
    filters,
    searchMode,
    sellerId,
    setSearchQuery,
    setSearchResults,
    setIsLoading,
    setError,
    setFilters,
    setSearchMode,
    setSellerId,
  } = useProductStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { showExpiredModal, setShowExpiredModal, handleSubscriptionError } = useSubscriptionExpiredModal();

  const handleSearch = useCallback(async () => {
    if (searchMode === 'public' && !localQuery.trim()) {
      toast.error('Digite um termo de busca');
      return;
    }

    if (searchMode === 'seller' && !sellerId) {
      toast.error('Digite um ID de vendedor');
      return;
    }

    try {
      setSearchQuery(localQuery);
      setIsLoading(true);
      setError(null);

      const response = await productAPI.search(
        localQuery,
        filters.limit,
        filters.offset,
        filters.sort,
        filters.category,
        filters,
        searchMode,
        sellerId
      );

      if (response.data.success) {
        setSearchResults(response.data.data);
        onResultsUpdate?.(response.data.count);
        toast.success(`${response.data.count} produtos encontrados`);
      }
    } catch (error: any) {
      // Verifica se é erro de assinatura expirada
      if (handleSubscriptionError(error)) {
        return;
      }

      const message = error.response?.data?.error || 'Erro ao buscar produtos';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    localQuery,
    filters,
    searchMode,
    sellerId,
    setSearchQuery,
    setSearchResults,
    setIsLoading,
    setError,
    onResultsUpdate,
    handleSubscriptionError,
  ]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    setFilters({ sort: newSort, offset: 0 });
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters({ limit: newLimit, offset: 0 });
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    handleSearch();
  };

  const handlePriceChange = (minPrice: number | null, maxPrice: number | null) => {
    setFilters({
      price_min: minPrice ?? undefined,
      price_max: maxPrice ?? undefined,
      offset: 0,
    });
  };

  const handleSellerChange = (id: string | null) => {
    setSellerId(id);
    if (id) {
      setSearchMode('seller');
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="bg-white dark:bg-[#1a1a27] rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          🔎 Tipo de Busca
        </h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={searchMode === 'public'}
              onChange={() => {
                setSearchMode('public');
                setSellerId(null);
              }}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">📱 Busca Pública</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={searchMode === 'seller'}
              onChange={() => setSearchMode('seller')}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">👤 Itens do Vendedor</span>
          </label>
        </div>
      </div>

      {/* Seller Search Filter */}
      {searchMode === 'seller' && (
        <SellerSearchFilter onSellerChange={handleSellerChange} sellerId={sellerId || ''} />
      )}

      {/* Search Bar */}
      {searchMode === 'public' && (
        <div className="bg-white dark:bg-[#1a1a27] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Buscar produtos... (ex: notebook, iPhone, etc)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              🔍 Buscar
            </button>
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordenar por
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resultados por página
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
              >
                <option value={10}>10 resultados</option>
                <option value={25}>25 resultados</option>
                <option value={50}>50 resultados (padrão)</option>
                <option value={100}>100 resultados</option>
              </select>
            </div>

            {/* Category (Future) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) =>
                  setFilters({
                    category: e.target.value || undefined,
                    offset: 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
              >
                <option value="">Todas as categorias</option>
                <option value="electronics" disabled>
                  🔧 Eletrônicos
                </option>
                <option value="fashion" disabled>
                  👕 Moda
                </option>
                <option value="home" disabled>
                  🏠 Casa
                </option>
              </select>
            </div>
          </div>

          {/* Info Text */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>
              💡 Dica: Use aspas para buscar expressões exatas, ex: "iPhone 14 Pro Max"
            </p>
          </div>
        </div>
      )}

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
      >
        {showAdvancedFilters ? '▲' : '▼'} {showAdvancedFilters ? 'Ocultar' : 'Mostrar'} Filtros Avançados
      </button>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Filter */}
          {searchMode === 'public' && (
            <PriceRangeFilter
              onPriceChange={handlePriceChange}
              minPrice={filters.price_min}
              maxPrice={filters.price_max}
            />
          )}

          {/* Filter Panel */}
          <div className={searchMode === 'public' ? 'lg:col-span-2' : ''}>
            <FilterPanel
              searchType={searchMode}
              onFiltersChange={handleFiltersChange}
              selectedFilters={filters}
            />
          </div>
        </div>
      )}

      {/* Modal de assinatura expirada */}
      <SubscriptionExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
      />
    </div>
  );
};
