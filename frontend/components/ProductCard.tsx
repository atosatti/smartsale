'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/store/productStore';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onSave?: (product: Product) => void;
}

export const ProductCard = ({ product, onSelect, onSave }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      onSave?.(product);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-white dark:bg-[#1a1a27] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {!imageError && product.thumbnail ? (
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <span className="text-gray-400 dark:text-gray-500 text-sm">Sem imagem</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {product.official_store && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
              Oficial
            </span>
          )}
          {product.condition === 'new' && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              Novo
            </span>
          )}
        </div>

        {/* Free Shipping Badge */}
        {product.shipping?.free_shipping && (
          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            Frete Grátis
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col h-48">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {product.title}
        </h3>

        {/* Price */}
        <div className="mb-3">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          {product.soldQuantity && product.soldQuantity > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {product.soldQuantity} vendidos
            </div>
          )}
        </div>

        {/* Seller Info */}
        {product.seller && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 flex-grow">
            <div className="font-medium truncate">{product.seller.nickname}</div>
            {product.seller.reputation && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500">★</span>
                {product.seller.reputation.positive_feedback && (
                  <span className="text-xs">
                    {product.seller.reputation.positive_feedback}% positivo
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {onSave && (
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className="w-full mt-auto px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded transition-colors"
          >
            {isSaving ? 'Salvando...' : '💾 Salvar'}
          </button>
        )}
      </div>
    </div>
  );
};
