"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Tab = "info" | "code" | "uml" | "demo";

interface VisualState {
  activeTab: Tab;
  zoom: number;
  panOffset: { x: number; y: number };

  setActiveTab: (tab: Tab) => void;
  setZoom: (level: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
}

export const useVisualStore = create<VisualState>()(
  persist(
    (set) => ({
      activeTab: "info",
      zoom: 1,
      panOffset: { x: 0, y: 0 },

      setActiveTab: (tab) => set({ activeTab: tab }),

      setZoom: (level) => {
        const clamped = Math.max(0.5, Math.min(2, level));
        set({ zoom: clamped });
      },

      setPan: (x, y) => set({ panOffset: { x, y } }),

      resetView: () => set({ zoom: 1, panOffset: { x: 0, y: 0 } }),
    }),
    {
      name: "codeprism-zoom",
      // Migrate from old key if it exists
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          try {
            const oldData = localStorage.getItem("compubasic-zoom");
            if (oldData) {
              const parsed = JSON.parse(oldData);
              localStorage.removeItem("compubasic-zoom");
              const oldState = parsed.state as Record<string, unknown>;
              return { ...(persistedState as Record<string, unknown>), ...oldState };
            }
          } catch {
            // Ignore migration errors
          }
        }
        return persistedState;
      },
      version: 1,
      partialize: (state) => ({ zoom: state.zoom }),
    },
  ),
);
