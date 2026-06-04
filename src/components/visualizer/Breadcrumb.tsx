"use client";

import React from "react";
import { getContent } from "@codeprism/content";
import { useTranslations } from "next-intl";

interface BreadcrumbProps {
  category: string;
  slug: string;
}

export default function Breadcrumb({ category, slug }: BreadcrumbProps) {
  const t = useTranslations();
  const content = getContent(category, slug);

  const categoryLabels: Record<string, string> = {
    algorithm: t("sidebar.algorithm"),
    search: t("sidebar.search"),
    graph: t("sidebar.graph"),
    structure: t("sidebar.structure"),
    pattern: t("sidebar.pattern"),
  };

  const categoryLabel = categoryLabels[category] ?? category;
  const displayTitle = content ? t((content as {titleKey: string}).titleKey) : slug;

  return (
    <nav
      aria-label={t("reference.aria.breadcrumb")}
      className="flex items-center gap-1.5 flex-wrap text-sm py-2 px-1"
    >
      {/* Home */}
      <a
        href="/"
        className="inline-flex items-center gap-1 text-text-tertiary hover:text-text-primary transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12l9-9 9 9" />
          <path d="M5 10v10a1 1 0 001 1h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a1 1 0 001-1V10" />
        </svg>
        <span>{t("breadcrumb.home")}</span>
      </a>

      {/* Separator */}
      <span className="text-text-tertiary select-none">&gt;</span>

      {/* Category — no dedicated listing page, link to home */}
      <span className="text-text-secondary">
        {categoryLabel}
      </span>

      {/* Separator */}
      <span className="text-text-tertiary select-none">&gt;</span>

      {/* Current item — not a link */}
      <span className="text-text-tertiary truncate max-w-[200px]">
        {displayTitle}
      </span>
    </nav>
  );
}
