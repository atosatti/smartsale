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
    'architecture',
    'ADMIN_ARCHITECTURE.md'
  );

  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    content = `# 📖 ADMIN_ARCHITECTURE.md\n\n## Erro ao carregar documento\n\nDesculpe, não conseguimos carregar o arquivo de documentação.\n\n**Arquivo esperado:** \`architecture/ADMIN_ARCHITECTURE.md\`\n\nAcesse a documentação em: /docs/`;
  }

  return (
    <DocumentPageClient
      title="ADMIN_ARCHITECTURE.md"
      categoryTitle="🏛️ Arquitetura"
      categoryHref="/admin/documentacao/arquitetura"
      content={content}
      lastUpdated="06/02/2026"
    />
  );
}
