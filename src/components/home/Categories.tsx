"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface SubCategory {
  label: string;
  href: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface CategoryItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  meta: string;
  accent: string;
  href: string;
  subcategories: SubCategory[];
}

function PatternsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function StructuresIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function AlgorithmsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DifficultyBadge({ level }: { level: "beginner" | "intermediate" | "advanced" }) {
  const styles = {
    beginner: "bg-accent-teal-soft text-accent-teal",
    intermediate: "bg-accent-gold-soft text-accent-gold",
    advanced: "bg-accent-coral-soft text-accent-coral",
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${styles[level]}`}>
      {level === "beginner" ? "EASY" : level === "intermediate" ? "MED" : "ADV"}
    </span>
  );
}

function CategoryCard({ category }: { category: CategoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations();

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-border-hover card-glow-hover">
      {/* Header */}
      <Link
        href={category.href}
        className="block p-6 no-underline"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${category.accent}`}>
            <div className="text-text-primary">{category.icon}</div>
          </div>
          <div className="text-text-tertiary text-sm font-medium">{category.meta}</div>
        </div>
        <h3 className="font-heading text-xl font-bold mb-2 text-text-primary">{category.title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{category.desc}</p>
      </Link>

      {/* Expandable subcategories */}
      <div className="border-t border-border">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-3 flex items-center justify-between text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none"
        >
          <span>{t("categories.viewSubcategories", { count: category.subcategories.length })}</span>
          <ChevronIcon expanded={expanded} />
        </button>

        <div className={`overflow-hidden transition-all duration-300 ${expanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-6 pb-4 grid grid-cols-1 gap-2">
            {category.subcategories.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-bg-input hover:bg-bg-card transition-colors no-underline group"
              >
                <span className="text-sm text-text-secondary group-hover:text-text-primary">{sub.label}</span>
                {sub.difficulty && <DifficultyBadge level={sub.difficulty} />}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Categories() {
  const t = useTranslations();

  const categories: CategoryItem[] = [
    {
      icon: <PatternsIcon />,
      title: t("categories.patterns.title"),
      desc: t("categories.patterns.desc"),
      meta: "23 " + t("categories.patterns.meta").split(" ")[0],
      accent: "bg-accent-coral-soft",
      href: "/patterns",
      subcategories: [
        { label: "Observer", href: "/visualizer/pattern/observer", difficulty: "intermediate" },
        { label: "Strategy", href: "/visualizer/pattern/strategy", difficulty: "intermediate" },
        { label: "Factory Method", href: "/visualizer/pattern/factory-method", difficulty: "beginner" },
        { label: "Decorator", href: "/visualizer/pattern/decorator", difficulty: "intermediate" },
        { label: "Singleton", href: "/visualizer/pattern/singleton", difficulty: "beginner" },
        { label: "Adapter", href: "/visualizer/pattern/adapter", difficulty: "beginner" },
      ],
    },
    {
      icon: <StructuresIcon />,
      title: t("categories.structures.title"),
      desc: t("categories.structures.desc"),
      meta: "16 " + t("categories.structures.meta").split(" ")[0],
      accent: "bg-accent-teal-soft",
      href: "/structures",
      subcategories: [
        { label: "Binary Search Tree", href: "/visualizer/structure/bst", difficulty: "beginner" },
        { label: "Hash Table", href: "/visualizer/structure/hash-table", difficulty: "intermediate" },
        { label: "Heap", href: "/visualizer/structure/heap", difficulty: "intermediate" },
        { label: "AVL Tree", href: "/visualizer/structure/avl-tree", difficulty: "advanced" },
        { label: "Graph", href: "/visualizer/structure/graph", difficulty: "advanced" },
        { label: "Trie", href: "/visualizer/structure/trie", difficulty: "advanced" },
      ],
    },
    {
      icon: <AlgorithmsIcon />,
      title: t("categories.algorithms.title"),
      desc: t("categories.algorithms.desc"),
      meta: "59+ " + t("categories.algorithms.meta").split(" ")[0],
      accent: "bg-accent-gold-soft",
      href: "/algorithms",
      subcategories: [
        { label: "Quick Sort", href: "/visualizer/algorithm/quick-sort", difficulty: "intermediate" },
        { label: "Binary Search", href: "/visualizer/search/binary-search", difficulty: "beginner" },
        { label: "Dijkstra", href: "/visualizer/graph/dijkstra", difficulty: "advanced" },
        { label: "Knapsack DP", href: "/visualizer/algorithm/knapsack", difficulty: "advanced" },
        { label: "Merge Sort", href: "/visualizer/algorithm/merge-sort", difficulty: "intermediate" },
        { label: "A* Search", href: "/visualizer/graph/a-star", difficulty: "advanced" },
      ],
    },
  ];

  return (
    <section id="categories" className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.title} category={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}