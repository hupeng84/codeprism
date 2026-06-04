"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { Frame } from "@codeprism/core";
import { getContentFrames } from "@codeprism/content";
import type { AnyContent } from "@codeprism/content";
import { runRaftickLoop } from "@/components/visualizer/playback-loop";

export interface PanelPlayback {
  frames: Frame<unknown>[];
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  state: unknown;
  highlightedLine: number;
  description: string;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBack: () => void;
  reset: () => void;
  seek: (step: number) => void;
  setSpeed: (speed: number) => void;
  setPlaying: (v: boolean) => void;
}

interface PanelRefState {
  currentStep: number;
  totalSteps: number;
  frames: Frame<unknown>[];
  isPlaying: boolean;
  speed: number;
  state: unknown;
  highlightedLine: number;
  description: string;
}

/**
 * Ref-based playback hook for panel/compare views.
 *
 * Uses `useRef` state to avoid stale closures inside `requestAnimationFrame`
 * callbacks — unlike Zustand store, this keeps everything local to the
 * component that calls it, making it safe for multiple independent panels.
 */
export function usePanelPlayback(content: AnyContent | null): PanelPlayback {
  const frames: Frame<unknown>[] = useMemo(
    () => (content ? getContentFrames(content) : []),
    [content],
  );
  const totalSteps = frames.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const cancelRef = useRef<(() => void) | null>(null);

  const state = frames[currentStep]?.state ?? null;
  const highlightedLine = frames[currentStep]?.highlightLine ?? -1;
  const description = frames[currentStep]?.description ?? "";

  // We use a ref-based state to avoid stale closures in rAF.
  // Field updates are surgical — we mutate individual properties instead of
  // spreading the entire object on every render.
  const panelState = useRef<PanelRefState>({
    currentStep,
    totalSteps,
    frames,
    isPlaying,
    speed,
    state,
    highlightedLine,
    description,
  });

  /** Write the frame-derived fields into the ref (called after any step change). */
  const applyFrameToRef = useCallback(
    (ref: PanelRefState, idx: number) => {
      ref.currentStep = idx;
      ref.state = frames[idx]?.state ?? null;
      ref.highlightedLine = frames[idx]?.highlightLine ?? -1;
      ref.description = frames[idx]?.description ?? "";
    },
    [frames],
  );

  // Sync ref with React state (surgical field updates, no full-object spread)
  panelState.current.currentStep = currentStep;
  panelState.current.totalSteps = totalSteps;
  panelState.current.frames = frames;
  panelState.current.isPlaying = isPlaying;
  panelState.current.speed = speed;
  panelState.current.state = state;
  panelState.current.highlightedLine = highlightedLine;
  panelState.current.description = description;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRef.current?.();
    };
  }, []);

  // Playback loop — delegates to the shared rAF utility
  useEffect(() => {
    if (!isPlaying) {
      cancelRef.current?.();
      cancelRef.current = null;
      return;
    }

    const baseInterval = 600;

    cancelRef.current = runRaftickLoop({
      getStepInterval: () => baseInterval / panelState.current.speed,
      onTick: () => {
        const s = panelState.current;
        if (s.currentStep >= s.totalSteps - 1) {
          setIsPlaying(false);
          return false;
        }
        const next = s.currentStep + 1;
        setCurrentStep(next);
        applyFrameToRef(s, next);
        return true;
      },
      shouldStop: () => !panelState.current.isPlaying,
      onDone: () => {
        setIsPlaying(false);
        cancelRef.current = null;
      },
    });

    return () => {
      cancelRef.current?.();
      cancelRef.current = null;
    };
  }, [isPlaying, speed, applyFrameToRef]);

  const play = useCallback(() => {
    if (currentStep >= totalSteps - 1) {
      // Restart
      setCurrentStep(0);
      applyFrameToRef(panelState.current, 0);
    }
    setIsPlaying(true);
  }, [currentStep, totalSteps, applyFrameToRef]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentStep >= totalSteps - 1) {
        setCurrentStep(0);
        applyFrameToRef(panelState.current, 0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, currentStep, totalSteps, applyFrameToRef]);

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < totalSteps - 1) {
        const next = prev + 1;
        applyFrameToRef(panelState.current, next);
        return next;
      }
      return prev;
    });
  }, [totalSteps, applyFrameToRef]);

  const stepBack = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev > 0) {
        const p = prev - 1;
        applyFrameToRef(panelState.current, p);
        return p;
      }
      return prev;
    });
  }, [applyFrameToRef]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    applyFrameToRef(panelState.current, 0);
  }, [applyFrameToRef]);

  const seek = useCallback(
    (step: number) => {
      const clamped = Math.max(0, Math.min(totalSteps - 1, step));
      setCurrentStep(clamped);
      applyFrameToRef(panelState.current, clamped);
    },
    [totalSteps, applyFrameToRef],
  );

  const externalSetPlaying = useCallback(
    (v: boolean) => {
      if (v) play();
      else pause();
    },
    [play, pause],
  );

  return {
    frames,
    currentStep,
    totalSteps,
    isPlaying,
    speed,
    state,
    highlightedLine,
    description,
    setSpeed,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBack,
    reset,
    seek,
    setPlaying: externalSetPlaying,
  };
}
