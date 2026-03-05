'use client';

import { Product } from '@/store/productStore';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onSelectProduct: (product: Product) => void;
  onSaveProduct?: (product: Product) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const ProductGrid = ({
  products,
  isLoading = false,
  onSelectProduct,
  onSaveProduct,
  hasMore = false,
  onLoadMore,
}: ProductGridProps) => {
  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-square animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Nenhum produto encontrado. Tente uma busca diferente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={onSelectProduct}
            onSave={onSaveProduct}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? 'Carregando mais...' : 'Carregar mais resultados'}
          </button>
        </div>
      )}
    </div>
  );
};
