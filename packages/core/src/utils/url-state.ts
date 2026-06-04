import { PlaybackStatus } from "../types";

interface PlaybackURLState {
  step: number;
  speed: number;
  status: PlaybackStatus;
  input?: number[];
  dark?: boolean;
  view?: "structure" | "runtime" | "code";
}

/**
 * Serialize playback state to URL search params
 */
export function serializePlaybackState(state: PlaybackURLState): string {
  const params = new URLSearchParams();
  params.set("step", state.step.toString());
  params.set("speed", state.speed.toString());
  params.set("status", state.status);
  
  if (state.input && state.input.length > 0) {
    params.set("input", state.input.join(","));
  }
  
  if (state.dark !== undefined) {
    params.set("dark", state.dark.toString());
  }
  
  if (state.view) {
    params.set("view", state.view);
  }
  
  return params.toString();
}

/**
 * Deserialize playback state from URL search params
 */
export function deserializePlaybackState(search: string): PlaybackURLState | null {
  const params = new URLSearchParams(search);
  const step = params.get("step");
  const speed = params.get("speed");
  const status = params.get("status");

  if (step === null || speed === null || status === null) {
    return null;
  }

  const stepNum = parseInt(step, 10);
  const speedNum = parseFloat(speed);

  if (isNaN(stepNum) || isNaN(speedNum)) {
    return null;
  }

  if (!["idle", "playing", "paused", "completed"].includes(status)) {
    return null;
  }

  const state: PlaybackURLState = {
    step: stepNum,
    speed: speedNum,
    status: status as PlaybackStatus,
  };

  // Parse optional input array
  const inputParam = params.get("input");
  if (inputParam) {
    const input = inputParam.split(",").map(Number).filter((n) => !isNaN(n));
    if (input.length > 0) {
      state.input = input;
    }
  }

  // Parse optional dark mode
  const darkParam = params.get("dark");
  if (darkParam !== null) {
    state.dark = darkParam === "true";
  }

  // Parse optional view mode
  const viewParam = params.get("view");
  if (viewParam && ["structure", "runtime", "code"].includes(viewParam)) {
    state.view = viewParam as "structure" | "runtime" | "code";
  }

  return state;
}

/**
 * Update URL with playback state without causing navigation
 */
export function updateURLWithState(state: PlaybackURLState): void {
  const url = new URL(window.location.href);
  
  // Clear existing playback params
  url.searchParams.delete("step");
  url.searchParams.delete("speed");
  url.searchParams.delete("status");
  url.searchParams.delete("input");
  url.searchParams.delete("dark");
  url.searchParams.delete("view");
  
  // Set params directly
  url.searchParams.set("step", state.step.toString());
  url.searchParams.set("speed", state.speed.toString());
  url.searchParams.set("status", state.status);
  
  if (state.input && state.input.length > 0) {
    url.searchParams.set("input", state.input.join(","));
  }
  
  if (state.dark !== undefined) {
    url.searchParams.set("dark", state.dark.toString());
  }
  
  if (state.view) {
    url.searchParams.set("view", state.view);
  }

  window.history.replaceState({}, "", url.toString());
}

/**
 * Get initial playback state from URL
 */
export function getInitialStateFromURL(): PlaybackURLState | null {
  if (typeof window === "undefined") {
    return null;
  }
  return deserializePlaybackState(window.location.search);
}

/**
 * Get view mode from URL (defaults to "runtime")
 */
export function getViewFromURL(): "structure" | "runtime" | "code" {
  if (typeof window === "undefined") {
    return "runtime";
  }
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (view && ["structure", "runtime", "code"].includes(view)) {
    return view as "structure" | "runtime" | "code";
  }
  return "runtime";
}

/**
 * Get dark mode from URL (defaults to true)
 */
export function getDarkFromURL(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const params = new URLSearchParams(window.location.search);
  const dark = params.get("dark");
  return dark !== "false";
}

/**
 * Get input array from URL
 */
export function getInputFromURL(): number[] | null {
  if (typeof window === "undefined") {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const inputParam = params.get("input");
  if (inputParam) {
    const input = inputParam.split(",").map(Number).filter((n) => !isNaN(n));
    return input.length > 0 ? input : null;
  }
  return null;
}
