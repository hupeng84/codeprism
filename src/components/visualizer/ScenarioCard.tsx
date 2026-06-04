"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Scenario, ScenarioDomain } from "@codeprism/core";

interface ScenarioCardProps {
  scenario: Scenario;
}

// ============================================================
// Domain visual metadata — colors and display labels
// ============================================================

interface DomainMeta {
  /** Display name key suffix under visualizer.scenarios.domain.* */
  labelKey: ScenarioDomain;
  /** Accent color for the badge / icon background */
  accent: string;
  /** Soft background for the badge */
  accentSoft: string;
}

const DOMAIN_META: Record<ScenarioDomain, DomainMeta> = {
  "ui-framework":  { labelKey: "ui-framework",  accent: "#A78BFA", accentSoft: "rgba(167,139,250,0.14)" },
  "database":      { labelKey: "database",      accent: "#FFD93D", accentSoft: "rgba(255,217,61,0.14)" },
  "system":        { labelKey: "system",        accent: "#94A3B8", accentSoft: "rgba(148,163,184,0.16)" },
  "ai-ml":         { labelKey: "ai-ml",         accent: "#F472B6", accentSoft: "rgba(244,114,182,0.14)" },
  "game-dev":      { labelKey: "game-dev",      accent: "#FB923C", accentSoft: "rgba(251,146,60,0.14)" },
  "network":       { labelKey: "network",       accent: "#38BDF8", accentSoft: "rgba(56,189,248,0.14)" },
  "devtools":      { labelKey: "devtools",      accent: "#22D3EE", accentSoft: "rgba(34,211,238,0.14)" },
  "library":       { labelKey: "library",       accent: "#4ECDC4", accentSoft: "rgba(78,205,196,0.14)" },
  "business":      { labelKey: "business",      accent: "#FF6B6B", accentSoft: "rgba(255,107,107,0.14)" },
  "concurrency":   { labelKey: "concurrency",   accent: "#C084FC", accentSoft: "rgba(192,132,252,0.14)" },
  "graphics":      { labelKey: "graphics",      accent: "#34D399", accentSoft: "rgba(52,211,153,0.14)" },
  "data-pipeline": { labelKey: "data-pipeline", accent: "#FBBF24", accentSoft: "rgba(251,191,36,0.14)" },
};

/**
 * ScenarioCard — renders a single real-world application scenario.
 * Layout:
 *   ┌─────────────────────────────────────────┐
 *   │  ☕  Library         [Ref: Java SDK]    │
 *   │                                         │
 *   │  Java Iterable<T>                       │
 *   │  Every Java collection implements...    │
 *   │                                         │
 *   │  ▸ Show code                            │
 *   └─────────────────────────────────────────┘
 */
export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const t = useTranslations();
  const [codeOpen, setCodeOpen] = useState(false);

  const meta = DOMAIN_META[scenario.domain];
  const title = t(`${scenario.i18nKey}.title` as never);
  const description = t(`${scenario.i18nKey}.description` as never);
  const domainLabel = t(`visualizer.scenarios.domain.${meta.labelKey}` as never);

  return (
    <div
      className="rounded-lg p-3 transition-colors"
      style={{
        background: "var(--app-bg-glass-light)",
        border: "1px solid var(--app-border)",
      }}
    >
      {/* Header row: icon + domain + reference */}
      <div className="flex items-center gap-2 mb-2 min-w-0">
        {scenario.icon && (
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-base shrink-0"
            style={{
              background: meta.accentSoft,
              border: `1px solid ${meta.accent}30`,
            }}
            aria-hidden="true"
          >
            {scenario.icon}
          </span>
        )}
        <span
          className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded shrink-0"
          style={{
            color: meta.accent,
            background: meta.accentSoft,
          }}
        >
          {domainLabel}
        </span>
        {scenario.reference && (
          <span
            className="text-[10px] truncate min-w-0"
            style={{ color: "var(--app-text-tertiary)" }}
            title={scenario.reference}
          >
            {scenario.reference}
          </span>
        )}
      </div>

      {/* Title + description */}
      <h4
        className="text-sm font-semibold leading-snug mb-1"
        style={{ color: "var(--app-text-primary)" }}
      >
        {title}
      </h4>
      <p
        className="text-[12px] leading-relaxed"
        style={{ color: "var(--app-text-secondary)" }}
      >
        {description}
      </p>

      {/* Optional code snippet toggle */}
      {scenario.codeSnippet && (
        <div className="mt-2.5">
          <button
            onClick={() => setCodeOpen((v) => !v)}
            className="text-[11px] font-mono flex items-center gap-1.5 transition-colors"
            style={{ color: "var(--app-text-tertiary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--app-text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--app-text-tertiary)";
            }}
            aria-expanded={codeOpen}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: codeOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.15s ease",
              }}
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {codeOpen ? t("visualizer.scenarios.hideCode") : t("visualizer.scenarios.showCode")}
            <span
              className="ml-1 px-1 rounded text-[9px]"
              style={{
                background: "var(--app-bg-glass-light)",
                color: "var(--app-text-tertiary)",
              }}
            >
              {scenario.codeSnippet.language}
            </span>
          </button>
          {codeOpen && (
            <pre
              className="mt-2 p-2.5 rounded-md text-[11px] font-mono overflow-x-auto leading-relaxed"
              style={{
                background: "var(--app-bg-code)",
                color: "var(--app-text-secondary)",
                border: "1px solid var(--app-border)",
              }}
            >
              <code>{scenario.codeSnippet.code}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
