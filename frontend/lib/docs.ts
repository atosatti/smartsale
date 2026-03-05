import fs from 'fs';
import path from 'path';

export async function getDocumentContent(docPath: string): Promise<string | null> {
  try {
    const fullPath = path.join(process.cwd(), 'public', 'docs', docPath);
    const content = await fs.promises.readFile(fullPath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Erro ao ler documento: ${docPath}`, error);
    return null;
  }
}

export function getDocumentsList(category: string): string[] {
  const docsPath = path.join(process.cwd(), 'public', 'docs', category);
  try {
    const files = fs.readdirSync(docsPath);
    return files.filter((file) => file.endsWith('.md'));
  } catch (error) {
    console.error(`Erro ao listar documentos: ${category}`, error);
    return [];
  }
}
