"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BADGES, type BadgeDef, badgeProgress } from "@codeprism/content";
import { useProgressStore } from "@/components/visualizer/use-progress-store";

/**
 * Achievements page — a gallery of all badges, grouped by unlocked/locked,
 * with a progress bar for each badge showing how close the user is.
 */
export default function AchievementsPage() {
  const t = useTranslations();
  const completed = useProgressStore((s) => s.completed);
  const favorites = useProgressStore((s) => s.favorites);
  const unlocked = useProgressStore((s) => s.achievements);

  const state = useMemo(
    () => ({ completed, favorites }),
    [completed, favorites],
  );

  const { unlockedList, lockedList, totalUnlocked, totalAvailable, percentUnlocked } = useMemo(() => {
    const u: BadgeDef[] = [];
    const l: BadgeDef[] = [];
    for (const b of BADGES) {
      if (unlocked[b.id]) u.push(b);
      else l.push(b);
    }
    return {
      unlockedList: u,
      lockedList: l,
      totalUnlocked: u.length,
      totalAvailable: BADGES.length,
      percentUnlocked: Math.round((u.length / BADGES.length) * 100),
    };
  }, [unlocked]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{
              background: "rgba(255,217,61,0.14)",
              border: "1px solid rgba(255,217,61,0.25)",
              color: "#FFD93D",
            }}
          >
            🏆 {t("achievements.badge")}
          </div>
          <h1 className="font-heading text-4xl font-bold mb-3">{t("achievements.title")}</h1>
          <p className="text-lg text-text-secondary max-w-2xl mb-4">
            {t("achievements.desc")}
          </p>
          {/* Overall progress */}
          <div className="flex items-center gap-4 max-w-md">
            <div className="flex-1 h-2 bg-bg-glass-light rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentUnlocked}%`,
                  background: "linear-gradient(90deg, #FFD93D, #FF6B6B)",
                }}
              />
            </div>
            <div className="text-sm font-mono text-text-primary whitespace-nowrap">
              {totalUnlocked}<span className="text-text-tertiary">/{totalAvailable}</span>
            </div>
          </div>
        </div>

        {/* Unlocked section */}
        {unlockedList.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-4">
              {t("achievements.unlocked")} · {unlockedList.length}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {unlockedList.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  progress={badgeProgress(state, badge)}
                  unlocked
                  t={t}
                />
              ))}
            </div>
          </section>
        )}

        {/* Locked section */}
        {lockedList.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-4">
              {t("achievements.locked")} · {lockedList.length}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {lockedList.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  progress={badgeProgress(state, badge)}
                  unlocked={false}
                  t={t}
                />
              ))}
            </div>
          </section>
        )}

        {/* CTA back to home if all unlocked */}
        {percentUnlocked === 100 && (
          <div className="mt-8 p-6 rounded-2xl text-center" style={{ background: "rgba(255,217,61,0.10)", border: "1px solid rgba(255,217,61,0.25)" }}>
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-base font-semibold text-text-primary mb-1">
              {t("achievements.allUnlocked")}
            </div>
            <div className="text-sm text-text-secondary mb-4">
              {t("achievements.allUnlockedDesc")}
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-gold text-bg-primary text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t("achievements.backHome")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeCard({
  badge,
  progress,
  unlocked,
  t,
}: {
  badge: BadgeDef;
  progress: number;
  unlocked: boolean;
  t: (k: string) => string;
}) {
  const pct = Math.min(100, Math.round((progress / badge.threshold) * 100));
  const name = t(`${badge.i18nKey}.name` as never);
  const desc = t(`${badge.i18nKey}.desc` as never);

  return (
    <div
      className="relative rounded-2xl p-4 transition-all"
      style={{
        background: unlocked
          ? `linear-gradient(135deg, ${badge.color}1A, var(--app-bg-card))`
          : "var(--app-bg-card)",
        border: `1px solid ${unlocked ? `${badge.color}55` : "var(--app-border)"}`,
        opacity: unlocked ? 1 : 0.78,
      }}
    >
      {/* Locked overlay */}
      {!unlocked && (
        <div
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
          style={{ background: "var(--app-bg-glass-light)" }}
          aria-hidden="true"
        >
          🔒
        </div>
      )}

      {/* Icon */}
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-3"
        style={{
          background: unlocked ? `${badge.color}26` : "var(--app-bg-glass-light)",
          border: `1px solid ${unlocked ? `${badge.color}55` : "var(--app-border)"}`,
          filter: unlocked ? "none" : "grayscale(0.4) opacity(0.7)",
        }}
        aria-hidden="true"
      >
        {badge.icon}
      </div>

      {/* Name + desc */}
      <div className="text-sm font-semibold text-text-primary mb-0.5 line-clamp-1">{name}</div>
      <div className="text-xs text-text-tertiary line-clamp-2 mb-3 min-h-[2lh]">{desc}</div>

      {/* Progress bar */}
      <div className="h-1.5 bg-bg-glass-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: unlocked ? badge.color : "var(--app-text-tertiary)",
          }}
        />
      </div>
      <div className="text-[10px] font-mono mt-1.5 text-text-tertiary flex justify-between">
        <span>{progress} / {badge.threshold}</span>
        {unlocked ? (
          <span style={{ color: badge.color }}>{t("achievements.unlockedLabel")}</span>
        ) : (
          <span>{pct}%</span>
        )}
      </div>
    </div>
  );
}

