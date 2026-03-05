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
    'api',
    'PUBLIC_API.md'
  );

  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    content = `# 📖 PUBLIC_API.md\n\n## Erro ao carregar documento\n\nDesculpe, não conseguimos carregar o arquivo de documentação.\n\n**Arquivo esperado:** \`api/PUBLIC_API.md\`\n\nAcesse a documentação em: /docs/`;
  }

  return (
    <DocumentPageClient
      title="PUBLIC_API.md"
      categoryTitle="📡 API REST"
      categoryHref="/admin/documentacao/api"
      content={content}
      lastUpdated="06/02/2026"
    />
  );
}
