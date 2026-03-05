'use client';

import React from 'react';
import { DocumentationCategoryPage } from '@/components/admin/DocumentationCategoryPage';

const documents = [
  {
    id: 'architecture',
    title: 'ARCHITECTURE.md',
    description: 'Visão geral completa da arquitetura do sistema, componentes e fluxos de dados',
    href: '/admin/documentacao/arquitetura/architecture',
  },
  {
    id: 'admin-architecture',
    title: 'ADMIN_ARCHITECTURE.md',
    description: 'Arquitetura específica do painel administrativo',
    href: '/admin/documentacao/arquitetura/admin-architecture',
  },
  {
    id: 'datatable-reference',
    title: 'DATATABLE_REFERENCE.md',
    description: 'Referência técnica dos componentes DataTable',
    href: '/admin/documentacao/arquitetura/datatable-reference',
  },
  {
    id: 'project-summary',
    title: 'PROJECT_SUMMARY.md',
    description: 'Resumo técnico do projeto e decisões arquiteturais',
    href: '/admin/documentacao/arquitetura/project-summary',
  },
  {
    id: 'implementation-summary',
    title: 'IMPLEMENTATION_SUMMARY.md',
    description: 'Sumário de implementação e status das funcionalidades',
    href: '/admin/documentacao/arquitetura/implementation-summary',
  },
];

export default function ArquiteturaPage() {
  return (
    <DocumentationCategoryPage
      categoryTitle="🏛️ Arquitetura"
      categoryDescription="Documentação sobre arquitetura do sistema, padrões de design, componentes e estrutura geral da aplicação"
      categoryIcon="🏛️"
      documents={documents}
    />
  );
}
