"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Frame, PlaybackStatus } from "@codeprism/core";
import { runRaftickLoop } from "@/components/visualizer/playback-loop";

export interface PlaybackState {
  playing: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
  frames: Frame<unknown>[];
  status: PlaybackStatus;
  state: unknown;
  highlightedLine: number;
  description: string;

  init: (frames: Frame<unknown>[]) => void;
  setPlaying: (v: boolean) => void;
  setSpeed: (v: number) => void;
  stepForward: () => void;
  stepBack: () => void;
  reset: () => void;
  seek: (step: number) => void;
  tick: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  playing: false,
  speed: 1,
  currentStep: 0,
  totalSteps: 0,
  frames: [],
  status: "idle",
  state: null,
  highlightedLine: -1,
  description: "",

  init: (frames) => {
    set({
      frames,
      totalSteps: frames.length,
      currentStep: 0,
      playing: false,
      status: "idle",
      state: frames[0]?.state ?? null,
      highlightedLine: frames[0]?.highlightLine ?? -1,
      description: frames[0]?.description ?? "",
    });
  },

  setPlaying: (playing) => {
    const { totalSteps, currentStep } = get();
    if (playing && currentStep >= totalSteps - 1) {
      // Restart from beginning
      const f0 = get().frames[0];
      set({ currentStep: 0, state: f0?.state ?? null, highlightedLine: f0?.highlightLine ?? -1, description: f0?.description ?? "" });
    }
    set({ playing, status: playing ? "playing" : "paused" });
  },

  setSpeed: (speed) => set({ speed }),

  stepForward: () => {
    const { currentStep, totalSteps, frames } = get();
    if (currentStep < totalSteps - 1) {
      const next = currentStep + 1;
      const f = frames[next];
      set({
        currentStep: next,
        state: f?.state ?? null,
        highlightedLine: f?.highlightLine ?? -1,
        description: f?.description ?? "",
      });
    }
  },

  stepBack: () => {
    const { currentStep, frames } = get();
    if (currentStep > 0) {
      const prev = currentStep - 1;
      const f = frames[prev];
      set({
        currentStep: prev,
        state: f?.state ?? null,
        highlightedLine: f?.highlightLine ?? -1,
        description: f?.description ?? "",
      });
    }
  },

  reset: () => {
    const { frames } = get();
    const f = frames[0];
    set({
      currentStep: 0,
      playing: false,
      status: "idle",
      state: f?.state ?? null,
      highlightedLine: f?.highlightLine ?? -1,
      description: f?.description ?? "",
    });
  },

  seek: (step) => {
    const { frames, totalSteps } = get();
    const clamped = Math.max(0, Math.min(totalSteps - 1, step));
    const f = frames[clamped];
    set({
      currentStep: clamped,
      state: f?.state ?? null,
      highlightedLine: f?.highlightLine ?? -1,
      description: f?.description ?? "",
    });
  },

  tick: () => {
    const { currentStep, totalSteps, frames } = get();
    if (currentStep < totalSteps - 1) {
      const next = currentStep + 1;
      const f = frames[next];
      set({
        currentStep: next,
        state: f?.state ?? null,
        highlightedLine: f?.highlightLine ?? -1,
        description: f?.description ?? "",
      });
    } else {
      set({ playing: false, status: "completed" });
    }
  },
}));

/**
 * Hook that manages auto-play with requestAnimationFrame timing.
 *
 * `tick` is a stable function reference (defined once inside `create()`), so
 * consumers can safely include it in `useEffect` dependency arrays without
 * causing unnecessary effect re-runs.
 *
 * @param baseInterval — ms per step at 1x speed (default 600 for sort/structure/search, 1200 for patterns)
 */
export function usePlaybackLoop(baseInterval = 600) {
  useEffect(() => {
    const cancel = runRaftickLoop({
      getStepInterval: () => {
        const { speed } = usePlaybackStore.getState();
        return baseInterval / speed;
      },
      onTick: () => {
        const { playing, currentStep, totalSteps } = usePlaybackStore.getState();
        // Stop the loop only on completion — `tick()` will also flip
        // `playing` to false so the UI reflects the end state.
        if (currentStep >= totalSteps - 1) return false;
        // Keep the rAF loop alive while paused; otherwise the loop would
        // self-cancel on the first frame and never resume when the user
        // hits play. `accumulated` is naturally drained by the per-frame
        // cap so we don't burst-tick on resume.
        if (!playing) return true;
        usePlaybackStore.getState().tick();
        return true;
      },
      // Pause/resume is handled inside onTick. shouldStop stays false so
      // the loop survives pauses and only the cleanup effect on unmount
      // can cancel it externally.
      shouldStop: () => false,
    });

    return cancel;
  }, [baseInterval]);
}

// ---------------------------------------------------------------------------
// Selector helpers — use these instead of `usePlaybackStore()` to avoid
// store-wide re-renders when only a single slice is needed.
// ---------------------------------------------------------------------------
export const usePlaying = () => usePlaybackStore((s) => s.playing);
export const useSpeed = () => usePlaybackStore((s) => s.speed);
export const useCurrentStep = () => usePlaybackStore((s) => s.currentStep);
export const useTotalSteps = () => usePlaybackStore((s) => s.totalSteps);
