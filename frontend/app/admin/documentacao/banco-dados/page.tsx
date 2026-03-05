'use client';

import React from 'react';
import { DocumentationCategoryPage } from '@/components/admin/DocumentationCategoryPage';

const documents = [
  {
    id: 'database-schema',
    title: 'DATABASE_SCHEMA.md',
    description: 'Schema completo do banco de dados com PCI-DSS compliance',
    href: '/admin/documentacao/banco-dados/database-schema',
  },
  {
    id: 'database-setup',
    title: 'DATABASE_SETUP.md',
    description: 'Configuração e inicialização do banco de dados',
    href: '/admin/documentacao/banco-dados/database-setup',
  },
  {
    id: 'banco-inicializado',
    title: 'BANCO_INICIALIZADO.md',
    description: 'Status de inicialização do banco de dados',
    href: '/admin/documentacao/banco-dados/banco-inicializado',
  },
  {
    id: 'indice-banco-dados',
    title: 'INDICE_BANCO_DADOS.md',
    description: 'Índices e otimizações de banco de dados',
    href: '/admin/documentacao/banco-dados/indice-banco-dados',
  },
  {
    id: 'dependencies',
    title: 'DEPENDENCIES.md',
    description: 'Dependências de dados e relacionamentos',
    href: '/admin/documentacao/banco-dados/dependencies',
  },
  {
    id: 'verification-checklist',
    title: 'VERIFICATION_CHECKLIST.md',
    description: 'Checklist de verificação do banco de dados',
    href: '/admin/documentacao/banco-dados/verification-checklist',
  },
];

export default function BancoDadosPage() {
  return (
    <DocumentationCategoryPage
      categoryTitle="🗄️ Banco de Dados"
      categoryDescription="Documentação sobre schema, migrations, relacionamentos, índices e backup do banco de dados"
      categoryIcon="🗄️"
      documents={documents}
    />
  );
}
