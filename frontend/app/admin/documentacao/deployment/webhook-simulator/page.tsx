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
    'WEBHOOK_SIMULATOR.md'
  );

  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    content = `# 📖 WEBHOOK_SIMULATOR.md\n\n## Erro ao carregar documento\n\nDesculpe, não conseguimos carregar o arquivo de documentação.\n\n**Arquivo esperado:** \`deployment/WEBHOOK_SIMULATOR.md\`\n\nAcesse a documentação em: /docs/`;
  }

  return (
    <DocumentPageClient
      title="WEBHOOK_SIMULATOR.md"
      categoryTitle="🚀 Deployment"
      categoryHref="/admin/documentacao/deployment"
      content={content}
      lastUpdated="06/02/2026"
    />
  );
}
