"use client";

import { algorithms, searches, graphs } from "@codeprism/content";
import { ContentGrid } from "@/components/ContentGrid";
import { useTranslations } from "next-intl";

export default function AlgorithmsPage() {
  const t = useTranslations();
  const sortingAlgorithms = Object.values(algorithms);
  const searchAlgorithms = Object.values(searches);
  const graphAlgorithms = Object.values(graphs);

  return (
    <div className="space-y-12">
      {/* Sorting Algorithms */}
      <ContentGrid
        category="algorithm"
        title={t("algorithms.sorting.title")}
        description={t("algorithms.sorting.desc")}
        badgeIcon="🔄"
        badgeText={t("algorithms.sorting.badge")}
        badgeColor="bg-accent-gold-soft border border-accent-gold/20 text-accent-gold"
        gradientFrom="from-accent-gold"
        gradientTo="to-accent-coral"
        iconBg="bg-accent-gold-soft"
        items={sortingAlgorithms}
        getMeta={(item) => [
          { label: "complexity", value: item.complexity?.time || "" },
        ]}
      />

      {/* Search Algorithms */}
      <ContentGrid
        category="search"
        title={t("algorithms.search.title")}
        description={t("algorithms.search.desc")}
        badgeIcon="🔍"
        badgeText={t("algorithms.search.badge")}
        badgeColor="bg-accent-teal-soft border border-accent-teal/20 text-accent-teal"
        gradientFrom="from-accent-teal"
        gradientTo="to-accent-gold"
        iconBg="bg-accent-teal-soft"
        items={searchAlgorithms}
        getMeta={(item) => [
          { label: "complexity", value: item.complexity?.time || "" },
        ]}
      />

      {/* Graph Algorithms */}
      <ContentGrid
        category="graph"
        title={t("algorithms.graph.title")}
        description={t("algorithms.graph.desc")}
        badgeIcon="📊"
        badgeText={t("algorithms.graph.badge")}
        badgeColor="bg-accent-coral-soft border border-accent-coral/20 text-accent-coral"
        gradientFrom="from-accent-coral"
        gradientTo="to-accent-gold"
        iconBg="bg-accent-coral-soft"
        items={graphAlgorithms}
        getMeta={(item) => [
          { label: "complexity", value: item.complexity?.time || "" },
        ]}
      />
    </div>
  );
}
