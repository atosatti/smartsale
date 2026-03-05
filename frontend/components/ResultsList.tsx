'use client';

import { useSearchStore } from '@/store/searchStore';

export default function ResultsList() {
  const { results, isLoading } = useSearchStore();

  if (isLoading) {
    return <div className="text-center py-8">Carregando resultados...</div>;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum resultado encontrado. Faça uma pesquisa para começar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition">
          <h3 className="font-bold text-lg mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-2">{product.platform}</p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-green-600">
              {product.currency} {product.price.toFixed(2)}
            </span>
          </div>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ver Oferta
          </a>
        </div>
      ))}
    </div>
  );
}
