'use client';

import { useEffect, useRef } from 'react';
import { Product } from '@/store/productStore';
import toast from 'react-hot-toast';

interface ProductDataTableProps {
  products: Product[];
  isLoading: boolean;
  onSelectProduct: (product: Product) => void;
  onFindCompetitors: (productId: string) => void;
  onSaveProduct: (product: Product) => void;
}

export const ProductDataTable: React.FC<ProductDataTableProps> = ({
  products,
  isLoading,
  onSelectProduct,
  onFindCompetitors,
  onSaveProduct,
}) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar CSS do KTDatatable se não estiver já
    const link = document.createElement('link');
    link.href = 'https://preview.keenthemes.com/metronic8/demo30/assets/css/datatables.bundle.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Nenhum produto encontrado. Realize uma pesquisa para começar.
        </p>
      </div>
    );
  }

  // Calcula métricas simuladas para demonstração
  const calculateMetrics = (product: Product) => {
    const basePrice = product.price || 100;
    const monthlyViews = Math.floor(Math.random() * 10000) + 1000;
    const conversionRate = Math.random() * 0.1 + 0.02; // 2% a 12%
    const monthlySales = Math.floor(monthlyViews * conversionRate);
    const monthlyRevenue = monthlySales * basePrice;
    const avgSale = monthlySales > 0 ? monthlyRevenue / monthlySales : 0;
    const daysListed = Math.floor(Math.random() * 180) + 30;
    
    return {
      monthlyRevenue,
      monthlySales,
      avgSale,
      daysListed,
      images: Math.floor(Math.random() * 8) + 2,
    };
  };

  const getStarRating = (levelId: string | undefined): number => {
    if (!levelId) return 0;
    const charCode = levelId.charCodeAt(0);
    return Math.min(Math.max(charCode - 64, 0), 5);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              📊 Análise de Mercado B2B
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {products.length} produtos encontrados - Deslize para ver mais colunas
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">
              Ferramenta para análise de viabilidade de venda
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Table Container */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto max-h-[70vh] overflow-y-auto"
      >
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-400 border-collapse">
          <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-xs uppercase">
            <tr>
              {/* Produto */}
              <th className="px-4 py-3 min-w-[280px] bg-blue-50 dark:bg-blue-900/30 border-r dark:border-gray-600">
                Produto
              </th>
              
              {/* Preço */}
              <th className="px-4 py-3 min-w-[100px] text-right">
                Preço
              </th>
              
              {/* Categoria & Marca */}
              <th className="px-4 py-3 min-w-[120px]">
                Categoria
              </th>
              <th className="px-4 py-3 min-w-[100px]">
                Marca
              </th>
              
              {/* Métricas de Vendas */}
              <th className="px-4 py-3 min-w-[100px] text-right bg-green-50 dark:bg-green-900/30">
                Receita/Mês
              </th>
              <th className="px-4 py-3 min-w-[100px] text-right bg-green-50 dark:bg-green-900/30">
                Vendas/Mês
              </th>
              <th className="px-4 py-3 min-w-[100px] text-right bg-green-50 dark:bg-green-900/30">
                Ticket Médio
              </th>
              
              {/* Informações do Vendedor */}
              <th className="px-4 py-3 min-w-[150px] bg-purple-50 dark:bg-purple-900/30">
                Vendedor
              </th>
              <th className="px-4 py-3 min-w-[100px]">
                Reputação
              </th>
              <th className="px-4 py-3 min-w-[100px] text-center">
                Transações
              </th>
              
              {/* Detalhes da Listagem */}
              <th className="px-4 py-3 min-w-[80px] text-center">
                Dias no Ar
              </th>
              <th className="px-4 py-3 min-w-[80px] text-center">
                Imagens
              </th>
              <th className="px-4 py-3 min-w-[100px]">
                Condição
              </th>
              
              {/* Ações */}
              <th className="px-4 py-3 min-w-[160px] sticky right-0 bg-gray-100 dark:bg-gray-700">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {products.map((product, index) => {
              const metrics = calculateMetrics(product);
              
              return (
                <tr
                  key={product.id || index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Produto */}
                  <td className="px-4 py-3 min-w-[280px] font-medium bg-blue-50/30 dark:bg-blue-900/10 border-r dark:border-gray-600">
                    <div className="flex items-center gap-3">
                      {product.thumbnail && (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/40x40?text=No+image';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate text-xs">
                          {product.title}
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs">
                          ID: {product.id?.slice(0, 12)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Preço */}
                  <td className="px-4 py-3 min-w-[100px] text-right font-bold text-blue-600 dark:text-blue-400">
                    R$ {(product.price || 0).toFixed(2)}
                  </td>
                  
                  {/* Categoria */}
                  <td className="px-4 py-3 min-w-[120px]">
                    <span className="inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                      {product.category || 'Sem categoria'}
                    </span>
                  </td>
                  
                  {/* Marca */}
                  <td className="px-4 py-3 min-w-[100px] text-sm">
                    {product.brand || 'N/A'}
                  </td>
                  
                  {/* Receita Mensal */}
                  <td className="px-4 py-3 min-w-[100px] text-right font-bold text-green-600 dark:text-green-400 bg-green-50/30 dark:bg-green-900/10">
                    R$ {metrics.monthlyRevenue.toLocaleString('pt-BR', {maximumFractionDigits: 0})}
                  </td>
                  
                  {/* Vendas Mensais */}
                  <td className="px-4 py-3 min-w-[100px] text-right text-green-600 dark:text-green-400 font-semibold bg-green-50/30 dark:bg-green-900/10">
                    {metrics.monthlySales} un.
                  </td>
                  
                  {/* Ticket Médio */}
                  <td className="px-4 py-3 min-w-[100px] text-right text-green-600 dark:text-green-400 bg-green-50/30 dark:bg-green-900/10">
                    R$ {metrics.avgSale.toFixed(2)}
                  </td>
                  
                  {/* Vendedor */}
                  <td className="px-4 py-3 min-w-[150px] text-sm bg-purple-50/30 dark:bg-purple-900/10">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.seller?.nickname || 'Desconhecido'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-500 text-xs">
                      {product.seller?.reputation?.level_id || 'Sem nível'}
                    </p>
                  </td>
                  
                  {/* Reputação */}
                  <td className="px-4 py-3 min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-yellow-500 text-sm">
                        {'⭐'.repeat(getStarRating(product.seller?.reputation?.level_id))}
                      </span>
                      <span className="text-xs font-semibold">
                        {product.seller?.reputation?.positive_feedback || 0}%
                      </span>
                    </div>
                  </td>
                  
                  {/* Transações */}
                  <td className="px-4 py-3 min-w-[100px] text-center">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                      {product.seller?.reputation?.transactions || 0}
                    </span>
                  </td>
                  
                  {/* Dias no Ar */}
                  <td className="px-4 py-3 min-w-[80px] text-center text-sm font-medium">
                    {metrics.daysListed}d
                  </td>
                  
                  {/* Imagens */}
                  <td className="px-4 py-3 min-w-[80px] text-center">
                    <span className="inline-block bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-xs font-medium">
                      {metrics.images} img
                    </span>
                  </td>
                  
                  {/* Condição */}
                  <td className="px-4 py-3 min-w-[100px]">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.condition === 'novo'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}
                    >
                      {product.condition === 'novo' ? '✓ Novo' : 'Usado'}
                    </span>
                  </td>
                  
                  {/* Ações */}
                  <td className="px-4 py-3 min-w-[160px] sticky right-0 bg-gray-50 dark:bg-gray-800 z-10">
                    <div className="flex gap-1 flex-wrap">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                        title="Ver detalhes"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => onFindCompetitors(product.id)}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
                        title="Encontrar concorrentes"
                      >
                        ⚔️
                      </button>
                      <button
                        onClick={() => onSaveProduct(product)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                        title="Salvar produto"
                      >
                        💾
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Total de Produtos</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{products.length}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Preço Médio</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              R$ {(products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Receita Potencial/Mês</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              R$ {products.reduce((sum, p) => sum + calculateMetrics(p).monthlyRevenue, 0).toLocaleString('pt-BR', {maximumFractionDigits: 0})}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Vendas Potenciais/Mês</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {products.reduce((sum, p) => sum + calculateMetrics(p).monthlySales, 0)} un.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
