"use client";

import React from "react";
import { useProgressStore } from "./use-progress-store";
import { useTranslations } from "next-intl";

interface ProgressBadgeProps {
  category: string;
}

export default function ProgressBadge({ category }: ProgressBadgeProps) {
  const t = useTranslations();
  const getProgress = useProgressStore((s) => s.getProgress);
  const { completed, total } = getProgress(category);

  // Don't show when nothing completed
  if (completed === 0) return null;

  return (
    <div className="px-4 py-2.5 border-t border-border">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-tertiary">{t("progress.learning")}</span>
        <span className="text-text-secondary font-mono">
          {completed}/{total} {t("progress.completed")}
        </span>
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-bg-glass-light overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-coral transition-all duration-300"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
