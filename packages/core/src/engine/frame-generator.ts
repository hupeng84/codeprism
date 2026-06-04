import type { Frame, FrameGenerator } from '../types.js';

/**
 * Create a playback controller from a frame generator.
 * Wraps the generator and provides state management.
 */
export function createPlayback<TInput, TState>(
  generator: FrameGenerator<TInput, TState>,
  input: TInput,
) {
  const frames: Frame<TState>[] = [];
  let currentStep = 0;
  let status: 'idle' | 'playing' | 'paused' | 'completed' = 'idle';
  let gen: Generator<Frame<TState>, void, unknown> | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function reset() {
    frames.length = 0;
    currentStep = 0;
    status = 'idle';
    gen = generator(input);
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function getAllFrames(): Frame<TState>[] {
    const g = generator(input);
    for (const frame of g) {
      frames.push(frame);
    }
    return frames;
  }

  function stepForward(): Frame<TState> | null {
    if (!gen) {
      gen = generator(input);
    }
    const result = gen.next();
    if (result.done) {
      status = 'completed';
      return null;
    }
    frames.push(result.value);
    currentStep = frames.length - 1;
    status = 'paused';
    return result.value;
  }

  function stepBack(): Frame<TState> | null {
    if (currentStep <= 0) return frames[0] ?? null;
    currentStep--;
    status = 'paused';
    return frames[currentStep];
  }

  function seek(step: number): Frame<TState> | null {
    if (step < 0) return null;
    if (frames.length > 0 && step >= frames.length) return null;
    // Ensure generator is initialized
    if (!gen) gen = generator(input);
    // Generate up to the requested step
    while (frames.length <= step) {
      const result = gen.next();
      if (result.done) break;
      frames.push(result.value);
    }
    if (step < frames.length) {
      currentStep = step;
      return frames[currentStep];
    }
    return null;
  }

  let speed = 1;
  let onFrame: ((frame: Frame<TState>) => void) | null = null;

  function play(interval = 800) {
    if (status === 'completed') reset();
    if (status === 'playing') return;
    status = 'playing';
    if (!gen) gen = generator(input);

    function tick() {
      if (status !== 'playing') return;
      const result = gen!.next();
      if (result.done) {
        status = 'completed';
        return;
      }
      frames.push(result.value);
      currentStep = frames.length - 1;
      onFrame?.(result.value);
      timer = setTimeout(tick, interval / speed);
    }
    tick();
  }

  function setSpeed(s: number) {
    speed = Math.max(0.25, Math.min(8, s));
  }

  function pause() {
    status = 'paused';
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function getCurrentFrame(): Frame<TState> | null {
    return frames[currentStep] ?? null;
  }

  return {
    getAllFrames,
    stepForward,
    stepBack,
    seek,
    play,
    pause,
    setSpeed,
    reset,
    getCurrentFrame,
    get frames() { return frames; },
    get currentStep() { return currentStep; },
    get status() { return status; },
    get speed() { return speed; },
    set onFrame(fn: ((frame: Frame<TState>) => void) | null) { onFrame = fn; },
  };
}

/**
 * Utility: create an array of random numbers for sorting demos.
 */
export function randomArray(length: number, max = 100): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * max) + 1);
}
