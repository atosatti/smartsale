'use client';

import React from 'react';
import { DocumentationCategoryPage } from '@/components/admin/DocumentationCategoryPage';

const documents = [
  {
    id: 'api-docs',
    title: 'API_DOCS.md',
    description: 'Documentação completa de endpoints REST',
    href: '/admin/documentacao/api/api-docs',
  },
  {
    id: 'public-api',
    title: 'PUBLIC_API.md',
    description: 'API pública e endpoints sem autenticação',
    href: '/admin/documentacao/api/public-api',
  },
  {
    id: 'complete-filters-guide',
    title: 'COMPLETE_FILTERS_GUIDE.md',
    description: 'Guia completo de filtros e busca',
    href: '/admin/documentacao/api/complete-filters-guide',
  },
  {
    id: 'ml-search-testing-guide',
    title: 'ML_SEARCH_TESTING_GUIDE.md',
    description: 'Guia de testes para busca Mercado Livre',
    href: '/admin/documentacao/api/ml-search-testing-guide',
  },
  {
    id: 'mercado-livre-alignment',
    title: 'MERCADO_LIVRE_ALIGNMENT.md',
    description: 'Alinhamento com API Mercado Livre',
    href: '/admin/documentacao/api/mercado-livre-alignment',
  },
  {
    id: 'implementation-complete',
    title: 'IMPLEMENTATION_COMPLETE.md',
    description: 'Status de implementação da API',
    href: '/admin/documentacao/api/implementation-complete',
  },
  {
    id: 'practical-filters-tests',
    title: 'PRACTICAL_FILTERS_TESTS.md',
    description: 'Testes práticos de filtros com dados reais',
    href: '/admin/documentacao/api/practical-filters-tests',
  },
  {
    id: 'auth-flows',
    title: 'Authentication Flows',
    description: 'Fluxos de autenticação JWT e OAuth',
    href: '/admin/documentacao/api/auth-flows',
  },
];

export default function APIPage() {
  return (
    <DocumentationCategoryPage
      categoryTitle="📡 API REST"
      categoryDescription="Documentação completa da API REST, endpoints, autenticação, filtros e rate limiting"
      categoryIcon="📡"
      documents={documents}
    />
  );
}
