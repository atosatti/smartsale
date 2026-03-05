'use client';

import React from 'react';
import { useThemeStore } from '@/store/themeStore';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

interface DocumentationCategoryPageProps {
  categoryTitle: string;
  categoryDescription: string;
  categoryIcon: string;
  documents: DocumentItem[];
  children?: React.ReactNode;
}

export function DocumentationCategoryPage({
  categoryTitle,
  categoryDescription,
  categoryIcon,
  documents,
}: DocumentationCategoryPageProps) {
  const { isDarkMode } = useThemeStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{categoryIcon}</span>
          <Link
            href="/admin/documentacao"
            className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
          >
            ← Voltar para Documentação
          </Link>
        </div>
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {categoryTitle}
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {categoryDescription}
        </p>
      </div>

      {/* Documents List */}
      <div className="grid gap-4">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={doc.href}
            className={`group p-5 rounded-lg border transition-all duration-300 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <FileText className={`w-5 h-5 mt-1 flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <div className="flex-1">
                  <h3 className={`font-bold mb-1 group-hover:text-blue-500 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {doc.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {doc.description}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 mt-1 flex-shrink-0 transition-transform group-hover:translate-x-1 ${isDarkMode ? 'text-gray-600 group-hover:text-gray-400' : 'text-gray-400 group-hover:text-gray-600'}`} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
