'use client';

import React from 'react';
import { useThemeStore } from '@/store/themeStore';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface DocumentPageProps {
  title: string;
  categoryTitle: string;
  categoryHref: string;
  content: React.ReactNode;
}

export function DocumentPage({ title, categoryTitle, categoryHref, content }: DocumentPageProps) {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href={categoryHref}
          className={`flex items-center gap-1 text-sm hover:underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
        >
          <ChevronLeft className="w-4 h-4" />
          {categoryTitle}
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h1>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </p>
      </div>

      {/* Content */}
      <div
        className={`prose prose-sm max-w-none rounded-lg p-6 ${
          isDarkMode
            ? 'bg-gray-800 text-gray-100 prose-invert'
            : 'bg-white text-gray-900'
        }`}
      >
        {content}
      </div>

      {/* Footer */}
      <div className={`p-4 rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
        💡 Dica: Use Ctrl+F para buscar palavras-chave nesta página
      </div>
    </div>
  );
}
