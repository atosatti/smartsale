// Script para gerar todas as páginas de documentação com carregamento de conteúdo
import fs from 'fs';
import path from 'path';

const docsMap = [
  // Banco de Dados
  { route: 'banco-dados/database-schema', dir: 'deployment', file: 'DATABASE_SCHEMA.md', title: '🗄️ Banco de Dados', href: '/admin/documentacao/banco-dados' },
  { route: 'banco-dados/database-setup', dir: 'deployment', file: 'DATABASE_SETUP.md', title: '🗄️ Banco de Dados', href: '/admin/documentacao/banco-dados' },
  { route: 'banco-dados/banco-inicializado', dir: 'development', file: 'BANCO_INICIALIZADO.md', title: '🗄️ Banco de Dados', href: '/admin/documentacao/banco-dados' },
  { route: 'banco-dados/indice-banco-dados', dir: 'development', file: 'INDICE_BANCO_DADOS.md', title: '🗄️ Banco de Dados', href: '/admin/documentacao/banco-dados' },
  { route: 'banco-dados/dependencies', dir: 'development', file: 'DEPENDENCIES.md', title: '🗄️ Banco de Dados', href: '/admin/documentacao/banco-dados' },
  { route: 'banco-dados/verification-checklist', dir: 'development', file: 'VALIDATION_CHECKLIST.md', title: '🗄️ Banco de Dados', href: '/admin/documentacao/banco-dados' },

  // Arquitetura
  { route: 'arquitetura/architecture', dir: 'architecture', file: 'ARCHITECTURE.md', title: '🏛️ Arquitetura', href: '/admin/documentacao/arquitetura' },
  { route: 'arquitetura/admin-architecture', dir: 'architecture', file: 'ADMIN_ARCHITECTURE.md', title: '🏛️ Arquitetura', href: '/admin/documentacao/arquitetura' },
  { route: 'arquitetura/datatable-reference', dir: 'architecture', file: 'DATATABLE_REFERENCE.md', title: '🏛️ Arquitetura', href: '/admin/documentacao/arquitetura' },
  { route: 'arquitetura/project-summary', dir: 'architecture', file: 'PROJECT_SUMMARY.md', title: '🏛️ Arquitetura', href: '/admin/documentacao/arquitetura' },
  { route: 'arquitetura/implementation-summary', dir: 'architecture', file: 'IMPLEMENTATION_SUMMARY.md', title: '🏛️ Arquitetura', href: '/admin/documentacao/arquitetura' },

  // Integrações - TODAS PRECISAM SER ATUALIZADAS
  { route: 'integraciones/mercado-livre-integration', dir: 'api', file: 'README_MERCADO_LIVRE.md', title: '🔌 Integrações', href: '/admin/documentacao/integraciones' },
  { route: 'integraciones/readme-mercado-livre', dir: 'api', file: 'README_MERCADO_LIVRE.md', title: '🔌 Integrações', href: '/admin/documentacao/integraciones' },
  { route: 'integraciones/stripe-config', dir: 'deployment', file: 'PAYMENT_SYSTEM.md', title: '🔌 Integrações', href: '/admin/documentacao/integraciones' },
  { route: 'integraciones/google-oauth-implementation', dir: 'api', file: 'README_MERCADO_LIVRE.md', title: '🔌 Integrações', href: '/admin/documentacao/integraciones' },
  { route: 'integraciones/payment-system', dir: 'deployment', file: 'PAYMENT_SYSTEM.md', title: '🔌 Integrações', href: '/admin/documentacao/integraciones' },
  { route: 'integraciones/mercado-livre-api-setup', dir: 'api', file: 'README_MERCADO_LIVRE.md', title: '🔌 Integrações', href: '/admin/documentacao/integraciones' },
  { route: 'integraciones/webhook-setup', dir: 'deployment', file: 'WEBHOOK_SIMULATOR.md', title: '🔌 Integrações', href: '/admin/documentacao/integraciones' },

  // Deployment
  { route: 'deployment/deploy', dir: 'deployment', file: 'DEPLOY.md', title: '🚀 Deployment', href: '/admin/documentacao/deployment' },
  { route: 'deployment/admin-deploy-checklist', dir: 'deployment', file: 'DEPLOY.md', title: '🚀 Deployment', href: '/admin/documentacao/deployment' },
  { route: 'deployment/webhook-simulator', dir: 'deployment', file: 'WEBHOOK_SIMULATOR.md', title: '🚀 Deployment', href: '/admin/documentacao/deployment' },
  { route: 'deployment/stripe-cli-setup', dir: 'deployment', file: 'STRIPE_CLI_SETUP.md', title: '🚀 Deployment', href: '/admin/documentacao/deployment' },
  { route: 'deployment/database-setup-deploy', dir: 'deployment', file: 'DATABASE_SETUP.md', title: '🚀 Deployment', href: '/admin/documentacao/deployment' },

  // API - TODAS PRECISAM SER ATUALIZADAS
  { route: 'api/api-docs', dir: 'api', file: 'README.md', title: '📡 API REST', href: '/admin/documentacao/api' },
  { route: 'api/public-api', dir: 'api', file: 'PUBLIC_API.md', title: '📡 API REST', href: '/admin/documentacao/api' },
  { route: 'api/complete-filters-guide', dir: 'api', file: 'README.md', title: '📡 API REST', href: '/admin/documentacao/api' },
  { route: 'api/ml-search-testing-guide', dir: 'api', file: 'README.md', title: '📡 API REST', href: '/admin/documentacao/api' },
  { route: 'api/mercado-livre-alignment', dir: 'api', file: 'README_MERCADO_LIVRE.md', title: '📡 API REST', href: '/admin/documentacao/api' },
  { route: 'api/implementation-complete', dir: 'api', file: 'README.md', title: '📡 API REST', href: '/admin/documentacao/api' },
  { route: 'api/practical-filters-tests', dir: 'api', file: 'README.md', title: '📡 API REST', href: '/admin/documentacao/api' },
  { route: 'api/auth-flows', dir: 'api', file: 'README.md', title: '📡 API REST', href: '/admin/documentacao/api' },

  // Desenvolvimento - TODAS PRECISAM SER ATUALIZADAS
  { route: 'desenvolvimento/desenvolvimento', dir: 'development', file: 'README.md', title: '💻 Desenvolvimento', href: '/admin/documentacao/desenvolvimento' },
  { route: 'desenvolvimento/validation-checklist', dir: 'development', file: 'VALIDATION_CHECKLIST.md', title: '💻 Desenvolvimento', href: '/admin/documentacao/desenvolvimento' },
  { route: 'desenvolvimento/implementation-summary-dev', dir: 'development', file: 'IMPLEMENTATION_SUMMARY.md', title: '💻 Desenvolvimento', href: '/admin/documentacao/desenvolvimento' },
  { route: 'desenvolvimento/fase-3-completa', dir: 'development', file: 'FASE_3_COMPLETA.md', title: '💻 Desenvolvimento', href: '/admin/documentacao/desenvolvimento' },
  { route: 'desenvolvimento/dependencies-dev', dir: 'development', file: 'DEPENDENCIES.md', title: '💻 Desenvolvimento', href: '/admin/documentacao/desenvolvimento' },
  { route: 'desenvolvimento/contributing', dir: 'development', file: 'CONTRIBUTING.md', title: '💻 Desenvolvimento', href: '/admin/documentacao/desenvolvimento' },
  { route: 'desenvolvimento/coding-standards', dir: 'development', file: 'README.md', title: '💻 Desenvolvimento', href: '/admin/documentacao/desenvolvimento' },
];

const template = (fileName, dir, title, href) => `import { DocumentPageClient } from '@/components/admin/DocumentPageClient';
import fs from 'fs';
import path from 'path';

export default function Page() {
  const filePath = path.join(
    process.cwd(),
    'src',
    '..',
    '..',
    'docs',
    '${dir}',
    '${fileName}'
  );

  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    content = \`# 📖 ${fileName}\\n\\n## Erro ao carregar documento\\n\\nDesculpe, não conseguimos carregar o arquivo de documentação.\\n\\n**Arquivo esperado:** \\\`${dir}/${fileName}\\\`\\n\\nAcesse a documentação em: /docs/\`;
  }

  return (
    <DocumentPageClient
      title="${fileName}"
      categoryTitle="${title}"
      categoryHref="${href}"
      content={content}
      lastUpdated="06/02/2026"
    />
  );
}
`;

// Gerar arquivos
let createdCount = 0;
let updatedCount = 0;

docsMap.forEach((doc) => {
  const [category, page] = doc.route.split('/');
  const pageDir = path.join('app', 'admin', 'documentacao', category, page);
  const filePath = path.join(pageDir, 'page.tsx');

  const content = template(doc.file, doc.dir, doc.title, doc.href);
  
  // Criar diretório se não existir
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
    console.log(`✓ Diretório criado: ${pageDir}`);
  }

  // Escrever ou atualizar arquivo
  const fileExists = fs.existsSync(filePath);
  fs.writeFileSync(filePath, content);
  
  if (fileExists) {
    updatedCount++;
    console.log(`✓ Atualizado: ${filePath}`);
  } else {
    createdCount++;
    console.log(`✓ Criado: ${filePath}`);
  }
});

console.log(`
✅ Geração concluída!
   - Criados: ${createdCount}
   - Atualizados: ${updatedCount}
   - Total: ${docsMap.length}
`);
