'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface SellerSearchFilterProps {
  onSellerChange: (sellerId: string | null) => void;
  sellerId?: string;
}

export const SellerSearchFilter = ({ onSellerChange, sellerId = '' }: SellerSearchFilterProps) => {
  const [localSellerId, setLocalSellerId] = useState(sellerId);
  const [showHelp, setShowHelp] = useState(false);

  const handleApply = () => {
    if (!localSellerId.trim()) {
      alert('Digite um ID de vendedor válido');
      return;
    }
    onSellerChange(localSellerId);
  };

  const handleClear = () => {
    setLocalSellerId('');
    onSellerChange(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">👤 Buscar por Vendedor</h3>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
          title="Como encontrar o ID do vendedor?"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Help Section */}
      {showHelp && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-2">💡 Como encontrar o ID do vendedor:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>Seu próprio ID:</strong> Vá para seu Perfil → Você verá seu ID (ex: 8476025)
            </li>
            <li>
              <strong>ID de outro vendedor:</strong> Abra o anúncio do vendedor → Vá ao perfil → Copie o número da URL
            </li>
            <li>
              <strong>URL:</strong> mercadolivre.com.br/perfil/<strong>SEU_ID</strong>
            </li>
            <li>
              <strong>Exemplo:</strong> "8476025" é um ID válido
            </li>
          </ul>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ID do Vendedor
        </label>
        <input
          type="text"
          value={localSellerId}
          onChange={(e) => setLocalSellerId(e.target.value)}
          placeholder="Ex: 8476025"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
        />
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          📍 Dica: Encontre o ID na URL do perfil do vendedor
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
        >
          ✅ Buscar Vendedor
        </button>
        {localSellerId && (
          <button
            onClick={handleClear}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-2 px-3 rounded-lg transition text-sm"
          >
            🗑️ Limpar
          </button>
        )}
      </div>

      {/* Info */}
      {localSellerId && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-300">
          Buscando itens do vendedor: <span className="font-bold">{localSellerId}</span>
        </div>
      )}
    </div>
  );
};
