"use client";

import { useEffect } from "react";
import { useProgressStore } from "@/components/visualizer/use-progress-store";

/**
 * Cross-tab progress sync via BroadcastChannel.
 *
 * Why:
 *   CodePrism users often have the visualizer open in 2+ tabs. When they
 *   complete a lesson in Tab A, Tab B should reflect that change without a
 *   manual reload. Zustand's `persist` middleware already syncs via the
 *   `storage` event (a polyfill for older browsers), but storage events are
 *   slow and have a known issue: `lastUnlocked` is also persisted, which makes
 *   the achievement toast fire in every tab. This module fixes that and
 *   adds a faster, modern sync path.
 *
 * How:
 *   - On mount, open a `BroadcastChannel("codeprism-progress")`.
 *   - Subscribe to the store and broadcast the persistent slice (completed,
 *     favorites, lastVisited, achievements) on every change. `lastUnlocked`
 *     is intentionally excluded — it is transient UI state.
 *   - When a message arrives from another tab, apply it via `setState` with
 *     a guard flag so the local subscribe handler does NOT re-broadcast
 *     (prevents the message from echoing back and forth).
 *   - `tabId` lets us ignore our own messages (defensive — the channel
 *     does not echo to the sender anyway, but this future-proofs against
 *     shared workers or service-worker bridges).
 *
 * Failure modes:
 *   - Browser without `BroadcastChannel` (Safari < 15.4, IE): the hook no-ops
 *     and the zustand `storage` event fallback takes over (slower but works).
 *   - Page hidden / unloaded: the useEffect cleanup closes the channel.
 *   - Re-mount (StrictMode, HMR): the `channel` guard short-circuits.
 */

const CHANNEL_NAME = "codeprism-progress";

/**
 * Per-tab identifier. Uses sessionStorage so reloading the tab keeps the
 * same id (avoiding spurious self-echoes) but a new tab gets a fresh one.
 * The fallback covers private-mode browsers that throw on sessionStorage.
 */
const TAB_ID: string = (() => {
  if (typeof window === "undefined") return "ssr";
  try {
    const KEY = "codeprism-tab-id";
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
})();

type ProgressSnapshot = {
  completed: Record<string, boolean>;
  favorites: Record<string, boolean>;
  lastVisited: Record<string, number>;
  achievements: Record<string, number>;
};

type SyncMessage = {
  type: "state";
  state: ProgressSnapshot;
  tabId: string;
};

let channel: BroadcastChannel | null = null;
let isApplyingRemote = false;
let unsubStore: (() => void) | null = null;

/**
 * Snapshot only the persistent slice of the progress store. Excludes
 * `lastUnlocked` (transient toast trigger) and any non-persisted runtime
 * fields that may be added later.
 */
function snapshotPersistent(state: ReturnType<typeof useProgressStore.getState>): ProgressSnapshot {
  return {
    completed: state.completed,
    favorites: state.favorites,
    lastVisited: state.lastVisited,
    achievements: state.achievements,
  };
}

/**
 * Open the channel and start mirroring state across tabs.
 *
 * Idempotent: calling twice is a no-op (StrictMode + HMR safety).
 * Returns a teardown function that closes the channel.
 */
export function startProgressSync(): () => void {
  if (typeof window === "undefined") return () => {};
  if (typeof BroadcastChannel === "undefined") return () => {};
  if (channel) return () => {};

  channel = new BroadcastChannel(CHANNEL_NAME);

  channel.addEventListener("message", (event: MessageEvent<SyncMessage>) => {
    const msg = event.data;
    if (!msg || msg.type !== "state") return;
    if (msg.tabId === TAB_ID) return; // ignore self (defensive)

    isApplyingRemote = true;
    try {
      useProgressStore.setState({
        completed: msg.state.completed,
        favorites: msg.state.favorites,
        lastVisited: msg.state.lastVisited,
        achievements: msg.state.achievements,
      });
    } finally {
      isApplyingRemote = false;
    }
  });

  unsubStore = useProgressStore.subscribe((state) => {
    if (isApplyingRemote) return;
    const message: SyncMessage = {
      type: "state",
      state: snapshotPersistent(state),
      tabId: TAB_ID,
    };
    channel?.postMessage(message);
  });

  return stopProgressSync;
}

function stopProgressSync(): void {
  channel?.close();
  channel = null;
  unsubStore?.();
  unsubStore = null;
}

/**
 * React hook wrapper. Mount once at the app root (e.g. ClientShell) so the
 * channel stays open for the lifetime of the page.
 */
export function useProgressSync(): void {
  useEffect(() => {
    return startProgressSync();
  }, []);
}
