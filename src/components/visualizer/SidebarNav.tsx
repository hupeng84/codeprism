"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  algorithms,
  searches,
  graphs,
  structures,
  patterns,
} from "@codeprism/content";
import { useTranslations, useLocale } from "next-intl";
import ProgressBadge from "./ProgressBadge";

interface SidebarNavProps {
  category: string;
  slug: string;
  /** Called when user taps an item on mobile (to close overlay) */
  onNavigate?: () => void;
}

interface NavItem {
  slug: string;
  title: string;
  icon: string;
}

interface NavSection {
  key: string;
  label: string;
  icon: string;
  items: NavItem[];
}

export default function SidebarNav({ category, slug, onNavigate }: SidebarNavProps) {
  const t = useTranslations();
  const locale = useLocale();

/** Build navigation sections from content records */
  const sections: NavSection[] = [
    {
      key: "algorithm",
      label: t("sidebar.algorithm"),
      icon: "⚡",
      items: Object.values(algorithms).map((a) => ({
        slug: a.slug,
        title: t(a.titleKey),
        icon: a.icon,
      })),
    },
    {
      key: "search",
      label: t("sidebar.search"),
      icon: "🔍",
      items: Object.values(searches).map((s) => ({
        slug: s.slug,
        title: t(s.titleKey),
        icon: s.icon,
      })),
    },
    {
      key: "graph",
      label: t("sidebar.graph"),
      icon: "📊",
      items: Object.values(graphs).map((g) => ({
        slug: g.slug,
        title: t(g.titleKey),
        icon: g.icon,
      })),
    },
    {
      key: "structure",
      label: t("sidebar.structure"),
      icon: "🧱",
      items: Object.values(structures).map((s) => ({
        slug: s.slug,
        title: t(s.titleKey),
        icon: s.icon,
      })),
    },
    {
      key: "pattern",
      label: t("sidebar.pattern"),
      icon: "🎨",
      items: Object.values(patterns).map((p) => ({
        slug: p.slug,
        title: t(p.titleKey),
        icon: p.icon,
      })),
    },
  ];
  // Expand/collapse state per section — Set of expanded section keys
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Initialize: expand the active section on mount
  useEffect(() => {
    setExpanded(new Set([category]));
  }, [category]);

  const toggleSection = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  return (
    <nav className="flex flex-col" aria-label={t("reference.aria.contentNav")}>
      {sections.map((section) => {
        const isExpanded = expanded.has(section.key);
        const isActiveSection = category === section.key;
        const activeItem = isActiveSection ? slug : null;

        return (
          <div key={section.key} className="border-b border-border">
            {/* Section header — click to expand/collapse */}
            <button
              onClick={() => toggleSection(section.key)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActiveSection
                  ? "text-accent-coral bg-accent-coral-soft"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-bg-glass-light"
              }`}
              aria-expanded={isExpanded}
            >
              {/* Chevron icon */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`shrink-0 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>

              <span className="flex-1">{section.label}</span>

              {/* Item count badge */}
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                  isActiveSection
                    ? "bg-accent-coral/20 text-accent-coral"
                    : "bg-bg-glass-light text-text-tertiary"
                }`}
              >
                {section.items.length}
              </span>
            </button>

            {/* Section items — collapsible */}
            <div
              className="overflow-hidden transition-all duration-200"
              style={{
                maxHeight: isExpanded ? `${section.items.length * 36 + 8}px` : "0px",
                opacity: isExpanded ? 1 : 0,
              }}
            >
              <div className="py-1">
                {section.items.map((item) => {
                  const isActive = activeItem === item.slug;
                  return (
                    <a
                      key={item.slug}
                      href={`/${locale}/visualizer/${section.key}/${item.slug}`}
                      onClick={onNavigate}
                      className={`flex items-center gap-2 px-4 py-1.5 text-sm transition-colors ${
                        isActive
                          ? "text-accent-coral bg-accent-coral-soft font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-glass-light"
                      }`}
                    >
                      <span className="text-xs shrink-0">{item.icon}</span>
                      <span className="truncate">{item.title}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-coral shrink-0" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      <ProgressBadge category={category} />
    </nav>
  );
}
