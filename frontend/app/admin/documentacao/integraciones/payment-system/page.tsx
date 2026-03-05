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
    'PAYMENT_SYSTEM.md'
  );

  let content = '';

  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    content = `# 📖 PAYMENT_SYSTEM.md\n\n## Erro ao carregar documento\n\nDesculpe, não conseguimos carregar o arquivo de documentação.\n\n**Arquivo esperado:** \`deployment/PAYMENT_SYSTEM.md\`\n\nAcesse a documentação em: /docs/`;
  }

  return (
    <DocumentPageClient
      title="PAYMENT_SYSTEM.md"
      categoryTitle="🔌 Integrações"
      categoryHref="/admin/documentacao/integraciones"
      content={content}
      lastUpdated="06/02/2026"
    />
  );
}
