"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAllAlgorithms,
  getAllSearches,
  getAllGraphs,
  getAllPatterns,
  getAllStructures,
} from "@codeprism/content";
import { Button, Select } from "@codeprism/ui";
import { useTranslations } from "next-intl";

type Category = "algorithm" | "search" | "graph" | "pattern" | "structure";

interface CategoryDef {
  key: Category;
  label: string;
  icon: string;
  items: { value: string; label: string }[];
  defaultLeft: string;
  defaultRight: string;
}

const VALID_CATEGORIES: Category[] = ["algorithm", "search", "graph", "pattern", "structure"];

function isValidCategory(c: string | null): c is Category {
  return !!c && (VALID_CATEGORIES as string[]).includes(c);
}

function ComparePageInner() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (() => {
    const c = searchParams.get("category");
    return isValidCategory(c) ? c : "algorithm";
  })();
  const initialLeft = searchParams.get("left") ?? null;

  const [category, setCategory] = useState<Category>(initialCategory);
  const [leftItem, setLeftItem] = useState(() => {
    // If URL provides a left slug, the categories array is built below; for now
    // fall back to a known default. We override right after categories is built.
    return initialLeft ?? "bubble-sort";
  });
  const [rightItem, setRightItem] = useState("quick-sort");

  // Resolve initial values once categories are known (depend on t() which is stable)
  useEffect(() => {
    if (initialLeft) {
      // Find the slug in the current category; if not present, try the
      // detected category from URL.
      const allSlugsByCat: Record<Category, string[]> = {
        algorithm: getAllAlgorithms().map((a) => a.slug),
        search: getAllSearches().map((s) => s.slug),
        graph: getAllGraphs().map((g) => g.slug),
        pattern: getAllPatterns().map((p) => p.slug),
        structure: getAllStructures().map((s) => s.slug),
      };
      // If the slug is in the active category, use it. Otherwise scan all
      // categories and switch the active category to the one that has it.
      if (allSlugsByCat[category].includes(initialLeft)) {
        setLeftItem(initialLeft);
      } else {
        const foundCat = (Object.keys(allSlugsByCat) as Category[]).find(
          (k) => allSlugsByCat[k].includes(initialLeft),
        );
        if (foundCat) {
          setCategory(foundCat);
          setLeftItem(initialLeft);
        }
      }
    }
  }, []);

  const categories: CategoryDef[] = [
    {
      key: "algorithm",
      label: t("compare.algorithms"),
      icon: "⚡",
      items: getAllAlgorithms().map((a) => ({ value: a.slug, label: t(a.titleKey) })),
      defaultLeft: "bubble-sort",
      defaultRight: "quick-sort",
    },
    {
      key: "search",
      label: t("compare.searches"),
      icon: "🔍",
      items: getAllSearches().map((s) => ({ value: s.slug, label: t(s.titleKey) })),
      defaultLeft: "linear-search",
      defaultRight: "binary-search",
    },
    {
      key: "graph",
      label: t("compare.graphs"),
      icon: "🕸️",
      items: getAllGraphs().map((g) => ({ value: g.slug, label: t(g.titleKey) })),
      defaultLeft: "dfs",
      defaultRight: "bfs",
    },
    {
      key: "pattern",
      label: t("compare.patterns"),
      icon: "🏗️",
      items: getAllPatterns().map((p) => ({ value: p.slug, label: t(p.titleKey) })),
      defaultLeft: "observer",
      defaultRight: "mediator",
    },
    {
      key: "structure",
      label: t("compare.structures"),
      icon: "🧱",
      items: getAllStructures().map((s) => ({ value: s.slug, label: t(s.titleKey) })),
      defaultLeft: "linked-list",
      defaultRight: "bst",
    },
  ];

  const currentCategory = categories.find((c) => c.key === category)!;

  // When category changes, reset selections to the category's defaults
  const handleCategoryChange = (newCat: Category) => {
    const cat = categories.find((c) => c.key === newCat)!;
    setCategory(newCat);
    setLeftItem(cat.defaultLeft);
    setRightItem(cat.defaultRight);
  };

  const canCompare = leftItem && rightItem && leftItem !== rightItem;

  const handleCompare = () => {
    if (!canCompare) return;
    router.push(`/compare/${category}/${leftItem}/${rightItem}`);
  };

  return (
    <Suspense fallback={null}>
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-8">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold-soft border border-accent-gold/20 rounded-full text-sm font-medium text-accent-gold mb-4">
              {t("compare.badge")}
            </div>
            <h1 className="font-heading text-4xl font-bold mb-3">{t("compare.title")}</h1>
            <p className="text-lg text-text-secondary max-w-2xl">
              {t("compare.desc")}
            </p>
          </div>

          {/* Category Tabs */}
        <div className="mb-8 flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                category === cat.key
                  ? "bg-accent-gold text-bg-primary"
                  : "bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-border-hover"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

          {/* Selectors */}
          <div className="bg-bg-card border border-border rounded-xl p-8">
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div>
                <Select
                  label={t("compare.leftLabel")}
                  value={leftItem}
                  onChange={(e) => setLeftItem(e.target.value)}
                  options={currentCategory.items}
                />
              </div>
              <div>
              <Select
                label={t("compare.rightLabel")}
                value={rightItem}
                onChange={(e) => setRightItem(e.target.value)}
                options={currentCategory.items}
              />
            </div>
          </div>

          {/* Info / CTA */}
          <div className="text-center">
            {leftItem === rightItem ? (
              <p className="text-sm text-accent-coral mb-4">
                {t("compare.selectDiff")}
              </p>
            ) : (
              <p className="text-sm text-text-secondary mb-4">
                {t("compare.selected")}: <span className="font-medium text-text-primary">{currentCategory.items.find(i => i.value === leftItem)?.label}</span>
                {" ↔ "}
                <span className="font-medium text-text-primary">{currentCategory.items.find(i => i.value === rightItem)?.label}</span>
              </p>
            )}
            <Button
              variant="default"
              size="lg"
              onClick={handleCompare}
              disabled={!canCompare}
            >
              {t("compare.start")}
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="mt-10 grid sm:grid-cols-3 gap-4 pt-8 border-t border-border">
            {[
              { icon: "🎮", title: t("compare.sync.title"), desc: t("compare.sync.desc") },
              { icon: "📊", title: t("compare.complexity.title"), desc: t("compare.complexity.desc") },
              { icon: "💻", title: t("compare.code.title"), desc: t("compare.code.desc") },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{f.title}</h3>
                <p className="text-xs text-text-tertiary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </Suspense>
  );
}

export default function ComparePage() {
  return <ComparePageInner />;
}
