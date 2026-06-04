"use client";

import { patterns } from "@codeprism/content";
import { ContentGrid } from "@/components/ContentGrid";
import { useTranslations } from "next-intl";

export default function PatternsPage() {
  const t = useTranslations();
  const patternList = Object.values(patterns);

  return (
    <ContentGrid
      category="pattern"
      title={t("patterns.title")}
      description={t("patterns.desc")}
      badgeIcon="🏗️"
      badgeText={t("patterns.badge")}
      badgeColor="bg-accent-coral-soft border border-accent-coral/20 text-accent-coral"
      gradientFrom="from-accent-coral"
      gradientTo="to-accent-gold"
      iconBg="bg-accent-coral-soft"
      items={patternList}
      getMeta={(item) => [
        { label: "subcategory", value: item.subcategory || "" },
      ]}
    />
  );
}
