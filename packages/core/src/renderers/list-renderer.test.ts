import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderListState } from './list-renderer.js'
import type { ListState } from '../types.js'

// Mock CanvasRenderingContext2D that tracks all fillStyle assignments
const createMockContext = () => {
  const fillStyleHistory: string[] = []
  
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    font: '',
    textAlign: '',
    textBaseline: '',
    lineWidth: 0,
    strokeStyle: '',
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

describe('renderListState', () => {
  let ctx: ReturnType<typeof createMockContext>
  const width = 800
  const height = 400

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('should clear canvas before drawing', () => {
    const state: ListState = {
      nodes: [{ id: '1', value: 10, status: 'default' }],
      operation: 'Insert',
      orientation: 'horizontal',
    }

    renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height)
  })

  it('should fill background', () => {
    const state: ListState = {
      nodes: [{ id: '1', value: 10, status: 'default' }],
      operation: 'Insert',
      orientation: 'horizontal',
    }

    renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Background: fillRect(0, 0, w, h)
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, width, height)
  })

  it('should display operation label', () => {
    const state: ListState = {
      nodes: [{ id: '1', value: 10, status: 'default' }],
      operation: 'Push',
      orientation: 'horizontal',
    }

    renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('Operation: Push', expect.any(Number), expect.any(Number))
  })

  it('should draw "(empty)" text for empty list', () => {
    const state: ListState = {
      nodes: [],
      operation: 'Init',
      orientation: 'horizontal',
    }

    renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('(empty)', width / 2, height / 2)
    // Should NOT draw any nodes
    expect(ctx.arc).not.toHaveBeenCalled()
    expect(ctx.moveTo).not.toHaveBeenCalled()
  })

  it('should use default color for default status nodes', () => {
    const state: ListState = {
      nodes: [{ id: '1', value: 5, status: 'default' }],
      operation: 'Init',
      orientation: 'horizontal',
    }

    renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Dark theme default color is #89b4fa
    expect(ctx.fillStyleHistory).toContain('#89b4fa')
  })

  it('should use active color for active status nodes', () => {
    const state: ListState = {
      nodes: [{ id: '1', value: 5, status: 'active' }],
      operation: 'Traverse',
      orientation: 'horizontal',
    }

    renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Dark theme active color is #f9e2af
    expect(ctx.fillStyleHistory).toContain('#f9e2af')
  })

  it('should use highlighted color for highlighted status nodes', () => {
    const state: ListState = {
      nodes: [{ id: '1', value: 5, status: 'highlighted' }],
      operation: 'Search',
      orientation: 'horizontal',
    }

    renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Dark theme highlighted color is #fab387
    expect(ctx.fillStyleHistory).toContain('#fab387')
  })

  it('should use found color for found status nodes', () => {
    const state: ListState = {
      nodes: [{ id: '1', value: 5, status: 'found' }],
      operation: 'Search',
      orientation: 'horizontal',
    }

    renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Dark theme found color is #a6e3a1
    expect(ctx.fillStyleHistory).toContain('#a6e3a1')
  })

  describe('horizontal layout (linked list)', () => {
    it('should draw circles using arc for each node', () => {
      const state: ListState = {
        nodes: [
          { id: '1', value: 10, status: 'default' },
          { id: '2', value: 20, status: 'default' },
        ],
        operation: 'Traverse',
        orientation: 'horizontal',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      // Each node draws one arc for the circle
      expect(ctx.arc).toHaveBeenCalledTimes(2)
      expect(ctx.arc).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        24, // nodeRadius
        0,
        Math.PI * 2
      )
    })

    it('should draw arrows between nodes', () => {
      const state: ListState = {
        nodes: [
          { id: '1', value: 10, status: 'default' },
          { id: '2', value: 20, status: 'default' },
        ],
        operation: 'Traverse',
        orientation: 'horizontal',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      // Arrow line: moveTo + lineTo for shaft
      // Arrowhead: moveTo + lineTo + lineTo for triangle
      // One arrow between 2 nodes
      const moveToCalls = ctx.moveTo.mock.calls
      const lineToCalls = ctx.lineTo.mock.calls
      // At least 2 moveTo (arrow shaft start, arrowhead start)
      expect(moveToCalls.length).toBeGreaterThanOrEqual(2)
      // At least 3 lineTo (shaft end, arrowhead point 1, arrowhead point 2)
      expect(lineToCalls.length).toBeGreaterThanOrEqual(3)
    })

    it('should draw index labels below nodes', () => {
      const state: ListState = {
        nodes: [
          { id: '1', value: 10, status: 'default' },
          { id: '2', value: 20, status: 'default' },
          { id: '3', value: 30, status: 'default' },
        ],
        operation: 'Traverse',
        orientation: 'horizontal',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      expect(ctx.fillText).toHaveBeenCalledWith('0', expect.any(Number), expect.any(Number))
      expect(ctx.fillText).toHaveBeenCalledWith('1', expect.any(Number), expect.any(Number))
      expect(ctx.fillText).toHaveBeenCalledWith('2', expect.any(Number), expect.any(Number))
    })

    it('should draw value labels inside nodes', () => {
      const state: ListState = {
        nodes: [
          { id: '1', value: 42, status: 'default' },
          { id: '2', value: 17, status: 'default' },
        ],
        operation: 'Insert',
        orientation: 'horizontal',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      expect(ctx.fillText).toHaveBeenCalledWith('42', expect.any(Number), expect.any(Number))
      expect(ctx.fillText).toHaveBeenCalledWith('17', expect.any(Number), expect.any(Number))
    })

    it('should not draw arrows when there is only one node', () => {
      const state: ListState = {
        nodes: [{ id: '1', value: 10, status: 'default' }],
        operation: 'Init',
        orientation: 'horizontal',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      // No arrows: moveTo should not be called for arrow drawing
      // (only the circle arc is drawn, no line segments)
      expect(ctx.moveTo).not.toHaveBeenCalled()
      expect(ctx.lineTo).not.toHaveBeenCalled()
    })
  })

  describe('vertical layout (stack)', () => {
    it('should not use arc for nodes (uses rounded rect path)', () => {
      const state: ListState = {
        nodes: [
          { id: '1', value: 10, status: 'default' },
          { id: '2', value: 20, status: 'default' },
        ],
        operation: 'Push',
        orientation: 'vertical',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      // Vertical layout uses moveTo/lineTo/quadraticCurveTo, not arc
      expect(ctx.arc).not.toHaveBeenCalled()
      expect(ctx.moveTo).toHaveBeenCalled()
      expect(ctx.quadraticCurveTo).toHaveBeenCalled()
    })

    it('should draw rounded rect path for each node', () => {
      const state: ListState = {
        nodes: [
          { id: '1', value: 10, status: 'default' },
          { id: '2', value: 20, status: 'default' },
          { id: '3', value: 30, status: 'default' },
        ],
        operation: 'Push',
        orientation: 'vertical',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      // Each node: 1 moveTo + 2 lineTo (top edge) + 4 quadraticCurveTo (corners) + 2 lineTo (left edge)
      // For 3 nodes: 3 * (1 moveTo + 4 quadraticCurveTo)
      expect(ctx.moveTo).toHaveBeenCalledTimes(3)
      expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(12) // 4 corners * 3 nodes
    })

    it('should draw value labels inside nodes', () => {
      const state: ListState = {
        nodes: [
          { id: '1', value: 100, status: 'default' },
          { id: '2', value: 200, status: 'default' },
        ],
        operation: 'Push',
        orientation: 'vertical',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      expect(ctx.fillText).toHaveBeenCalledWith('100', expect.any(Number), expect.any(Number))
      expect(ctx.fillText).toHaveBeenCalledWith('200', expect.any(Number), expect.any(Number))
    })

    it('should not draw index labels', () => {
      const state: ListState = {
        nodes: [
          { id: '1', value: 10, status: 'default' },
          { id: '2', value: 20, status: 'default' },
        ],
        operation: 'Push',
        orientation: 'vertical',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      // Vertical should NOT have index labels ('0', '1')
      // Only operation label and value labels
      const fillTextCalls = ctx.fillText.mock.calls.map((c: unknown[]) => c[0])
      expect(fillTextCalls).not.toContain('0')
      expect(fillTextCalls).not.toContain('1')
    })

    it('should not draw arrows', () => {
      const state: ListState = {
        nodes: [
          { id: '1', value: 10, status: 'default' },
          { id: '2', value: 20, status: 'default' },
        ],
        operation: 'Push',
        orientation: 'vertical',
      }

      renderListState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
      // No arrow drawing in vertical mode
      const arrowColorSet = ctx.fillStyleHistory.some(
        (c) => c === '#585b70' // dark theme arrowColor
      )
      expect(arrowColorSet).toBe(false)
    })
  })
})
