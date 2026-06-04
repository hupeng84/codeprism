"use client";

import React from "react";
import type { CodeExample } from "@codeprism/content";

interface LanguageCodeTabsProps {
  /** Multi-language code examples keyed by language identifier */
  codeExamples: Record<string, CodeExample>;
  /** Currently active language identifier */
  activeLanguage: string;
  /** Callback when a language tab is clicked */
  onLanguageChange: (language: string) => void;
}

/** Display order for language tabs */
const LANGUAGE_ORDER = [
  "typescript",
  "c",
  "cpp",
  "python",
  "rust",
  "go",
  "java",
];

export function LanguageCodeTabs({
  codeExamples,
  activeLanguage,
  onLanguageChange,
}: LanguageCodeTabsProps) {
  // Get available languages in defined order, fall back to object keys
  const availableLanguages = LANGUAGE_ORDER.filter(
    (lang) => lang in codeExamples
  );

  if (availableLanguages.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-0 border-b border-border shrink-0 overflow-x-auto">
      {availableLanguages.map((lang) => {
        const example = codeExamples[lang];
        const isActive = lang === activeLanguage;
        return (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap shrink-0 ${
              isActive
                ? "text-text-primary border-[#FF6B6B]"
                : "text-text-tertiary border-transparent hover:text-text-secondary"
            }`}
          >
            {example.languageLabel}
          </button>
        );
      })}
    </div>
  );
}
