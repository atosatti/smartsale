'use client';

import React from 'react';
import { DocumentPage } from '@/components/admin/DocumentPage';

const content = (
  <div className="space-y-6">
    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
      <p className="text-sm mb-3">
        📚 <strong>Documentação Centralizada:</strong>
      </p>
      <p className="text-sm">
        Todos os documentos técnicos estão disponíveis em detalhes completos em:
        <br />
        <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded inline-block mt-2">
          /docs/admin/documentacao/
        </code>
      </p>
    </div>

    <section>
      <h2 className="text-2xl font-bold mb-4">Como Usar Esta Documentação</h2>
      <ol className="list-decimal list-inside space-y-2">
        <li>Selecione a categoria que precisa no menu do sidebar</li>
        <li>Escolha o documento específico dentro da categoria</li>
        <li>Leia o conteúdo técnico detalhado</li>
        <li>Use Ctrl+F para buscar palavras-chave</li>
        <li>Consulte as referências cruzadas para mais informações</li>
      </ol>
    </section>

    <section>
      <h3 className="text-xl font-bold mb-3">Categorias Disponíveis</h3>
      <div className="space-y-3">
        <div>
          <strong className="text-blue-600 dark:text-blue-400">🏛️ Arquitetura</strong>
          <p className="text-sm mt-1">Visão geral, componentes e padrões de design</p>
        </div>
        <div>
          <strong className="text-green-600 dark:text-green-400">🗄️ Banco de Dados</strong>
          <p className="text-sm mt-1">Schema, migrations, relacionamentos</p>
        </div>
        <div>
          <strong className="text-purple-600 dark:text-purple-400">🔌 Integrações</strong>
          <p className="text-sm mt-1">OAuth, APIs externas, Stripe, Mercado Livre</p>
        </div>
        <div>
          <strong className="text-orange-600 dark:text-orange-400">🚀 Deployment</strong>
          <p className="text-sm mt-1">Deploy, infraestrutura, CI/CD</p>
        </div>
        <div>
          <strong className="text-red-600 dark:text-red-400">📡 API REST</strong>
          <p className="text-sm mt-1">Endpoints, autenticação, filtros</p>
        </div>
        <div>
          <strong className="text-cyan-600 dark:text-cyan-400">💻 Desenvolvimento</strong>
          <p className="text-sm mt-1">Setup local, testes, debugging</p>
        </div>
      </div>
    </section>

    <section>
      <h3 className="text-xl font-bold mb-3">Atalhos Úteis</h3>
      <div className="space-y-2 text-sm">
        <div className="flex gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Ctrl + F</kbd>
          <span>Buscar dentro do documento</span>
        </div>
        <div className="flex gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Ctrl + C</kbd>
          <span>Copiar código</span>
        </div>
        <div className="flex gap-2">
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">Tab</kbd>
          <span>Navegar entre links</span>
        </div>
      </div>
    </section>

    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
      <p className="text-sm">
        ✅ <strong>Dica Importante:</strong> Para documentação completa com exemplos, diagramas e detalhes, abra os arquivos .md
        localizados em <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">/docs/admin/documentacao/</code>
      </p>
    </div>
  </div>
);

export function DocumentationTemplate({ 
  title, 
  categoryTitle, 
  categoryHref 
}: {
  title: string;
  categoryTitle: string;
  categoryHref: string;
}) {
  return (
    <DocumentPage
      title={title}
      categoryTitle={categoryTitle}
      categoryHref={categoryHref}
      content={content}
    />
  );
}

export default function DocumentationIndexPage() {
  return (
    <DocumentationTemplate
      title="Documentação Técnica"
      categoryTitle="Admin"
      categoryHref="/admin/documentacao"
    />
  );
}
