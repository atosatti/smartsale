'use client';

import React from 'react';
import { MarkdownRenderer } from '@/components/admin/MarkdownRenderer';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useThemeStore } from '@/store/themeStore';

// Ensure MarkdownRenderer is properly rendered

interface DocumentPageClientProps {
  title: string;
  categoryTitle: string;
  categoryHref: string;
  content: string;
  lastUpdated?: string;
}

export function DocumentPageClient({
  title,
  categoryTitle,
  categoryHref,
  content,
  lastUpdated,
}: DocumentPageClientProps) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'bg-slate-950' : 'bg-white'
      } transition-colors`}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode
            ? 'bg-slate-900 border-slate-800'
            : 'bg-slate-50 border-slate-200'
        } border-b sticky top-0 z-40`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Link
              href={categoryHref}
              className={`flex items-center gap-1 hover:opacity-70 transition-opacity ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              <ChevronLeft size={16} />
              {categoryTitle}
            </Link>
            <span className={isDarkMode ? 'text-slate-600' : 'text-slate-400'}>
              /
            </span>
            <span className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
              {title}
            </span>
          </div>

          {/* Title */}
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            {title}
          </h1>

          {/* Last Updated */}
          {lastUpdated && (
            <p
              className={`text-sm mt-2 ${
                isDarkMode ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              Última atualização: {lastUpdated}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article
          className={`prose prose-sm max-w-none ${
            isDarkMode
              ? 'prose-invert prose-headings:text-white prose-p:text-slate-300 prose-a:text-blue-400 prose-strong:text-slate-200'
              : 'prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-900'
          }`}
        >
          <MarkdownRenderer content={content} isDarkMode={isDarkMode} />
        </article>
      </div>

      {/* Footer */}
      <div
        className={`border-t ${
          isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-50'
        } mt-12 py-8`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
            💡 Dica: Use <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl+F</kbd> para buscar no documento
          </p>
        </div>
      </div>
    </div>
  );
}
