import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderSearchState } from './search-renderer.js'
import type { SearchState } from '../types.js'

// Mock CanvasRenderingContext2D
const createMockContext = () => {
  const fillStyleHistory: string[] = []
  
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    font: '',
    textAlign: '',
    strokeStyle: '',
    lineWidth: 1,
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

describe('renderSearchState', () => {
  let ctx: ReturnType<typeof createMockContext>
  const width = 800
  const height = 400

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('should clear canvas before drawing', () => {
    const state: SearchState = {
      array: [1, 2, 3, 4, 5],
      range: [0, 4],
      mid: 2,
      found: -1,
    }

    renderSearchState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height)
  })

  it('should draw bars for each array element', () => {
    const state: SearchState = {
      array: [10, 20, 30],
      range: [0, 2],
      mid: 1,
      found: -1,
    }

    renderSearchState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // 3 bars + 1 range bracket = 4 beginPath calls
    expect(ctx.beginPath).toHaveBeenCalledTimes(4)
    expect(ctx.roundRect).toHaveBeenCalledTimes(3)
    expect(ctx.fill).toHaveBeenCalledTimes(3)
  })

  it('should highlight found element', () => {
    const state: SearchState = {
      array: [1, 2, 3, 4, 5],
      range: [0, 4],
      mid: 2,
      found: 3,
    }

    renderSearchState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillStyleHistory).toContain('#4ECDC4') // found color
  })

  it('should highlight mid point', () => {
    const state: SearchState = {
      array: [1, 2, 3, 4, 5],
      range: [0, 4],
      mid: 2,
      found: -1,
    }

    renderSearchState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillStyleHistory).toContain('#FFD93D') // mid color
  })

  it('should display value labels', () => {
    const state: SearchState = {
      array: [42, 17, 99],
      range: [0, 2],
      mid: 1,
      found: -1,
    }

    renderSearchState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('42', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('17', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('99', expect.any(Number), expect.any(Number))
  })

  it('should draw range bracket', () => {
    const state: SearchState = {
      array: [1, 2, 3, 4, 5],
      range: [1, 3],
      mid: 2,
      found: -1,
    }

    renderSearchState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.moveTo).toHaveBeenCalled()
    expect(ctx.lineTo).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('should draw legend items', () => {
    const state: SearchState = {
      array: [1],
      range: [0, 0],
      mid: 0,
      found: -1,
    }

    renderSearchState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
expect(ctx.fillText).toHaveBeenCalledWith('Search Range', expect.any(Number), expect.any(Number))
  expect(ctx.fillText).toHaveBeenCalledWith('Found', expect.any(Number), expect.any(Number))
  expect(ctx.fillText).toHaveBeenCalledWith('No Match', expect.any(Number), expect.any(Number))
  })
})
