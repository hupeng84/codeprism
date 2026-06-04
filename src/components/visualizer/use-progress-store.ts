"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { idbStorage } from "@/lib/idb-storage";
import { track } from "@/lib/analytics";
import {
  algorithms,
  searches,
  graphs,
  structures,
  patterns,
  evaluateBadges,
  type BadgeId,
} from "@codeprism/content";

interface ProgressState {
  completed: Record<string, boolean>;
  favorites: Record<string, boolean>;
  lastVisited: Record<string, number>;
  /** Map of unlocked badge id → unlock timestamp (ms since epoch). */
  achievements: Record<string, number>;
  /** Most recently unlocked badge, surfaced in the toast UI. */
  lastUnlocked: BadgeId | null;

  markCompleted: (key: string) => BadgeId[];
  toggleFavorite: (key: string) => void;
  updateLastVisited: (key: string) => void;
  isCompleted: (key: string) => boolean;
  isFavorite: (key: string) => boolean;
  getProgress: (category: string) => { completed: number; total: number };
  /** Manually clear the toast after the user has seen it. */
  dismissToast: () => void;
  /** Force re-evaluate badges (used by tests / settings reset). */
  recomputeBadges: () => BadgeId[];
}

/** Map category key → content record length */
const categoryTotals: Record<string, number> = {
  algorithm: Object.keys(algorithms).length,
  search: Object.keys(searches).length,
  graph: Object.keys(graphs).length,
  structure: Object.keys(structures).length,
  pattern: Object.keys(patterns).length,
};

/**
 * Diff `shouldUnlock` against the current achievements map, returning the
 * new achievements map (with `Date.now()` for the newly-unlocked ones) and
 * the list of newly-unlocked badge IDs. Shared by markCompleted,
 * toggleFavorite, and recomputeBadges so the unlock logic lives in one place.
 */
function evaluateAndUnlock(
  shouldUnlock: Iterable<BadgeId>,
  currentAchievements: Record<string, number>,
): { newAchievements: Record<string, number>; newlyUnlocked: BadgeId[] } {
  const newlyUnlocked: BadgeId[] = [];
  const newAchievements: Record<string, number> = { ...currentAchievements };
  for (const id of shouldUnlock) {
    if (!(id in currentAchievements)) {
      newAchievements[id] = Date.now();
      newlyUnlocked.push(id);
    }
  }
  return { newAchievements, newlyUnlocked };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completed: {},
      favorites: {},
      lastVisited: {},
      achievements: {},
      lastUnlocked: null,

      markCompleted: (key) => {
        const { completed } = get();
        if (completed[key]) {
          // Already completed — nothing to unlock.
          return [];
        }
        const newCompleted = { ...completed, [key]: true };
        // Re-evaluate badges under the new completion set.
        const shouldUnlock = evaluateBadges({
          completed: newCompleted,
          favorites: get().favorites,
        });
        const { newAchievements, newlyUnlocked } = evaluateAndUnlock(
          shouldUnlock,
          get().achievements,
        );
        // Show only the FIRST newly unlocked badge in the toast (avoids spamming).
        set({
          completed: newCompleted,
          achievements: newAchievements,
          lastUnlocked: newlyUnlocked[0] ?? null,
        });
        // Analytics (no-op if consent denied).
        track({
          type: "lesson_completed",
          lessonId: key,
          category: key.split("/")[0] ?? "unknown",
          timeSpentSec: 0, // not tracked yet — could be added via started_at state
        });
        for (const badgeId of newlyUnlocked) {
          track({
            type: "achievement_unlocked",
            badgeId,
            source: "complete",
          });
        }
        return newlyUnlocked;
      },

      toggleFavorite: (key) => {
        const { favorites } = get();
        const willFavorite = !favorites[key];
        const newFavorites = { ...favorites, [key]: willFavorite };
        // Favouriting can also unlock badges (curator / collector).
        const shouldUnlock = evaluateBadges({
          completed: get().completed,
          favorites: newFavorites,
        });
        const { newAchievements, newlyUnlocked } = evaluateAndUnlock(
          shouldUnlock,
          get().achievements,
        );
        set({
          favorites: newFavorites,
          achievements: newAchievements,
          lastUnlocked: newlyUnlocked[0] ?? null,
        });
        // Analytics.
        track({
          type: "favorite_toggled",
          itemId: key,
          favorited: willFavorite,
        });
        for (const badgeId of newlyUnlocked) {
          track({
            type: "achievement_unlocked",
            badgeId,
            source: "favorite",
          });
        }
      },

      updateLastVisited: (key) => {
        const { lastVisited } = get();
        set({ lastVisited: { ...lastVisited, [key]: Date.now() } });
      },

      isCompleted: (key) => !!get().completed[key],
      isFavorite: (key) => !!get().favorites[key],

      getProgress: (category) => {
        const { completed } = get();
        const total = categoryTotals[category] ?? 0;
        const done = Object.keys(completed).filter(
          (k) => k.startsWith(`${category}/`) && completed[k],
        ).length;
        return { completed: done, total };
      },

      dismissToast: () => set({ lastUnlocked: null }),

      recomputeBadges: () => {
        const shouldUnlock = evaluateBadges({
          completed: get().completed,
          favorites: get().favorites,
        });
        const { newAchievements, newlyUnlocked } = evaluateAndUnlock(
          shouldUnlock,
          get().achievements,
        );
        set({ achievements: newAchievements });
        return newlyUnlocked;
      },
    }),
    {
      name: "codeprism-progress",
      // IDB-backed storage with a localStorage mirror (see idb-storage.ts).
      // Gives the SW access to the data, removes the 5-10 MB localStorage
      // ceiling, and keeps the storage-event fallback working on browsers
      // without BroadcastChannel.
      storage: createJSONStorage(() => idbStorage),
      // Exclude `lastUnlocked` (and any other transient runtime state) from
      // both localStorage persistence and BroadcastChannel sync. Without
      // this, the achievement toast fires in every open tab on storage
      // events. See `src/lib/progress-sync.ts` for the cross-tab mirror.
      partialize: (state) => ({
        completed: state.completed,
        favorites: state.favorites,
        lastVisited: state.lastVisited,
        achievements: state.achievements,
      }),
      // Migrate from old key if it exists
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          try {
            const oldData = localStorage.getItem("compubasic-progress");
            if (oldData) {
              const parsed = JSON.parse(oldData);
              localStorage.removeItem("compubasic-progress");
              const oldState = parsed.state as Record<string, unknown>;
              return { ...(persistedState as Record<string, unknown>), ...oldState };
            }
          } catch {
            // Ignore migration errors
          }
        }
        if (version < 2) {
          // v1 → v2: add achievements + lastUnlocked
          const s = (persistedState ?? {}) as Record<string, unknown>;
          return {
            ...s,
            achievements: (s.achievements as Record<string, number>) ?? {},
            lastUnlocked: null,
          };
        }
        return persistedState;
      },
      version: 2,
    },
  ),
);
