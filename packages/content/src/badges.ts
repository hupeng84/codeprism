/**
 * Achievement badge definitions for the progress store.
 *
 * Each badge is a small milestone (e.g. "complete your first lesson",
 * "master all sort algorithms"). They are computed on every progress
 * change and persisted via the existing codeprism-progress zustand store.
 *
 * NOTE: We intentionally avoid importing from the barrel "./index.js"
 * here to prevent a circular dependency (index.ts re-exports from
 * badges.ts). The per-category totals are hardcoded here as constants
 * and must be kept in sync with the content registry.
 */

export type BadgeId =
  // First steps
  | "first-step"
  // Volume tiers
  | "explorer"
  | "dedicated"
  | "completionist"
  // Per-category mastery
  | "pattern-explorer"
  | "pattern-master"
  | "algorithm-explorer"
  | "algorithm-master"
  | "structure-explorer"
  | "structure-master"
  // Collection
  | "curator"
  | "collector";

export interface BadgeDef {
  id: BadgeId;
  /** Emoji shown in card grid and toast. */
  icon: string;
  /** Accent color for the badge tile. */
  color: string;
  /** i18n key prefix for name/description (en/zh). */
  i18nKey: string;
  /** Threshold for the badge (for the progress bar). */
  threshold: number;
  /** Total count of the relevant metric (for the progress bar). */
  total: number;
  /** Which metric the badge tracks. */
  metric: "completed" | "favorites" | "patterns" | "algorithms" | "structures";
}

export const BADGES: readonly BadgeDef[] = [
  // First steps
  { id: "first-step",     icon: "👋", color: "#4ECDC4", i18nKey: "achievements.badges.first-step",     threshold: 1,   total: 1,  metric: "completed" },
  // Volume tiers
  { id: "explorer",       icon: "🧭", color: "#FFD93D", i18nKey: "achievements.badges.explorer",       threshold: 10,  total: 10, metric: "completed" },
  { id: "dedicated",      icon: "📚", color: "#A78BFA", i18nKey: "achievements.badges.dedicated",      threshold: 30,  total: 30, metric: "completed" },
  { id: "completionist",  icon: "🏆", color: "#FF6B6B", i18nKey: "achievements.badges.completionist",  threshold: 76,  total: 76, metric: "completed" },
  // Per-category
  { id: "pattern-explorer",   icon: "🏗️", color: "#A78BFA", i18nKey: "achievements.badges.pattern-explorer",   threshold: 5,  total: 5,  metric: "patterns" },
  { id: "pattern-master",     icon: "🎨", color: "#A78BFA", i18nKey: "achievements.badges.pattern-master",     threshold: 23, total: 23, metric: "patterns" },
  { id: "algorithm-explorer", icon: "⚡", color: "#4ECDC4", i18nKey: "achievements.badges.algorithm-explorer", threshold: 10, total: 10, metric: "algorithms" },
  { id: "algorithm-master",   icon: "🚀", color: "#4ECDC4", i18nKey: "achievements.badges.algorithm-master",   threshold: 21, total: 21, metric: "algorithms" },
  { id: "structure-explorer", icon: "🧱", color: "#FF6B6B", i18nKey: "achievements.badges.structure-explorer", threshold: 5,  total: 5,  metric: "structures" },
  { id: "structure-master",   icon: "🏛️", color: "#FF6B6B", i18nKey: "achievements.badges.structure-master",   threshold: 16, total: 16, metric: "structures" },
  // Collection
  { id: "curator",            icon: "⭐", color: "#FB923C", i18nKey: "achievements.badges.curator",            threshold: 5,  total: 5,  metric: "favorites" },
  { id: "collector",          icon: "💎", color: "#FB923C", i18nKey: "achievements.badges.collector",          threshold: 15, total: 15, metric: "favorites" },
] as const;

/** Per-category totals (kept in sync with the content registry). */
export const CATEGORY_TOTALS = {
  patterns: 23,
  algorithms: 21 + 7 + 9, // algorithms + searches + graphs
  structures: 16,
  total: 23 + 21 + 7 + 9 + 16, // 76
} as const;

interface CompletionState {
  completed: Record<string, boolean>;
  favorites: Record<string, boolean>;
}

/** Count items in a given category prefix from completed map. */
function countInCategory(completed: Record<string, boolean>, cat: string): number {
  return Object.keys(completed).filter(
    (k) => completed[k] && k.startsWith(`${cat}/`),
  ).length;
}

/** Compute the progress for a given badge metric. */
function metricValue(
  state: CompletionState,
  metric: BadgeDef["metric"],
): number {
  switch (metric) {
    case "completed":
      return Object.values(state.completed).filter(Boolean).length;
    case "favorites":
      return Object.values(state.favorites).filter(Boolean).length;
    case "patterns":
      return countInCategory(state.completed, "pattern");
    case "algorithms":
      return (
        countInCategory(state.completed, "algorithm") +
        countInCategory(state.completed, "search") +
        countInCategory(state.completed, "graph")
      );
    case "structures":
      return countInCategory(state.completed, "structure");
  }
}

/**
 * Check which badges a user's current progress should have unlocked.
 * Returns a Set of BadgeIds that SHOULD be unlocked given the state.
 */
export function evaluateBadges(state: CompletionState): Set<BadgeId> {
  const unlocked = new Set<BadgeId>();
  for (const badge of BADGES) {
    if (metricValue(state, badge.metric) >= badge.threshold) {
      unlocked.add(badge.id);
    }
  }
  return unlocked;
}

/** Compute the user's current value for a given badge (for progress bars). */
export function badgeProgress(state: CompletionState, badge: BadgeDef): number {
  return metricValue(state, badge.metric);
}
