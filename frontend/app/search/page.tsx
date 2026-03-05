'use client';

import { useState } from 'react';
import { ProductSearch } from '@/components/ProductSearch';
import { ProductDataTable } from '@/components/ProductDataTable';
import { useProductStore, Product, ProductDetails } from '@/store/productStore';
import { productAPI } from '@/lib/services';
import toast from 'react-hot-toast';
import MetronicLayout from '@/components/MetronicLayout';

export default function SearchPage() {
  const { searchResults, isLoading, error } = useProductStore();
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [resultCount, setResultCount] = useState(0);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [competitors, setCompetitors] = useState<Product[]>([]);
  const [showCompetitors, setShowCompetitors] = useState(false);

  const handleSelectProduct = async (product: Product) => {
    try {
      setLoadingDetails(true);
      const response = await productAPI.getDetails(product.id);

      if (response.data.success) {
        setSelectedProduct(response.data.data);
        setShowDetails(true);
        setCompetitors([]);
        setShowCompetitors(false);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar detalhes do produto');
      console.error(error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleFindCompetitors = async (productId: string) => {
    try {
      setLoadingDetails(true);
      const response = await productAPI.getCompetitors(productId);

      if (response.data.success) {
        setCompetitors(response.data.data);
        setShowCompetitors(true);
        toast.success(`${response.data.count} concorrentes encontrados`);
      }
    } catch (error: any) {
      toast.error('Erro ao buscar concorrentes');
      console.error(error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      await productAPI.saveProduct({
        name: product.title,
        productId: product.id,
        price: product.price,
        seller: product.seller,
      });
      toast.success('Produto salvo com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao salvar produto');
      console.error(error);
    }
  };

  return (
    <MetronicLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔍 Pesquisa de Produtos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Pesquise produtos no Mercado Livre e analise a concorrência
            </p>
          </div>

          {/* Search Component */}
          <ProductSearch onResultsUpdate={setResultCount} />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-400">
              <p className="font-semibold">Erro na busca</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Results Summary */}
          {searchResults.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                📊 Exibindo <span className="font-semibold">{searchResults.length}</span> de <span className="font-semibold">{resultCount}</span> resultados encontrados
              </p>
            </div>
          )}

          {/* Data Table */}
          <ProductDataTable
            products={searchResults}
            isLoading={isLoading}
            onSelectProduct={handleSelectProduct}
            onFindCompetitors={handleFindCompetitors}
            onSaveProduct={handleSaveProduct}
          />

          {/* Details Modal */}
          {showDetails && selectedProduct && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Detalhes do Produto
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Product Image */}
                  {selectedProduct.pictures && selectedProduct.pictures.length > 0 && (
                    <div className="mb-6 rounded-lg overflow-hidden">
                      <img
                        src={selectedProduct.pictures[0].secure_url}
                        alt={selectedProduct.title}
                        className="w-full h-auto max-h-96 object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}

                  {/* Product Title & Price */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      R$ {selectedProduct.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Seller Info */}
                  {selectedProduct.seller && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vendedor</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedProduct.seller.nickname}
                      </p>
                      {selectedProduct.seller.reputation && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-yellow-500">
                            {selectedProduct.seller.reputation.level_id ? '⭐'.repeat(Math.min(selectedProduct.seller.reputation.level_id.charCodeAt(0) - 64, 5)) : ''}
                          </span>
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            {selectedProduct.seller.reputation.positive_feedback || 0}% positivo
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {selectedProduct.description && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        📝 Descrição
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {selectedProduct.description.substring(0, 500)}...
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t dark:border-gray-700">
                    <button
                      onClick={() => handleSaveProduct(selectedProduct as Product)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      💾 Salvar Produto
                    </button>
                    <button
                      onClick={() => handleFindCompetitors(selectedProduct.id)}
                      disabled={loadingDetails}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      {loadingDetails ? '⏳ Carregando...' : '⚔️ Ver Concorrentes'}
                    </button>
                  </div>

                  {/* Competitors */}
                  {showCompetitors && competitors.length > 0 && (
                    <div className="mt-6 pt-6 border-t dark:border-gray-700">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        ⚔️ {competitors.length} Concorrentes Encontrados
                      </h4>
                      <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                        {competitors.map((competitor) => (
                          <div
                            key={competitor.id}
                            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
                            onClick={() => handleSelectProduct(competitor)}
                          >
                            <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {competitor.title}
                            </p>
                            <p className="font-bold text-blue-600 dark:text-blue-400 mt-1">
                              R$ {competitor.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            {competitor.seller && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                👤 {competitor.seller.nickname}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MetronicLayout>
  );
}
