"use client";

import { structures } from "@codeprism/content";
import { ContentGrid } from "@/components/ContentGrid";
import { useTranslations } from "next-intl";

export default function StructuresPage() {
  const t = useTranslations();
  const structureList = Object.values(structures);

  return (
    <ContentGrid
      category="structure"
      title={t("structures.title")}
      description={t("structures.desc")}
      badgeIcon="🧱"
      badgeText={t("structures.badge")}
      badgeColor="bg-accent-teal-soft border border-accent-teal/20 text-accent-teal"
      gradientFrom="from-accent-teal"
      gradientTo="to-accent-coral"
      iconBg="bg-accent-teal-soft"
      items={structureList}
      getMeta={(item) => [
        { label: "subcategory", value: item.subcategory || "" },
      ]}
    />
  );
}
