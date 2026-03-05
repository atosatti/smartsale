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
    'DATABASE_SETUP.md'
  );

  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    content = `# 📖 DATABASE_SETUP.md\n\n## Erro ao carregar documento\n\nDesculpe, não conseguimos carregar o arquivo de documentação.\n\n**Arquivo esperado:** \`deployment/DATABASE_SETUP.md\`\n\nAcesse a documentação em: /docs/`;
  }

  return (
    <DocumentPageClient
      title="DATABASE_SETUP.md"
      categoryTitle="🗄️ Banco de Dados"
      categoryHref="/admin/documentacao/banco-dados"
      content={content}
      lastUpdated="06/02/2026"
    />
  );
}
