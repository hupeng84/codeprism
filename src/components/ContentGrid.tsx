"use client";

import Link from "next/link";
import { Badge } from "@codeprism/ui";
import { useTranslations, useLocale } from "next-intl";

interface ContentItem {
  id: string;
  slug: string;
  icon: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  subcategory?: string;
  complexity?: { time: string; space: string };
}

interface ContentGridProps {
  /** Category name for URL routing */
  category: string;
  /** Section title */
  title: string;
  /** Section description */
  description: string;
  /** Badge icon */
  badgeIcon: string;
  /** Badge text */
  badgeText: string;
  /** Badge color classes */
  badgeColor: string;
  /** Gradient color classes for card top border */
  gradientFrom: string;
  gradientTo: string;
  /** Icon background color class */
  iconBg: string;
  /** Content items to display */
  items: ContentItem[];
  /** Function to get meta info (difficulty, subcategory, etc.) */
  getMeta?: (item: ContentItem) => { label: string; value: string }[];
}

export function ContentGrid({
  category,
  title,
  description,
  badgeIcon,
  badgeText,
  badgeColor,
  gradientFrom,
  gradientTo,
  iconBg,
  items,
  getMeta,
}: ContentGridProps) {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="mb-12">
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${badgeColor} rounded-full text-sm font-medium mb-4`}>
            {badgeIcon} {badgeText}
          </div>
          <h1 className="font-heading text-4xl font-bold mb-3">{title}</h1>
          <p className="text-lg text-text-secondary max-w-2xl">
            {description}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/visualizer/${category}/${item.slug}`}
              className="block bg-bg-card border border-border rounded-lg p-6 no-underline transition-all hover:-translate-y-1 hover:shadow-md hover:border-border-hover relative overflow-hidden group"
            >
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className={`w-11 h-11 rounded-md ${iconBg} flex items-center justify-center text-xl mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-heading text-lg font-semibold mb-2 text-text-primary">
                {"titleKey" in item ? t((item as {titleKey: string}).titleKey) : item.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2">
                {"descKey" in item ? t((item as {descKey: string}).descKey) : item.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-text-tertiary">
                <Badge variant={item.difficulty === "beginner" ? "success" : item.difficulty === "intermediate" ? "warning" : "danger"}>
                  {item.difficulty === "beginner" ? t("featured.badge.beginner") : item.difficulty === "intermediate" ? t("featured.badge.intermediate") : t("featured.badge.advanced")}
                </Badge>
                {getMeta?.(item)?.map((meta) => (
                  <span key={meta.label}>{meta.value}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
