"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

interface SubsectionProps {
  id: string;
  title: string;
  content: string;
  steps?: string[];
  tips?: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const DocumentationSubsection: React.FC<SubsectionProps> = ({
  id,
  title,
  content,
  steps,
  tips,
  isExpanded,
  onToggle,
}) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const { isDarkMode } = useThemeStore();

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className={`border rounded-lg mb-3 overflow-hidden transition-colors ${isDarkMode ? 'border-gray-700 hover:border-blue-600' : 'border-gray-200 hover:border-blue-300'}`}>
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'}`}
      >
        <h4 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h4>
        {isExpanded ? (
          <ChevronUp className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        ) : (
          <ChevronDown className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        )}
      </button>

      {isExpanded && (
        <div className={`px-4 py-4 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Conteúdo Principal */}
          <p className={`mb-4 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{content}</p>

          {/* Passos */}
          {steps && steps.length > 0 && (
            <div className="mb-4">
              <h5 className={`font-semibold mb-3 flex items-center ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                <span className="mr-2">📋</span> Passo a Passo:
              </h5>
              <ol className="space-y-2">
                {steps.map((step, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                    <button
                      onClick={() => copyToClipboard(step, index)}
                      className={`flex-shrink-0 ml-auto transition-colors p-1 ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Copiar texto"
                    >
                      {copiedStep === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Dicas */}
          {tips && tips.length > 0 && (
            <div className={`border rounded-lg p-3 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
              <h5 className={`font-semibold mb-2 flex items-center ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                <span className="mr-2">💡</span> Dicas:
              </h5>
              <ul className="space-y-1">
                {tips.map((tip, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-2 text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}
                  >
                    <span className={`mt-0.5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
