"use client";

import React, { useState } from "react";
import { DocumentationSubsection } from "./DocumentationSubsection";
import { DocumentationSection } from "@/config/userDocumentation";
import { useThemeStore } from "@/store/themeStore";
import {
  Rocket,
  Search,
  Filter,
  BarChart3,
  User,
  Lightbulb,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface SectionViewerProps {
  section: DocumentationSection;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Rocket: Rocket,
  Search: Search,
  Filter: Filter,
  BarChart3: BarChart3,
  User: User,
  Lightbulb: Lightbulb,
  AlertCircle: AlertCircle,
  HelpCircle: HelpCircle,
};

export const DocumentationSectionViewer: React.FC<SectionViewerProps> = ({
  section,
}) => {
  const [expandedSubsections, setExpandedSubsections] = useState<
    Record<string, boolean>
  >({});
  const { isDarkMode } = useThemeStore();

  const toggleSubsection = (id: string) => {
    setExpandedSubsections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const IconComponent = iconMap[section.icon] || Lightbulb;

  return (
    <div className={`rounded-lg p-6 shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <IconComponent className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{section.title}</h2>
        </div>
        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{section.description}</p>
      </div>

      {/* Divisor */}
      <div className={`h-1 bg-gradient-to-r from-blue-500 to-transparent mb-6 ${isDarkMode ? 'opacity-60' : ''}`}></div>

      {/* Subsections */}
      <div className="space-y-3">
        {section.subsections.map((subsection) => (
          <DocumentationSubsection
            key={subsection.id}
            {...subsection}
            isExpanded={expandedSubsections[subsection.id] || false}
            onToggle={() => toggleSubsection(subsection.id)}
          />
        ))}
      </div>
    </div>
  );
};
