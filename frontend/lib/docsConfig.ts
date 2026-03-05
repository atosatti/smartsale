// Mapeamento de URLs de documentação para arquivos
export const DOCS_MAP: Record<string, { file: string; title: string; category: string; categoryHref: string }> = {
  // Banco de Dados
  'banco-dados/database-schema': {
    file: '/docs/deployment/DATABASE_SCHEMA.md',
    title: 'DATABASE_SCHEMA.md',
    category: '🗄️ Banco de Dados',
    categoryHref: '/admin/documentacao/banco-dados',
  },
  'banco-dados/database-setup': {
    file: '/docs/deployment/DATABASE_SETUP.md',
    title: 'DATABASE_SETUP.md',
    category: '🗄️ Banco de Dados',
    categoryHref: '/admin/documentacao/banco-dados',
  },
  'banco-dados/banco-inicializado': {
    file: '/docs/development/BANCO_INICIALIZADO.md',
    title: 'BANCO_INICIALIZADO.md',
    category: '🗄️ Banco de Dados',
    categoryHref: '/admin/documentacao/banco-dados',
  },
  'banco-dados/indice-banco-dados': {
    file: '/docs/development/INDICE_BANCO_DADOS.md',
    title: 'INDICE_BANCO_DADOS.md',
    category: '🗄️ Banco de Dados',
    categoryHref: '/admin/documentacao/banco-dados',
  },
  'banco-dados/dependencies': {
    file: '/docs/development/DEPENDENCIES.md',
    title: 'DEPENDENCIES.md',
    category: '🗄️ Banco de Dados',
    categoryHref: '/admin/documentacao/banco-dados',
  },
  'banco-dados/verification-checklist': {
    file: '/docs/development/VALIDATION_CHECKLIST.md',
    title: 'VALIDATION_CHECKLIST.md',
    category: '🗄️ Banco de Dados',
    categoryHref: '/admin/documentacao/banco-dados',
  },

  // Arquitetura
  'arquitetura/architecture': {
    file: '/docs/architecture/ARCHITECTURE.md',
    title: 'ARCHITECTURE.md',
    category: '🏛️ Arquitetura',
    categoryHref: '/admin/documentacao/arquitetura',
  },
  'arquitetura/admin-architecture': {
    file: '/docs/architecture/ADMIN_ARCHITECTURE.md',
    title: 'ADMIN_ARCHITECTURE.md',
    category: '🏛️ Arquitetura',
    categoryHref: '/admin/documentacao/arquitetura',
  },
  'arquitetura/datatable-reference': {
    file: '/docs/architecture/DATATABLE_REFERENCE.md',
    title: 'DATATABLE_REFERENCE.md',
    category: '🏛️ Arquitetura',
    categoryHref: '/admin/documentacao/arquitetura',
  },
  'arquitetura/project-summary': {
    file: '/docs/architecture/PROJECT_SUMMARY.md',
    title: 'PROJECT_SUMMARY.md',
    category: '🏛️ Arquitetura',
    categoryHref: '/admin/documentacao/arquitetura',
  },
  'arquitetura/implementation-summary': {
    file: '/docs/architecture/IMPLEMENTATION_SUMMARY.md',
    title: 'IMPLEMENTATION_SUMMARY.md',
    category: '🏛️ Arquitetura',
    categoryHref: '/admin/documentacao/arquitetura',
  },

  // Deployment
  'deployment/deploy': {
    file: '/docs/deployment/DEPLOY.md',
    title: 'DEPLOY.md',
    category: '🚀 Deployment',
    categoryHref: '/admin/documentacao/deployment',
  },
  'deployment/database-setup-deploy': {
    file: '/docs/deployment/DATABASE_SETUP.md',
    title: 'DATABASE_SETUP.md',
    category: '🚀 Deployment',
    categoryHref: '/admin/documentacao/deployment',
  },
  'deployment/webhook-simulator': {
    file: '/docs/deployment/WEBHOOK_SIMULATOR.md',
    title: 'WEBHOOK_SIMULATOR.md',
    category: '🚀 Deployment',
    categoryHref: '/admin/documentacao/deployment',
  },
  'deployment/stripe-cli-setup': {
    file: '/docs/deployment/STRIPE_CLI_SETUP.md',
    title: 'STRIPE_CLI_SETUP.md',
    category: '🚀 Deployment',
    categoryHref: '/admin/documentacao/deployment',
  },

  // Desenvolvimento
  'desenvolvimento/desenvolvimento': {
    file: '/docs/development/DEVELOPMENT.md',
    title: 'DESENVOLVIMENTO.md',
    category: '💻 Desenvolvimento',
    categoryHref: '/admin/documentacao/desenvolvimento',
  },
  'desenvolvimento/validation-checklist': {
    file: '/docs/development/VALIDATION_CHECKLIST.md',
    title: 'VALIDATION_CHECKLIST.md',
    category: '💻 Desenvolvimento',
    categoryHref: '/admin/documentacao/desenvolvimento',
  },
  'desenvolvimento/fase-3-completa': {
    file: '/docs/development/FASE_3_COMPLETA.md',
    title: 'FASE_3_COMPLETA.md',
    category: '💻 Desenvolvimento',
    categoryHref: '/admin/documentacao/desenvolvimento',
  },
  'desenvolvimento/dependencies-dev': {
    file: '/docs/development/DEPENDENCIES.md',
    title: 'DEPENDENCIES.md',
    category: '💻 Desenvolvimento',
    categoryHref: '/admin/documentacao/desenvolvimento',
  },
  'desenvolvimento/contributing': {
    file: '/docs/development/CONTRIBUTING.md',
    title: 'CONTRIBUTING.md',
    category: '💻 Desenvolvimento',
    categoryHref: '/admin/documentacao/desenvolvimento',
  },
};

export function getDocConfig(route: string) {
  return DOCS_MAP[route];
}
