'use client';

import { useState, useEffect } from 'react';

interface PriceRangeFilterProps {
  onPriceChange: (minPrice: number | null, maxPrice: number | null) => void;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
}

export const PriceRangeFilter = ({
  onPriceChange,
  minPrice = 0,
  maxPrice = 100000,
  currency = 'R$',
}: PriceRangeFilterProps) => {
  const [localMin, setLocalMin] = useState<number | string>(minPrice || '');
  const [localMax, setLocalMax] = useState<number | string>(maxPrice || '');

  const handleApply = () => {
    const min = localMin ? parseInt(String(localMin)) : null;
    const max = localMax ? parseInt(String(localMax)) : null;

    if (min !== null && max !== null && min > max) {
      alert('O preço mínimo não pode ser maior que o máximo');
      return;
    }

    onPriceChange(min, max);
  };

  const handleClear = () => {
    setLocalMin('');
    setLocalMax('');
    onPriceChange(null, null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">💰 Faixa de Preço</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Min Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mínimo
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{currency}</span>
            <input
              type="number"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Máximo
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{currency}</span>
            <input
              type="number"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              placeholder="100.000"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
        >
          ✅ Aplicar
        </button>
        <button
          onClick={handleClear}
          className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
        >
          🗑️ Limpar
        </button>
      </div>

      {/* Info */}
      {(localMin || localMax) && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-300">
          Faixa: {localMin ? `${currency} ${localMin}` : 'sem mín.'} -{' '}
          {localMax ? `${currency} ${localMax}` : 'sem máx.'}
        </div>
      )}
    </div>
  );
};
