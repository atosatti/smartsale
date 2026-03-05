"use client";

import React, { useState } from "react";
import { userDocumentation, DocumentationSection } from "@/config/userDocumentation";
import { DocumentationSectionViewer } from "./DocumentationSectionViewer";
import { Search, Menu, X } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

interface Suggestion {
  type: "section" | "subsection";
  sectionId: string;
  sectionTitle: string;
  title: string;
  id: string;
}

export const DocumentationViewer: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>("getting-started");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  // Gerar sugestões baseado na busca
  const generateSuggestions = (): Suggestion[] => {
    if (searchQuery.length === 0) return [];

    const suggestions: Suggestion[] = [];
    const query = searchQuery.toLowerCase();

    userDocumentation.forEach((section) => {
      // Adicionar seção se corresponder
      if (section.title.toLowerCase().includes(query)) {
        suggestions.push({
          type: "section",
          sectionId: section.id,
          sectionTitle: section.title,
          title: section.title,
          id: section.id,
        });
      }

      // Adicionar subseções se corresponderem
      section.subsections.forEach((sub) => {
        if (
          sub.title.toLowerCase().includes(query) ||
          sub.content.toLowerCase().includes(query)
        ) {
          suggestions.push({
            type: "subsection",
            sectionId: section.id,
            sectionTitle: section.title,
            title: sub.title,
            id: sub.id,
          });
        }
      });
    });

    return suggestions.slice(0, 8); // Limitar a 8 sugestões
  };

  // Filtrar documentação por busca
  const filteredSections = userDocumentation.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.subsections.some(
        (sub) =>
          sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const currentSection = filteredSections.find(
    (s) => s.id === selectedSection
  );

  const suggestions = generateSuggestions();

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSelectedSection(suggestion.sectionId);
    setSearchQuery("");
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-40 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📚 Centro de Ajuda
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {mobileMenuOpen ? (
                  <X className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
                ) : (
                  <Menu className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar com Autocomplete */}
          <div className="relative">
            <Search className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar na documentação..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 border'}`}
            />

            {/* Dropdown de Sugestões */}
            {showSuggestions && suggestions.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.sectionId}-${suggestion.id}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left px-4 py-3 transition-colors border-b last:border-b-0 flex items-start gap-3 ${isDarkMode ? 'hover:bg-gray-700 border-gray-700' : 'hover:bg-blue-50 border-gray-100'}`}
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {suggestion.type === "section" ? "📚" : "📄"}
                      </span>
                      <div className="flex-1">
                        <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {suggestion.title}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          em {suggestion.sectionTitle}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mensagem quando não há sugestões */}
            {showSuggestions && suggestions.length === 0 && searchQuery.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 p-4 text-center border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'}`}>
                Nenhuma sugestão encontrada
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div
            className={`${
              mobileMenuOpen ? "block" : "hidden"
            } lg:block lg:col-span-1`}
          >
            <nav className={`rounded-lg p-4 shadow-sm border sticky top-20 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`font-semibold mb-3 text-sm uppercase tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Seções
              </h3>
              <div className="space-y-1">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      selectedSection === section.id
                        ? isDarkMode ? "bg-blue-900 text-blue-200 font-semibold" : "bg-blue-100 text-blue-700 font-semibold"
                        : isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>

              {filteredSections.length === 0 && (
                <div className={`text-sm italic py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Nenhuma seção encontrada
                </div>
              )}
            </nav>

            {/* Info Box */}
            <div className={`mt-6 border rounded-lg p-4 hidden lg:block ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>💡 Dica</h4>
              <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                Use a barra de busca para encontrar rapidamente o que procura.
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {currentSection ? (
              <DocumentationSectionViewer section={currentSection} />
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-500">
                  Tente buscar por termos diferentes ou explore as seções
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-12 py-8 border-t ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
          <p className="mb-2 text-center">
            Não encontrou o que procurava?{" "}
            <a
              href="mailto:support@smartsale.com"
              className={`font-semibold ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              Contate nosso suporte
            </a>
          </p>
          <p className="text-sm text-center">
            © 2024 SmartSale. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};
