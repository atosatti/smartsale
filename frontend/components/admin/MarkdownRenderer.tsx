'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isDarkMode: boolean;
}

export function MarkdownRenderer({ content, isDarkMode }: MarkdownRendererProps) {
  // Simple markdown to HTML conversion using regex
  const renderMarkdown = (markdown: string): React.ReactNode => {
    // Split by double newlines for paragraphs
    const parts = markdown.split('\n\n').map((section, idx) => {
      const lines = section.split('\n');
      
      return lines.map((line, lineIdx) => {
        const key = `${idx}-${lineIdx}`;

        // Headings
        if (line.match(/^# /)) {
          return (
            <h1
              key={key}
              className={`text-3xl font-bold mb-4 mt-6 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {line.replace(/^# /, '')}
            </h1>
          );
        }
        if (line.match(/^## /)) {
          return (
            <h2
              key={key}
              className={`text-2xl font-bold mb-3 mt-5 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {line.replace(/^## /, '')}
            </h2>
          );
        }
        if (line.match(/^### /)) {
          return (
            <h3
              key={key}
              className={`text-xl font-bold mb-2 mt-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {line.replace(/^### /, '')}
            </h3>
          );
        }

        // Code blocks
        if (line.startsWith('```')) {
          return null; // Skip code markers, handle separately
        }

        // Lists
        if (line.match(/^[\-\*] /)) {
          return (
            <li
              key={key}
              className={`ml-5 mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {line.replace(/^[\-\*] /, '')}
            </li>
          );
        }

        // Regular text
        if (line.trim()) {
          return (
            <p
              key={key}
              className={`mb-3 leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {line}
            </p>
          );
        }

        return null;
      }).filter(Boolean); // Remove nulls
    });

    return (
      <>
        {parts.map((section, idx) => (
          <React.Fragment key={`section-${idx}`}>
            {section}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <div
      className={`space-y-4 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}
    >
      {renderMarkdown(content)}
    </div>
  );
}
