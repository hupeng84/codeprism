import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderSortState } from './sort-renderer.js'
import type { SortState } from '../types.js'

// Mock CanvasRenderingContext2D that tracks all fillStyle assignments
const createMockContext = () => {
  const fillStyleHistory: string[] = []
  
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    font: '',
    textAlign: '',
    get fillStyle() {
      return fillStyleHistory[fillStyleHistory.length - 1] || ''
    },
    set fillStyle(value: string) {
      fillStyleHistory.push(value)
    },
    get fillStyleHistory() {
      return fillStyleHistory
    },
  }
}

describe('renderSortState', () => {
  let ctx: ReturnType<typeof createMockContext>
  const width = 800
  const height = 400

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('should clear canvas before drawing', () => {
    const state: SortState = {
      array: [3, 1, 2],
      comparing: [],
      swapping: [],
      sorted: [],
    }

    renderSortState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height)
  })

  it('should draw bars for each array element', () => {
    const state: SortState = {
      array: [5, 3, 8, 1],
      comparing: [],
      swapping: [],
      sorted: [],
    }

    renderSortState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.beginPath).toHaveBeenCalledTimes(4) // One per element
    expect(ctx.roundRect).toHaveBeenCalledTimes(4)
    expect(ctx.fill).toHaveBeenCalledTimes(4)
  })

  it('should use comparing color for comparing indices', () => {
    const state: SortState = {
      array: [3, 1, 2],
      comparing: [0, 1],
      swapping: [],
      sorted: [],
    }

    renderSortState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Check that fillStyle was set to comparing color at some point
    expect(ctx.fillStyleHistory).toContain('#FFD93D')
  })

  it('should use swapping color for swapping indices', () => {
    const state: SortState = {
      array: [3, 1, 2],
      comparing: [],
      swapping: [1, 2],
      sorted: [],
    }

    renderSortState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillStyleHistory).toContain('#FF6B6B')
  })

  it('should use sorted color for sorted indices', () => {
    const state: SortState = {
      array: [3, 1, 2],
      comparing: [],
      swapping: [],
      sorted: [0, 1, 2],
    }

    renderSortState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillStyleHistory).toContain('#4ECDC4')
  })

  it('should display value labels above bars', () => {
    const state: SortState = {
      array: [42, 17],
      comparing: [],
      swapping: [],
      sorted: [],
    }

    renderSortState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('42', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('17', expect.any(Number), expect.any(Number))
  })

  it('should display index labels below bars', () => {
    const state: SortState = {
      array: [5, 3],
      comparing: [],
      swapping: [],
      sorted: [],
    }

    renderSortState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('0', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('1', expect.any(Number), expect.any(Number))
  })

  it('should draw legend items', () => {
    const state: SortState = {
      array: [1],
      comparing: [],
      swapping: [],
      sorted: [],
    }

    renderSortState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Bars use roundRect+fill, legend items use fillRect (4 legend items)
    expect(ctx.fillRect).toHaveBeenCalledTimes(4) // 4 legend items
    expect(ctx.fillText).toHaveBeenCalledWith('Unsorted', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Comparing', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Swapping', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Sorted', expect.any(Number), expect.any(Number))
  })
})
