"use client";

import { useTranslations } from "next-intl";
import { useConsent } from "@/lib/analytics";

/**
 * AnalyticsConsent — a small toggle for opting in / out of anonymous
 * analytics. Designed to live in the achievements page (alongside other
 * user-state UI) or any settings surface.
 *
 * The toggle is fully keyboard-accessible (real <button>, no checkbox
 * styling tricks) and clearly explains what is and isn't collected.
 */
export function AnalyticsConsent() {
  const t = useTranslations();
  const { consent, grant, deny, loaded } = useConsent();

  if (!loaded) return null;

  const granted = consent === "granted";

  return (
    <section
      aria-labelledby="analytics-consent-title"
      className="mt-12 p-6 rounded-2xl"
      style={{
        background: "var(--app-bg-card)",
        border: "1px solid var(--app-border)",
      }}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h2
            id="analytics-consent-title"
            className="text-base font-semibold text-text-primary mb-1.5"
          >
            {t("analytics.consent.title")}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            {t("analytics.consent.body")}
          </p>
          <ul className="text-xs text-text-tertiary space-y-1">
            <li>• {t("analytics.consent.what.collected")}</li>
            <li>• {t("analytics.consent.what.notCollected")}</li>
            <li>• {t("analytics.consent.what.respect")}</li>
          </ul>
        </div>

        <button
          role="switch"
          aria-checked={granted}
          aria-label={t("analytics.consent.toggleAria")}
          onClick={granted ? deny : grant}
          className="shrink-0 w-14 h-8 rounded-full p-0.5 transition-colors"
          style={{
            background: granted
              ? "var(--app-accent)"
              : "var(--app-bg-elevated)",
            border: `1px solid ${granted ? "var(--app-accent)" : "var(--app-border)"}`,
          }}
        >
          <span
            className="block w-6 h-6 rounded-full transition-transform shadow"
            style={{
              background: "white",
              transform: granted ? "translateX(24px)" : "translateX(0)",
            }}
          />
        </button>
      </div>
    </section>
  );
}
