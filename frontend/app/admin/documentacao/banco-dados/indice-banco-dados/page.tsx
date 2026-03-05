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
    'INDICE_BANCO_DADOS.md'
  );

  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    content = `# 📖 INDICE_BANCO_DADOS.md\n\n## Erro ao carregar documento\n\nDesculpe, não conseguimos carregar o arquivo de documentação.\n\n**Arquivo esperado:** \`development/INDICE_BANCO_DADOS.md\`\n\nAcesse a documentação em: /docs/`;
  }

  return (
    <DocumentPageClient
      title="INDICE_BANCO_DADOS.md"
      categoryTitle="🗄️ Banco de Dados"
      categoryHref="/admin/documentacao/banco-dados"
      content={content}
      lastUpdated="06/02/2026"
    />
  );
}
