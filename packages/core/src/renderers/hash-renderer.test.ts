import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHashState } from './hash-renderer.js'
import type { HashState } from '../types.js'

// Mock CanvasRenderingContext2D that tracks all fillStyle / strokeStyle assignments
const createMockContext = () => {
  const fillStyleHistory: string[] = []
  const strokeStyleHistory: string[] = []

  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    font: '',
    textAlign: '',
    textBaseline: '',
    lineWidth: 0,
    get fillStyle() {
      return fillStyleHistory[fillStyleHistory.length - 1] || ''
    },
    set fillStyle(value: string) {
      fillStyleHistory.push(value)
    },
    get strokeStyle() {
      return strokeStyleHistory[strokeStyleHistory.length - 1] || ''
    },
    set strokeStyle(value: string) {
      strokeStyleHistory.push(value)
    },
    get fillStyleHistory() {
      return fillStyleHistory
    },
    get strokeStyleHistory() {
      return strokeStyleHistory
    },
  }
}

describe('renderHashState', () => {
  let ctx: ReturnType<typeof createMockContext>
  const width = 800
  const height = 400
  const size = 5

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('should clear canvas before drawing', () => {
    const state: HashState = {
      slots: [],
      operation: 'Insert',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height)
  })

  it('should fill background', () => {
    const state: HashState = {
      slots: [],
      operation: 'Insert',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Background fill uses the first fillStyle assignment (canvasBg) then fillRect
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, width, height)
    // Dark theme canvasBg is #1e1e2e
    expect(ctx.fillStyleHistory).toContain('#1e1e2e')
  })

  it('should draw slot buckets with fillRect and strokeRect for each slot', () => {
    const state: HashState = {
      slots: [
        { index: 0, entries: [], status: 'empty' },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Init',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // 5 slots × 1 fillRect each = 5 slot bucket fillRects + 1 background fillRect = 6
    expect(ctx.fillRect).toHaveBeenCalledTimes(6) // 1 bg + 5 slot buckets
    expect(ctx.strokeRect).toHaveBeenCalledTimes(5) // 1 strokeRect per slot
  })

  it('should render slot index labels as [0], [1], etc.', () => {
    const state: HashState = {
      slots: [
        { index: 0, entries: [], status: 'empty' },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Init',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('[0]', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('[1]', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('[2]', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('[3]', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('[4]', expect.any(Number), expect.any(Number))
  })

  it('should draw chained entries with key:value labels', () => {
    const state: HashState = {
      slots: [
        {
          index: 0,
          entries: [
            { key: 'name', value: 1, status: 'default' },
            { key: 'age', value: 2, status: 'default' },
          ],
          status: 'occupied',
        },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Insert',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('name:1', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('age:2', expect.any(Number), expect.any(Number))
    // 1 bg + 5 slot buckets + 2 entry boxes
    expect(ctx.fillRect).toHaveBeenCalledTimes(8)
  })

  it('should use default entry color for default status', () => {
    const state: HashState = {
      slots: [
        {
          index: 0,
          entries: [{ key: 'a', value: 1, status: 'default' }],
          status: 'occupied',
        },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Insert',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // ENTRY_COLORS.dark.default = #89b4fa
    expect(ctx.fillStyleHistory).toContain('#89b4fa')
  })

  it('should use active entry color for active status', () => {
    const state: HashState = {
      slots: [
        {
          index: 0,
          entries: [{ key: 'a', value: 1, status: 'active' }],
          status: 'active',
        },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Search',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // ENTRY_COLORS.dark.active = #f9e2af
    expect(ctx.fillStyleHistory).toContain('#f9e2af')
  })

  it('should use collision entry color for collision status', () => {
    const state: HashState = {
      slots: [
        {
          index: 0,
          entries: [
            { key: 'a', value: 1, status: 'default' },
            { key: 'b', value: 2, status: 'collision' },
          ],
          status: 'occupied',
        },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Insert',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // ENTRY_COLORS.dark.collision = #fab387
    expect(ctx.fillStyleHistory).toContain('#fab387')
  })

  it('should use found entry color for found status', () => {
    const state: HashState = {
      slots: [
        {
          index: 0,
          entries: [{ key: 'x', value: 42, status: 'found' }],
          status: 'occupied',
        },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Search',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // ENTRY_COLORS.dark.found = #a6e3a1
    expect(ctx.fillStyleHistory).toContain('#a6e3a1')
  })

  it('should draw ∅ marker for non-empty slots with no entries', () => {
    const state: HashState = {
      slots: [
        { index: 0, entries: [], status: 'occupied' },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Delete',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // ∅ marker is drawn for slots with status !== "empty" but entries.length === 0
    expect(ctx.fillText).toHaveBeenCalledWith('\u2205', expect.any(Number), expect.any(Number))
  })

  it('should display operation label', () => {
    const state: HashState = {
      slots: [],
      operation: 'Insert key:apple',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith(
      'Operation: Insert key:apple',
      expect.any(Number),
      expect.any(Number)
    )
  })

  it('should draw arrow between chained entries', () => {
    const state: HashState = {
      slots: [
        {
          index: 0,
          entries: [
            { key: 'a', value: 1, status: 'default' },
            { key: 'b', value: 2, status: 'default' },
          ],
          status: 'occupied',
        },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Insert',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Arrow uses beginPath, moveTo, lineTo, stroke, closePath, fill
    expect(ctx.beginPath).toHaveBeenCalled()
    expect(ctx.moveTo).toHaveBeenCalled()
    expect(ctx.lineTo).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled() // arrowhead fill
    // Arrow uses arrowColor = #585b70
    expect(ctx.fillStyleHistory).toContain('#585b70')
    expect(ctx.strokeStyleHistory).toContain('#585b70')
  })

  it('should not draw arrow for single entry (no chaining)', () => {
    const state: HashState = {
      slots: [
        {
          index: 0,
          entries: [{ key: 'a', value: 1, status: 'default' }],
          status: 'occupied',
        },
        { index: 1, entries: [], status: 'empty' },
        { index: 2, entries: [], status: 'empty' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Insert',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Single entry should not trigger arrow drawing (no moveTo/lineTo pairs for arrows)
    // Only slot bucket strokeRect and entry strokeRect are called
    expect(ctx.strokeRect).toHaveBeenCalledTimes(6) // 5 slots + 1 entry box
  })

  it('should use slot bucket colors based on slot status', () => {
    const state: HashState = {
      slots: [
        { index: 0, entries: [], status: 'empty' },
        { index: 1, entries: [{ key: 'a', value: 1, status: 'default' }], status: 'occupied' },
        { index: 2, entries: [], status: 'active' },
        { index: 3, entries: [], status: 'empty' },
        { index: 4, entries: [], status: 'empty' },
      ],
      operation: 'Insert',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Dark theme: slotEmpty=#313244, slotOccupied=#45475a, slotActive=#f9e2af
    expect(ctx.fillStyleHistory).toContain('#313244')
    expect(ctx.fillStyleHistory).toContain('#45475a')
    // slotActive (#f9e2af) is the same as ENTRY_COLORS.dark.active — should still be present
    expect(ctx.fillStyleHistory).toContain('#f9e2af')
  })

  it('should use default theme (dark) when theme not specified', () => {
    const state: HashState = {
      slots: [],
      operation: 'Init',
      size,
    }

    renderHashState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Dark theme canvasBg
    expect(ctx.fillStyleHistory).toContain('#1e1e2e')
  })
})
