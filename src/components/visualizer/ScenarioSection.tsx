"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Scenario } from "@codeprism/core";
import { ScenarioCard } from "./ScenarioCard";

interface ScenarioSectionProps {
  scenarios?: Scenario[];
  /** How many scenarios to show by default before "Show all" appears. */
  defaultVisible?: number;
}

/**
 * ScenarioSection — collapsible "Real-World Applications" block.
 * Shows the first `defaultVisible` cards, with a "Show all" toggle for
 * the rest. Renders a friendly empty state when no scenarios exist.
 */
export function ScenarioSection({
  scenarios,
  defaultVisible = 2,
}: ScenarioSectionProps) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);

  // Empty state
  if (!scenarios || scenarios.length === 0) {
    return (
      <div>
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: "var(--app-text-tertiary)" }}
        >
          {t("visualizer.scenarios.title")}
        </h3>
        <div
          className="text-xs italic px-3 py-3 rounded-lg"
          style={{
            color: "var(--app-text-tertiary)",
            background: "var(--app-bg-glass-light)",
            border: "1px dashed var(--app-border)",
          }}
        >
          {t("visualizer.scenarios.empty")}
        </div>
      </div>
    );
  }

  const visibleCount = expanded ? scenarios.length : Math.min(defaultVisible, scenarios.length);
  const visible = scenarios.slice(0, visibleCount);
  const hasMore = scenarios.length > defaultVisible;

  return (
    <div>
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: "var(--app-text-tertiary)" }}
      >
        {t("visualizer.scenarios.title")}
        <span
          className="ml-2 font-mono font-normal normal-case tracking-normal"
          style={{ color: "var(--app-text-tertiary)", opacity: 0.6 }}
        >
          {scenarios.length}
        </span>
      </h3>

      <div className="flex flex-col gap-2">
        {visible.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full text-[11px] font-mono py-1.5 rounded-md transition-colors"
          style={{
            color: "var(--app-text-tertiary)",
            background: "transparent",
            border: "1px dashed var(--app-border)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--app-text-primary)";
            e.currentTarget.style.background = "var(--app-bg-glass-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--app-text-tertiary)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          {expanded
            ? t("visualizer.scenarios.showLess")
            : t("visualizer.scenarios.showAll", { count: scenarios.length })}
        </button>
      )}
    </div>
  );
}
