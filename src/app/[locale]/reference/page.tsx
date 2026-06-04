"use client";

import { useState, useMemo, useCallback } from "react";
import { getReferenceData, type ReferenceEntry, type ReferencePattern } from "@codeprism/content";
import { useTranslations } from "next-intl";

type SortDirection = "asc" | "desc";
type Algorithm = ReferenceEntry;


function getComplexityColor(complexity: string): string {
  if (complexity === "-") return "text-text-tertiary";

  if (complexity.match(/^O\(1\)$/)) return "text-emerald-400";
  if (complexity.match(/^O\(log\s?n/)) return "text-emerald-400";
  if (complexity.match(/^O\(n\)$/)) return "text-yellow-400";
  if (complexity.match(/^O\(n\s?log\s?n/)) return "text-yellow-400";
  if (complexity.match(/^O\(n\^2\)/) || complexity.match(/^O\(n²\)/)) return "text-orange-400";
  if (complexity.match(/^O\(n^3\)/) || complexity.match(/^O\(n³\)/)) return "text-orange-400";
  if (complexity.match(/^O\(2^n\)/)) return "text-red-400";
  if (complexity.match(/^O\(n!\)/)) return "text-red-400";
  if (complexity.match(/^O\(n\^/)) return "text-orange-400";
  if (complexity.match(/^O\(k\)/)) return "text-emerald-400";
  if (complexity.match(/^O\(√n\)/)) return "text-emerald-400";
  if (complexity.match(/^O\(n\s?\+\s?k\)/)) return "text-yellow-400";
  if (complexity.match(/^O\(nk\)/)) return "text-yellow-400";
  if (complexity.match(/^O\(n\)/)) return "text-yellow-400";

  return "text-text-secondary";
}

function ComplexityBadge({ value }: { value: string }) {
  return (
    <span className={`font-mono text-xs font-medium ${getComplexityColor(value)}`}>
      {value}
    </span>
  );
}

export default function ReferencePage() {
  const t = useTranslations();
  const filterTabs = [
    { key: "all", label: t("reference.filterTabs.all") },
    { key: "sorting", label: t("reference.filterTabs.sorting") },
    { key: "searching", label: t("reference.filterTabs.searching") },
    { key: "dataStructures", label: t("reference.filterTabs.dataStructures") },
    { key: "graphAlgorithms", label: t("reference.filterTabs.graphAlgorithms") },
    { key: "patterns", label: t("reference.filterTabs.patterns") },
  ];
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: SortDirection }>({ key: "name", direction: "asc" });

  const allData = useMemo(() => getReferenceData(), []);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const filteredAndSortedData = useMemo(() => {
    let filtered = allData;

    if (activeTab !== "all") {
      const categoryMap: Record<string, string> = {
        sorting: "Sorting",
        searching: "Searching",
        dataStructures: "Data Structures",
        graphAlgorithms: "Graph Algorithms",
        patterns: "Design Patterns",
      };
      filtered = filtered.filter((item) => item.category === categoryMap[activeTab]);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // Patterns have `intent` and `applicability` strings in addition to `name` — search all.
      filtered = filtered.filter((item) => {
        const base = item.name.toLowerCase().includes(query);
        if (item.category === "Design Patterns") {
          const p = item as ReferencePattern;
          return base || p.intent.toLowerCase().includes(query) || p.applicability.toLowerCase().includes(query);
        }
        return base;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      const key = sortConfig.key as keyof Algorithm;
      const aVal = String(a[key] ?? "");
      const bVal = String(b[key] ?? "");
      const comparison = aVal.localeCompare(bVal);
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [allData, activeTab, searchQuery, sortConfig]);

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === "asc" ? (
      <svg className="w-4 h-4 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-accent-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const renderTableHeader = () => {
    if (activeTab === "patterns") {
      return (
        <tr>
          {[
            { key: "name", label: t("reference.tableHeaders.pattern") },
            { key: "subcategory", label: t("reference.tableHeaders.subcategory") },
            { key: "intent", label: t("reference.tableHeaders.intent") },
            { key: "applicability", label: t("reference.tableHeaders.applicability") },
          ].map(({ key, label }) => (
            <th
              key={key}
              onClick={() => handleSort(key)}
              className="sticky top-0 bg-bg-elevated px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors border-b border-border"
            >
              <div className="flex items-center gap-1.5">
                {label}
                <SortIcon columnKey={key} />
              </div>
            </th>
          ))}
        </tr>
      );
    }

    if (activeTab === "graphAlgorithms") {
      return (
        <tr>
          {[
            { key: "name", label: t("reference.tableHeaders.algorithm") },
            { key: "category", label: t("reference.tableHeaders.category") },
            { key: "time", label: t("reference.tableHeaders.timeComplexity") },
            { key: "space", label: t("reference.tableHeaders.space") },
            { key: "useCase", label: t("reference.tableHeaders.useCase") },
          ].map(({ key, label }) => (
            <th
              key={key}
              onClick={() => handleSort(key)}
              className="sticky top-0 bg-bg-elevated px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors border-b border-border"
            >
              <div className="flex items-center gap-1.5">
                {label}
                <SortIcon columnKey={key} />
              </div>
            </th>
          ))}
        </tr>
      );
    }

    if (activeTab === "dataStructures") {
      return (
        <tr>
          {[
            { key: "name", label: t("reference.tableHeaders.structure") },
            { key: "category", label: t("reference.tableHeaders.category") },
            { key: "access", label: t("reference.tableHeaders.access") },
            { key: "search", label: t("reference.tableHeaders.search") },
            { key: "insert", label: t("reference.tableHeaders.insert") },
            { key: "delete", label: t("reference.tableHeaders.delete") },
            { key: "space", label: t("reference.tableHeaders.space") },
            { key: "useCase", label: t("reference.tableHeaders.useCase") },
          ].map(({ key, label }) => (
            <th
              key={key}
              onClick={() => handleSort(key)}
              className="sticky top-0 bg-bg-elevated px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors border-b border-border"
            >
              <div className="flex items-center gap-1.5">
                {label}
                <SortIcon columnKey={key} />
              </div>
            </th>
          ))}
        </tr>
      );
    }

    return (
      <tr>
        {[
          { key: "name", label: t("reference.tableHeaders.algorithm") },
          { key: "category", label: t("reference.tableHeaders.category") },
          { key: "best", label: t("reference.tableHeaders.timeBest") },
          { key: "average", label: t("reference.tableHeaders.timeAverage") },
          { key: "worst", label: t("reference.tableHeaders.timeWorst") },
          { key: "space", label: t("reference.tableHeaders.space") },
          { key: "useCase", label: t("reference.tableHeaders.useCase") },
        ].map(({ key, label }) => (
          <th
            key={key}
            onClick={() => handleSort(key)}
            className="sticky top-0 bg-bg-elevated px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors border-b border-border"
          >
            <div className="flex items-center gap-1.5">
              {label}
              <SortIcon columnKey={key} />
            </div>
          </th>
        ))}
      </tr>
    );
  };

  const renderTableRow = (item: Algorithm, index: number) => {
    const isEven = index % 2 === 0;

    if (item.category === "Design Patterns") {
      const p = item as ReferencePattern;
      const subColor =
        p.subcategory === "Creational" ? "bg-accent-gold-soft text-accent-gold" :
        p.subcategory === "Structural" ? "bg-accent-coral-soft text-accent-coral" :
        "bg-accent-purple-soft text-accent-purple";
      return (
        <tr
          key={p.name}
          className={`border-b border-border/50 transition-colors hover:bg-bg-card-hover ${isEven ? "bg-bg-card/50" : "bg-bg-elevated/50"}`}
        >
          <td className="px-4 py-3 text-sm font-medium text-text-primary whitespace-nowrap">{p.name}</td>
          <td className="px-4 py-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subColor}`}>
              {p.subcategory}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-text-secondary max-w-md">{p.intent}</td>
          <td className="px-4 py-3 text-sm text-text-tertiary max-w-md">{p.applicability}</td>
        </tr>
      );
    }

    if (item.category === "Graph Algorithms") {
      const graph = item as ReferenceEntry & { category: "Graph Algorithms" };
      return (
        <tr
          key={graph.name}
          className={`border-b border-border/50 transition-colors hover:bg-bg-card-hover ${isEven ? "bg-bg-card/50" : "bg-bg-elevated/50"}`}
        >
          <td className="px-4 py-3 text-sm font-medium text-text-primary">{graph.name}</td>
          <td className="px-4 py-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-purple-soft text-accent-purple">
              {graph.category}
            </span>
          </td>
          <td className="px-4 py-3">
            <ComplexityBadge value={graph.time} />
          </td>
          <td className="px-4 py-3">
            <ComplexityBadge value={graph.space} />
          </td>
          <td className="px-4 py-3 text-sm text-text-secondary">{graph.useCase}</td>
        </tr>
      );
    }

    if (item.category === "Data Structures") {
      const ds = item as ReferenceEntry & { category: "Data Structures" };
      return (
        <tr
          key={ds.name}
          className={`border-b border-border/50 transition-colors hover:bg-bg-card-hover ${isEven ? "bg-bg-card/50" : "bg-bg-elevated/50"}`}
        >
          <td className="px-4 py-3 text-sm font-medium text-text-primary">{ds.name}</td>
          <td className="px-4 py-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-coral-soft text-accent-coral">
              {ds.category}
            </span>
          </td>
          <td className="px-4 py-3">
            <ComplexityBadge value={ds.access} />
          </td>
          <td className="px-4 py-3">
            <ComplexityBadge value={ds.search} />
          </td>
          <td className="px-4 py-3">
            <ComplexityBadge value={ds.insert} />
          </td>
          <td className="px-4 py-3">
            <ComplexityBadge value={ds.delete} />
          </td>
          <td className="px-4 py-3">
            <ComplexityBadge value={ds.space} />
          </td>
          <td className="px-4 py-3 text-sm text-text-secondary">{ds.useCase}</td>
        </tr>
      );
    }

    const algo = item as ReferenceEntry & { category: "Sorting" | "Searching" };
    const categoryColor = algo.category === "Sorting" ? "bg-accent-gold-soft text-accent-gold" : "bg-accent-teal-soft text-accent-teal";
    return (
      <tr
        key={algo.name}
        className={`border-b border-border/50 transition-colors hover:bg-bg-card-hover ${isEven ? "bg-bg-card/50" : "bg-bg-elevated/50"}`}
      >
        <td className="px-4 py-3 text-sm font-medium text-text-primary">{algo.name}</td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
            {algo.category}
          </span>
        </td>
        <td className="px-4 py-3">
          <ComplexityBadge value={algo.best} />
        </td>
        <td className="px-4 py-3">
          <ComplexityBadge value={algo.average} />
        </td>
        <td className="px-4 py-3">
          <ComplexityBadge value={algo.worst} />
        </td>
        <td className="px-4 py-3">
          <ComplexityBadge value={algo.space} />
        </td>
        <td className="px-4 py-3 text-sm text-text-secondary">{algo.useCase}</td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-teal-soft border border-accent-teal/20 rounded-full text-sm font-medium text-accent-teal mb-4">
            {t("reference.badge")}
          </div>
          <h1 className="font-heading text-4xl font-bold mb-3">{t("reference.title")}</h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            {t("reference.desc")}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t("reference.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border rounded-lg text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/50 transition-all"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-accent-teal text-bg-primary"
                    : "bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-border-hover"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>{renderTableHeader()}</thead>
              <tbody>
                {filteredAndSortedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-text-tertiary">
                      {t("reference.noResults")}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData.map((item, index) => renderTableRow(item, index))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            {t("reference.legend.excellent")} (O(1), O(log n))
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            {t("reference.legend.good")} (O(n), O(n log n))
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-400"></span>
            {t("reference.legend.average")} (O(n²), O(n³))
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400"></span>
            {t("reference.legend.poor")} (O(2ⁿ), O(n!))
          </span>
        </div>
      </div>
    </div>
  );
}
