'use client';

import React from 'react';
import { useThemeStore } from '@/store/themeStore';
import { Book, FileText, Database, Zap, Code, Settings } from 'lucide-react';
import Link from 'next/link';

interface DocumentationCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  docCount: number;
}

export default function DocumentationPage() {
  const { isDarkMode } = useThemeStore();

  const categories: DocumentationCategory[] = [
    {
      id: 'arquitetura',
      title: '🏛️ Arquitetura',
      description: 'Visão geral, componentes e padrões de design do sistema',
      icon: Book,
      href: '/admin/documentacao/arquitetura',
      color: 'from-blue-500 to-blue-600',
      docCount: 5,
    },
    {
      id: 'banco-dados',
      title: '🗄️ Banco de Dados',
      description: 'Schema, migrations, relacionamentos e otimizações',
      icon: Database,
      href: '/admin/documentacao/banco-dados',
      color: 'from-green-500 to-green-600',
      docCount: 6,
    },
    {
      id: 'integraciones',
      title: '🔌 Integrações',
      description: 'OAuth, APIs externas, Stripe e Mercado Livre',
      icon: Zap,
      href: '/admin/documentacao/integraciones',
      color: 'from-purple-500 to-purple-600',
      docCount: 7,
    },
    {
      id: 'deployment',
      title: '🚀 Deployment',
      description: 'Deploy, infraestrutura, CI/CD e monitoramento',
      icon: Settings,
      href: '/admin/documentacao/deployment',
      color: 'from-orange-500 to-orange-600',
      docCount: 5,
    },
    {
      id: 'api',
      title: '📡 API REST',
      description: 'Documentação de endpoints, autenticação e filtros',
      icon: Code,
      href: '/admin/documentacao/api',
      color: 'from-red-500 to-red-600',
      docCount: 8,
    },
    {
      id: 'desenvolvimento',
      title: '💻 Desenvolvimento',
      description: 'Setup local, testes, debugging e boas práticas',
      icon: FileText,
      href: '/admin/documentacao/desenvolvimento',
      color: 'from-cyan-500 to-cyan-600',
      docCount: 7,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          📚 Documentação Técnica
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Acesse toda a documentação técnica do SmartSale organizada por categoria
        </p>
      </div>

      {/* Quick Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total de Documentos</p>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>38+</p>
        </div>
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Categorias</p>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>6</p>
        </div>
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Horas de Leitura</p>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>20-25h</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.href}
              className={`group p-6 rounded-lg transition-all duration-300 hover:shadow-lg cursor-pointer border ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                  {category.docCount} docs
                </span>
              </div>

              <h3 className={`text-lg font-bold mb-2 group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {category.title}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {category.description}
              </p>

              <div className="mt-4 flex items-center text-blue-500 font-medium text-sm group-hover:gap-2 transition-all">
                Acessar →
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Box */}
      <div className={`p-6 rounded-lg border-l-4 ${isDarkMode ? 'bg-blue-900/30 border-blue-500 text-blue-300' : 'bg-blue-50 border-blue-500 text-blue-700'}`}>
        <h4 className="font-bold mb-2">💡 Dica</h4>
        <p>
          Toda a documentação está organizada em categorias. Use o menu do sidebar ou selecione uma categoria acima para começar a explorar.
          Cada documento inclui exemplos práticos, diagramas e links cruzados.
        </p>
      </div>
    </div>
  );
}
