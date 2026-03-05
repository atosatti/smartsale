'use client';

import React from 'react';
import { DocumentationCategoryPage } from '@/components/admin/DocumentationCategoryPage';

const documents = [
  {
    id: 'deploy',
    title: 'DEPLOY.md',
    description: 'Guia completo de deployment e estratégias',
    href: '/admin/documentacao/deployment/deploy',
  },
  {
    id: 'admin-deploy-checklist',
    title: 'ADMIN_DEPLOY_CHECKLIST.md',
    description: 'Checklist pré-deployment completo',
    href: '/admin/documentacao/deployment/admin-deploy-checklist',
  },
  {
    id: 'webhook-simulator',
    title: 'WEBHOOK_SIMULATOR.md',
    description: 'Simulador de webhooks para testes',
    href: '/admin/documentacao/deployment/webhook-simulator',
  },
  {
    id: 'stripe-cli-setup',
    title: 'STRIPE_CLI_SETUP.md',
    description: 'Setup Stripe CLI para desenvolvimento',
    href: '/admin/documentacao/deployment/stripe-cli-setup',
  },
  {
    id: 'database-setup-deploy',
    title: 'DATABASE_SETUP.md',
    description: 'Setup de banco de dados em produção',
    href: '/admin/documentacao/deployment/database-setup-deploy',
  },
];

export default function DeploymentPage() {
  return (
    <DocumentationCategoryPage
      categoryTitle="🚀 Deployment"
      categoryDescription="Documentação sobre deployment, infraestrutura, CI/CD e operações em produção"
      categoryIcon="🚀"
      documents={documents}
    />
  );
}
