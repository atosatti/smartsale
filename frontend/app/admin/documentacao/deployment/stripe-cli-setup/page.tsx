import { DocumentPageClient } from '@/components/admin/DocumentPageClient';
import fs from 'fs';
import path from 'path';

export default function Page() {
  const filePath = path.join(
    process.cwd(),
    'src',
    '..',
    '..',
    'docs',
    'deployment',
    'STRIPE_CLI_SETUP.md'
  );

  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    content = `# 📖 STRIPE_CLI_SETUP.md\n\n## Erro ao carregar documento\n\nDesculpe, não conseguimos carregar o arquivo de documentação.\n\n**Arquivo esperado:** \`deployment/STRIPE_CLI_SETUP.md\`\n\nAcesse a documentação em: /docs/`;
  }

  return (
    <DocumentPageClient
      title="STRIPE_CLI_SETUP.md"
      categoryTitle="🚀 Deployment"
      categoryHref="/admin/documentacao/deployment"
      content={content}
      lastUpdated="06/02/2026"
    />
  );
}
