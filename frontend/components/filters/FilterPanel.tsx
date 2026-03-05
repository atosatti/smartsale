'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterGroup {
  id: string;
  title: string;
  options: Array<{
    id: string;
    label: string;
    value: string;
  }>;
}

interface SelectedFilters {
  [key: string]: string | string[];
}

interface FilterPanelProps {
  searchType?: 'seller' | 'public';
  onFiltersChange: (filters: SelectedFilters) => void;
  selectedFilters?: SelectedFilters;
}

const SELLER_FILTERS: FilterGroup[] = [
  {
    id: 'status',
    title: '📊 Status',
    options: [
      { id: 'active', label: 'Ativos', value: 'active' },
      { id: 'paused', label: 'Pausados', value: 'paused' },
      { id: 'closed', label: 'Fechados', value: 'closed' },
      { id: 'under_review', label: 'Em Revisão', value: 'under_review' },
    ],
  },
  {
    id: 'orders',
    title: '📈 Ordenar por',
    options: [
      { id: 'price_asc', label: 'Preço (menor)', value: 'price_asc' },
      { id: 'price_desc', label: 'Preço (maior)', value: 'price_desc' },
      { id: 'quantity_asc', label: 'Quantidade (menor)', value: 'quantity_asc' },
      { id: 'quantity_desc', label: 'Quantidade (maior)', value: 'quantity_desc' },
      { id: 'last_updated_asc', label: 'Atualizado (antigo)', value: 'last_updated_asc' },
      { id: 'last_updated_desc', label: 'Atualizado (recente)', value: 'last_updated_desc' },
      { id: 'stop_time_asc', label: 'Finalizando em breve', value: 'stop_time_asc' },
    ],
  },
  {
    id: 'listing_type_id',
    title: '🏷️ Tipo de Listagem',
    options: [
      { id: 'gold_pro', label: 'Gold Pro', value: 'gold_pro' },
      { id: 'gold', label: 'Gold', value: 'gold' },
      { id: 'silver', label: 'Silver', value: 'silver' },
      { id: 'free', label: 'Gratuito', value: 'free' },
    ],
  },
  {
    id: 'buying_mode',
    title: '🛒 Modo de Compra',
    options: [
      { id: 'buy_it_now', label: 'Comprar Agora', value: 'buy_it_now' },
      { id: 'auction', label: 'Leilão', value: 'auction' },
      { id: 'classified', label: 'Classificado', value: 'classified' },
    ],
  },
  {
    id: 'shipping_mode',
    title: '📦 Modo de Envio',
    options: [
      { id: 'me2', label: 'Mercado Envios 2', value: 'me2' },
      { id: 'me1', label: 'Mercado Envios', value: 'me1' },
      { id: 'not_specified', label: 'Não Especificado', value: 'not_specified' },
    ],
  },
  {
    id: 'reputation_health_gauge',
    title: '❤️ Saúde da Reputação',
    options: [
      { id: 'healthy', label: 'Saudável', value: 'healthy' },
      { id: 'warning', label: 'Aviso', value: 'warning' },
      { id: 'unhealthy', label: 'Prejudicada', value: 'unhealthy' },
    ],
  },
  {
    id: 'labels',
    title: '⭐ Rótulos',
    options: [
      { id: 'with_free_shipping', label: 'Frete Grátis', value: 'with_free_shipping' },
      { id: 'without_free_shipping', label: 'Sem Frete Grátis', value: 'without_free_shipping' },
      { id: 'with_mercadolibre_envios', label: 'Mercado Envios', value: 'with_mercadolibre_envios' },
      { id: 'accepts_mercadopago', label: 'Aceita MercadoPago', value: 'accepts_mercadopago' },
      { id: 'with_bids', label: 'Com Propostas', value: 'with_bids' },
      { id: 'ending_soon', label: 'Finalizando em Breve', value: 'ending_soon' },
      { id: 'quality', label: 'Qualidade Premium', value: 'quality' },
      { id: 'without_stock', label: 'Sem Estoque', value: 'without_stock' },
    ],
  },
];

const PUBLIC_FILTERS: FilterGroup[] = [
  {
    id: 'condition',
    title: '✨ Condição',
    options: [
      { id: 'new', label: 'Novo', value: 'new' },
      { id: 'used', label: 'Usado', value: 'used' },
      { id: 'refurbished', label: 'Recondicionado', value: 'refurbished' },
    ],
  },
  {
    id: 'shipping',
    title: '🚚 Envio',
    options: [
      { id: 'free', label: 'Frete Grátis', value: 'free' },
      { id: 'mercadoenvios', label: 'Mercado Envios', value: 'mercadoenvios' },
    ],
  },
];

const CollapsibleFilterGroup = ({
  group,
  selected,
  onToggle,
  isOpen,
}: {
  group: FilterGroup;
  selected: string | string[] | undefined;
  onToggle: (id: string, value: string) => void;
  isOpen: boolean;
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{group.title}</h3>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </div>

        {isOpen && (
          <div className="mt-3 space-y-2">
            {group.options.map((option) => {
              const isSelected = Array.isArray(selected)
                ? selected.includes(option.value)
                : selected === option.value;

              return (
                <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(group.id, option.value)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    {option.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const FilterPanel = ({
  searchType = 'public',
  onFiltersChange,
  selectedFilters = {},
}: FilterPanelProps) => {
  const filters = searchType === 'seller' ? SELLER_FILTERS : PUBLIC_FILTERS;
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [localFilters, setLocalFilters] = useState<SelectedFilters>(selectedFilters);

  const toggleGroup = (groupId: string) => {
    const newOpen = new Set(openGroups);
    if (newOpen.has(groupId)) {
      newOpen.delete(groupId);
    } else {
      newOpen.add(groupId);
    }
    setOpenGroups(newOpen);
  };

  const handleFilterToggle = (groupId: string, value: string) => {
    setLocalFilters((prev) => {
      const current = prev[groupId];
      let updated;

      if (Array.isArray(current)) {
        if (current.includes(value)) {
          updated = current.filter((v) => v !== value);
          if (updated.length === 0) {
            const newFilters = { ...prev };
            delete newFilters[groupId];
            return newFilters;
          }
        } else {
          updated = [...current, value];
        }
      } else if (current === value) {
        const newFilters = { ...prev };
        delete newFilters[groupId];
        return newFilters;
      } else {
        updated = [value];
        if (Array.isArray(prev[groupId])) {
          updated = [value];
        } else {
          updated = value;
        }
      }

      return {
        ...prev,
        [groupId]: updated,
      };
    });
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(localFilters).length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">🔍 Filtros</h2>
      </div>

      {/* Filter Groups */}
      <div className="max-h-96 overflow-y-auto">
        {filters.map((group) => (
          <div
            key={group.id}
            onClick={() => toggleGroup(group.id)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
          >
            <CollapsibleFilterGroup
              group={group}
              selected={localFilters[group.id]}
              onToggle={handleFilterToggle}
              isOpen={openGroups.has(group.id)}
            />
          </div>
        ))}
      </div>

      {/* Footer with Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={handleApplyFilters}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
        >
          ✅ Aplicar Filtros
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Limpar Filtros
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Filtros Ativos: {Object.keys(localFilters).length}
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([groupId, values]) => {
              const group = filters.find((g) => g.id === groupId);
              const valueArray = Array.isArray(values) ? values : [values];
              return valueArray.map((value) => {
                const option = group?.options.find((o) => o.value === value);
                return (
                  <span
                    key={`${groupId}-${value}`}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
                  >
                    {option?.label}
                    <button
                      onClick={() => handleFilterToggle(groupId, value)}
                      className="hover:text-blue-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              });
            })}
          </div>
        </div>
      )}
    </div>
  );
};
