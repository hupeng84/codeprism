"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BADGES } from "@codeprism/content";
import { useProgressStore } from "./use-progress-store";

/**
 * AchievementToast — slides in from the bottom-right when a new badge is
 * unlocked via the progress store. Auto-dismisses after 5s, or on click.
 *
 * Mounted at the root level so it works on any page.
 */
export function AchievementToast() {
  const t = useTranslations();
  const lastUnlocked = useProgressStore((s) => s.lastUnlocked);
  const dismiss = useProgressStore((s) => s.dismissToast);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (lastUnlocked) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        // Clear the store state so the next unlock can re-trigger.
        dismiss();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [lastUnlocked, dismiss]);

  if (!show || !lastUnlocked) return null;

  const badge = BADGES.find((b) => b.id === lastUnlocked);
  if (!badge) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm pointer-events-auto"
      style={{
        animation: "achievement-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onClick={() => {
        setShow(false);
        dismiss();
      }}
    >
      <style>{`
        @keyframes achievement-slide-in {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes achievement-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      `}</style>
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
        style={{
          background: "var(--app-bg-card)",
          border: `1px solid ${badge.color}66`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${badge.color}22`,
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{
            background: `${badge.color}22`,
            border: `1px solid ${badge.color}55`,
            animation: "achievement-pulse 1.4s ease-in-out 0.4s",
          }}
          aria-hidden="true"
        >
          {badge.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
            style={{ color: badge.color }}
          >
            {t("achievements.toastUnlocked")}
          </div>
          <div className="text-sm font-semibold text-text-primary truncate">
            {t(`${badge.i18nKey}.name` as never)}
          </div>
          <div className="text-xs text-text-tertiary truncate">
            {t(`${badge.i18nKey}.desc` as never)}
          </div>
        </div>
        <button
          aria-label={t("achievements.dismiss")}
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setShow(false);
            dismiss();
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
