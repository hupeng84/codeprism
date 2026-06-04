import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPlayback, randomArray } from './frame-generator.js'
import type { Frame, SortState } from '../types.js'

// Simple test generator for sorting
function* testSortGenerator(input: number[]): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input]
  let step = 0

  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
    },
    description: 'Initial state',
    highlightLine: 0,
  }

  // Simple bubble sort pass
  for (let i = 0; i < arr.length - 1; i++) {
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [i, i + 1],
        swapping: [],
        sorted: [],
      },
      description: `Comparing ${arr[i]} and ${arr[i + 1]}`,
      highlightLine: 1,
    }

    if (arr[i] > arr[i + 1]) {
      ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [],
          swapping: [i, i + 1],
          sorted: [],
        },
        description: `Swapped ${arr[i]} and ${arr[i + 1]}`,
        highlightLine: 2,
      }
    }
  }

  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: arr.map((_, i) => i),
    },
    description: 'Sorting complete',
    highlightLine: 3,
  }
}

describe('createPlayback', () => {
  let playback: ReturnType<typeof createPlayback<number[], SortState>>

  beforeEach(() => {
    playback = createPlayback(testSortGenerator, [3, 1, 2])
  })

  afterEach(() => {
    playback.pause()
  })

  it('should initialize with idle status', () => {
    expect(playback.status).toBe('idle')
    expect(playback.currentStep).toBe(0)
    expect(playback.frames).toHaveLength(0)
  })

  it('should generate all frames on getAllFrames', () => {
    const frames = playback.getAllFrames()
    expect(frames.length).toBeGreaterThan(0)
    expect(frames[0].step).toBe(0)
    expect(frames[0].state.array).toEqual([3, 1, 2])
  })

  it('should step forward correctly', () => {
    const frame1 = playback.stepForward()
    expect(frame1).not.toBeNull()
    expect(frame1!.step).toBe(0)
    expect(playback.status).toBe('paused')

    const frame2 = playback.stepForward()
    expect(frame2).not.toBeNull()
    expect(playback.frames).toHaveLength(2)
  })

  it('should step back correctly', () => {
    playback.stepForward()
    playback.stepForward()
    expect(playback.currentStep).toBe(1)

    const frame = playback.stepBack()
    expect(frame).not.toBeNull()
    expect(playback.currentStep).toBe(0)
  })

  it('should seek to a specific step', () => {
    const frame = playback.seek(2)
    expect(frame).not.toBeNull()
    expect(playback.currentStep).toBe(2)
  })

  it('should return null for invalid seek', () => {
    expect(playback.seek(-1)).toBeNull()
  })

  it('should reset correctly', () => {
    playback.stepForward()
    playback.stepForward()
    expect(playback.frames).toHaveLength(2)

    playback.reset()
    expect(playback.status).toBe('idle')
    expect(playback.currentStep).toBe(0)
    expect(playback.frames).toHaveLength(0)
  })

  it('should set speed within bounds', () => {
    playback.setSpeed(0.5)
    expect(playback.speed).toBe(0.5)

    playback.setSpeed(0.1) // Below minimum
    expect(playback.speed).toBe(0.25)

    playback.setSpeed(10) // Above maximum
    expect(playback.speed).toBe(8)
  })

  it('should play and pause', () => {
    vi.useFakeTimers()
    
    playback.play(100)
    expect(playback.status).toBe('playing')
    
    playback.pause()
    expect(playback.status).toBe('paused')
    
    vi.useRealTimers()
  })

  it('should handle onFrame callback', () => {
    vi.useFakeTimers()
    
    const onFrame = vi.fn()
    playback.onFrame = onFrame
    
    playback.play(100)
    
    // Advance timers to trigger frame callbacks
    vi.advanceTimersByTime(500)
    
    expect(onFrame).toHaveBeenCalled()
    
    playback.pause()
    vi.useRealTimers()
  })

  it('should complete when generator finishes', () => {
    // Step through all frames
    while (playback.stepForward() !== null) {
      // Continue stepping
    }
    
    expect(playback.status).toBe('completed')
  })
})

describe('randomArray', () => {
  it('should generate array of correct length', () => {
    const arr = randomArray(10)
    expect(arr).toHaveLength(10)
  })

  it('should generate numbers within range', () => {
    const arr = randomArray(100, 50)
    expect(arr.every(n => n >= 1 && n <= 50)).toBe(true)
  })

  it('should use default max of 100', () => {
    const arr = randomArray(100)
    expect(arr.every(n => n >= 1 && n <= 100)).toBe(true)
  })
})
