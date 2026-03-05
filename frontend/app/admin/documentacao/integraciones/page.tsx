'use client';

import React from 'react';
import { DocumentationCategoryPage } from '@/components/admin/DocumentationCategoryPage';

const documents = [
  {
    id: 'mercado-livre-integration',
    title: 'MERCADO_LIVRE_INTEGRATION.md',
    description: 'Integração completa com Mercado Livre API',
    href: '/admin/documentacao/integraciones/mercado-livre-integration',
  },
  {
    id: 'readme-mercado-livre',
    title: 'README_MERCADO_LIVRE.md',
    description: 'Referência rápida para Mercado Livre',
    href: '/admin/documentacao/integraciones/readme-mercado-livre',
  },
  {
    id: 'stripe-config',
    title: 'STRIPE_CONFIG.md',
    description: 'Configuração de pagamentos com Stripe',
    href: '/admin/documentacao/integraciones/stripe-config',
  },
  {
    id: 'google-oauth-implementation',
    title: 'GOOGLE_OAUTH_IMPLEMENTATION.md',
    description: 'Implementação Google OAuth 2.0',
    href: '/admin/documentacao/integraciones/google-oauth-implementation',
  },
  {
    id: 'payment-system',
    title: 'PAYMENT_SYSTEM.md',
    description: 'Sistema de pagamentos integrado',
    href: '/admin/documentacao/integraciones/payment-system',
  },
  {
    id: 'mercado-livre-api-setup',
    title: 'MERCADO_LIVRE_API_SETUP.md',
    description: 'Setup detalhado da API Mercado Livre',
    href: '/admin/documentacao/integraciones/mercado-livre-api-setup',
  },
  {
    id: 'stripe-webhook-setup',
    title: 'Configuração de Webhooks',
    description: 'Setup de webhooks Stripe e tratamento de eventos',
    href: '/admin/documentacao/integraciones/webhook-setup',
  },
];

export default function IntegrationesPage() {
  return (
    <DocumentationCategoryPage
      categoryTitle="🔌 Integrações"
      categoryDescription="Documentação sobre OAuth, APIs externas, Stripe e Mercado Livre"
      categoryIcon="🔌"
      documents={documents}
    />
  );
}
