'use client';

import React from 'react';
import { DocumentationCategoryPage } from '@/components/admin/DocumentationCategoryPage';

const documents = [
  {
    id: 'desenvolvimento',
    title: 'DESENVOLVIMENTO.md',
    description: 'Guia de desenvolvimento local e setup',
    href: '/admin/documentacao/desenvolvimento/desenvolvimento',
  },
  {
    id: 'validation-checklist',
    title: 'VALIDATION_CHECKLIST.md',
    description: 'Checklist de validação e testes',
    href: '/admin/documentacao/desenvolvimento/validation-checklist',
  },
  {
    id: 'implementation-summary-dev',
    title: 'IMPLEMENTATION_SUMMARY.md',
    description: 'Sumário de implementação',
    href: '/admin/documentacao/desenvolvimento/implementation-summary-dev',
  },
  {
    id: 'fase-3-completa',
    title: 'FASE_3_COMPLETA.md',
    description: 'Conclusão da Fase 3 de desenvolvimento',
    href: '/admin/documentacao/desenvolvimento/fase-3-completa',
  },
  {
    id: 'dependencies-dev',
    title: 'DEPENDENCIES.md',
    description: 'Gerenciamento de dependências e versões',
    href: '/admin/documentacao/desenvolvimento/dependencies-dev',
  },
  {
    id: 'contributing',
    title: 'CONTRIBUTING.md',
    description: 'Guia para contribuições ao projeto',
    href: '/admin/documentacao/desenvolvimento/contributing',
  },
  {
    id: 'coding-standards',
    title: 'Padrões de Código',
    description: 'Convenções e padrões de codificação',
    href: '/admin/documentacao/desenvolvimento/coding-standards',
  },
];

export default function DesenvolvidamentoPage() {
  return (
    <DocumentationCategoryPage
      categoryTitle="💻 Desenvolvimento"
      categoryDescription="Documentação para desenvolvimento local, testes, debugging e boas práticas"
      categoryIcon="💻"
      documents={documents}
    />
  );
}
