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
    'development',
    'IMPLEMENTATION_SUMMARY.md'
  );

  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    content = `# 📖 IMPLEMENTATION_SUMMARY.md\n\n## Erro ao carregar documento\n\nDesculpe, não conseguimos carregar o arquivo de documentação.\n\n**Arquivo esperado:** \`development/IMPLEMENTATION_SUMMARY.md\`\n\nAcesse a documentação em: /docs/`;
  }

  return (
    <DocumentPageClient
      title="IMPLEMENTATION_SUMMARY.md"
      categoryTitle="💻 Desenvolvimento"
      categoryHref="/admin/documentacao/desenvolvimento"
      content={content}
      lastUpdated="06/02/2026"
    />
  );
}
