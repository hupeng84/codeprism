"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getAllAlgorithms,
  getAllPatterns,
  getAllStructures,
  getAllSearches,
  getAllGraphs,
} from "@codeprism/content";
import { useTranslations } from "next-intl";

interface SearchItem {
  id: string;
  title: string;
  titleKey: string;
  category: string;
  categoryLabel: string;
  href: string;
  icon: string;
  tags: string[];
}

export function CommandPalette() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Build search index from all registered content
  const items = useMemo<SearchItem[]>(() => {
    const all: SearchItem[] = [];
    for (const a of getAllAlgorithms()) {
      all.push({
        id: a.id,
        title: a.title,
        titleKey: a.titleKey,
        category: "algorithm",
        categoryLabel: t("commandPalette.categoryLabels.algorithm"),
        href: `/visualizer/algorithm/${a.slug}`,
        icon: a.icon,
        tags: a.tags,
      });
    }
    for (const p of getAllPatterns()) {
      all.push({
        id: p.id,
        title: p.title,
        titleKey: p.titleKey,
        category: "pattern",
        categoryLabel: t("commandPalette.categoryLabels.pattern"),
        href: `/visualizer/pattern/${p.slug}`,
        icon: p.icon,
        tags: p.tags,
      });
    }
    for (const s of getAllStructures()) {
      all.push({
        id: s.id,
        title: s.title,
        titleKey: s.titleKey,
        category: "structure",
        categoryLabel: t("commandPalette.categoryLabels.structure"),
        href: `/visualizer/structure/${s.slug}`,
        icon: s.icon,
        tags: s.tags,
      });
    }
    for (const s of getAllSearches()) {
      all.push({
        id: s.id,
        title: s.title,
        titleKey: s.titleKey,
        category: "search",
        categoryLabel: t("commandPalette.categoryLabels.search"),
        href: `/visualizer/search/${s.slug}`,
        icon: s.icon,
        tags: s.tags,
      });
    }
    for (const g of getAllGraphs()) {
      all.push({
        id: g.id,
        title: g.title,
        titleKey: g.titleKey,
        category: "graph",
        categoryLabel: t("commandPalette.categoryLabels.graph"),
        href: `/visualizer/graph/${g.slug}`,
        icon: g.icon,
        tags: g.tags,
      });
    }
    return all;
  }, [t]);

  // Filter items by query
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        t(item.titleKey).toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query, items]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const customHandler = () => setOpen(true);
    window.addEventListener("keydown", handler);
    window.addEventListener("open-command-palette", customHandler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("open-command-palette", customHandler);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setQuery("");
    }
  }, [open]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].href);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg bg-bg-elevated border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <svg className="w-5 h-5 text-text-tertiary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("command.searchPlaceholder")}
            className="flex-1 bg-transparent py-3.5 text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-text-tertiary border border-border rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto py-2">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-text-tertiary">
              {query ? t("command.noResults") : t("command.startSearch")}
            </div>
          )}

          <Group
            label={t("command.group.algorithm")}
            items={filtered.filter((i) => i.category === "algorithm")}
            filtered={filtered}
            selectedIndex={selectedIndex}
            navigate={navigate}
          />
          <Group
            label={t("command.group.pattern")}
            items={filtered.filter((i) => i.category === "pattern")}
            filtered={filtered}
            selectedIndex={selectedIndex}
            navigate={navigate}
          />
          <Group
            label={t("command.group.structure")}
            items={filtered.filter((i) => i.category === "structure")}
            filtered={filtered}
            selectedIndex={selectedIndex}
            navigate={navigate}
          />
          <Group
            label={t("command.group.search")}
            items={filtered.filter((i) => i.category === "search")}
            filtered={filtered}
            selectedIndex={selectedIndex}
            navigate={navigate}
          />
          <Group
            label={t("command.group.graph")}
            items={filtered.filter((i) => i.category === "graph")}
            filtered={filtered}
            selectedIndex={selectedIndex}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}

function Group({
  label,
  items,
  filtered,
  selectedIndex,
  navigate,
}: {
  label: string;
  items: SearchItem[];
  filtered: SearchItem[];
  selectedIndex: number;
  navigate: (href: string) => void;
}) {
  const t = useTranslations();
  if (items.length === 0) return null;
  return (
    <div>
      <div className="px-4 py-1.5 text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
        {label}
      </div>
      {items.map((item) => {
        const globalIdx = filtered.indexOf(item);
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.href)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
              globalIdx === selectedIndex
                ? "bg-bg-glass-light text-text-primary"
                : "text-text-secondary hover:bg-bg-glass-light hover:text-text-primary"
            }`}
          >
            <span className="text-lg shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{t(item.titleKey)}</div>
              <div className="text-[11px] text-text-tertiary truncate">
                {item.tags.join(" · ")}
              </div>
            </div>
            <span className="text-[10px] text-text-tertiary shrink-0">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
