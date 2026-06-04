import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderInteractionState } from './pattern-renderer.js'
import type { InteractionState } from '../types.js'

// Mock CanvasRenderingContext2D that tracks all drawing calls
const createMockContext = () => {
  const fillStyleHistory: string[] = []
  const strokeStyleHistory: string[] = []
  let _shadowBlur = 0
  const shadowBlurHistory: number[] = []

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
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    stroke: vi.fn(),
    setLineDash: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    get shadowBlur() {
      return _shadowBlur
    },
    set shadowBlur(v: number) {
      _shadowBlur = v
      shadowBlurHistory.push(v)
    },
    get shadowBlurHistory() {
      return shadowBlurHistory
    },
    shadowColor: '',
    get strokeStyle() {
      return strokeStyleHistory[strokeStyleHistory.length - 1] || ''
    },
    set strokeStyle(value: string) {
      strokeStyleHistory.push(value)
    },
    get fillStyle() {
      return fillStyleHistory[fillStyleHistory.length - 1] || ''
    },
    set fillStyle(value: string) {
      fillStyleHistory.push(value)
    },
    get fillStyleHistory() {
      return fillStyleHistory
    },
    get strokeStyleHistory() {
      return strokeStyleHistory
    },
  }
}

describe('renderInteractionState', () => {
  let ctx: ReturnType<typeof createMockContext>
  const width = 800
  const height = 400

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('should clear canvas before drawing', () => {
    const state: InteractionState = {
      objects: [],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height)
  })

  it('should return early when objects array is empty (clearRect still called)', () => {
    const state: InteractionState = {
      objects: [],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.clearRect).toHaveBeenCalled()
    expect(ctx.roundRect).not.toHaveBeenCalled()
  })

  it('should render two objects with a message and draw connection line, arrow, and labels', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'idle' },
        { id: 'obj2', name: 'Observer', type: 'Observer', state: {}, position: { x: 600, y: 100 }, status: 'idle' },
      ],
      messages: [
        { from: 'obj1', to: 'obj2', method: 'attach', args: [], status: 'active' },
      ],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Connection line with quadraticCurveTo
    expect(ctx.quadraticCurveTo).toHaveBeenCalled()
    expect(ctx.moveTo).toHaveBeenCalled()
    expect(ctx.stroke).toHaveBeenCalled()

    // Method label
    expect(ctx.fillText).toHaveBeenCalledWith('attach', expect.any(Number), expect.any(Number))
  })

  it('should render object boxes with roundRect calls', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'idle' },
      ],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.roundRect).toHaveBeenCalled()
    expect(ctx.fill).toHaveBeenCalled()
  })

  it('should render object names and types as fillText', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'idle' },
      ],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Type label and name label
    expect(ctx.fillText).toHaveBeenCalledWith('«Subject»', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Subject', expect.any(Number), expect.any(Number))
  })

  it('should show glow (shadowBlur=20) and accent border for active object status', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'active' },
        { id: 'obj2', name: 'Observer', type: 'ConcreteObserver', state: {}, position: { x: 600, y: 100 }, status: 'idle' },
      ],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Active object gets shadowBlur=20 (strong glow), idle gets shadowBlur=10 (default)
    expect(ctx.shadowBlurHistory).toContain(20)
    expect(ctx.shadowBlurHistory).toContain(10)
    // save/restore wraps the shadow/box drawing
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
    // Active accent color #FF6B6B used for border stroke and name fill
    expect(ctx.strokeStyleHistory).toContain('#FF6B6B')
    expect(ctx.fillStyleHistory).toContain('#FF6B6B')
  })

  it('should show different color for highlighted object status', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'highlighted' },
      ],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Highlighted status uses different fill style
    expect(ctx.fillStyleHistory).toContain('#FFD93D')
  })

  it('should render state string for objects with state properties', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: { observers: 3, ready: true }, position: { x: 200, y: 100 }, status: 'idle' },
      ],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    expect(ctx.fillText).toHaveBeenCalledWith('observers: 3, ready: true', expect.any(Number), expect.any(Number))
  })

  it('should draw active indicator dot (arc) for active objects', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'active' },
        { id: 'obj2', name: 'Observer', type: 'ConcreteObserver', state: {}, position: { x: 600, y: 100 }, status: 'idle' },
      ],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Active indicator is a small filled circle drawn via arc (only for active objects)
    expect(ctx.arc).toHaveBeenCalled()
  })

  it('should draw message arrows between objects (moveTo, quadraticCurveTo, stroke)', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'idle' },
        { id: 'obj2', name: 'Observer', type: 'Observer', state: {}, position: { x: 600, y: 100 }, status: 'idle' },
      ],
      messages: [
        { from: 'obj1', to: 'obj2', method: 'notify', args: [], status: 'active' },
      ],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Message arrow uses moveTo, quadraticCurveTo, and stroke
    const moveToCalls = ctx.moveTo.mock.calls.length
    const quadraticCurveToCalls = ctx.quadraticCurveTo.mock.calls.length
    const strokeCalls = ctx.stroke.mock.calls.length

    expect(moveToCalls).toBeGreaterThan(0)
    expect(quadraticCurveToCalls).toBeGreaterThan(0)
    expect(strokeCalls).toBeGreaterThan(0)
  })

  it('should render method labels on message lines', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'idle' },
        { id: 'obj2', name: 'Observer', type: 'Observer', state: {}, position: { x: 600, y: 100 }, status: 'idle' },
      ],
      messages: [
        { from: 'obj1', to: 'obj2', method: 'update', args: [], status: 'active' },
      ],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('update', expect.any(Number), expect.any(Number))
  })

  it('should draw legend with status and relationship types', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'idle' },
      ],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Legend items: Active, Updated (status), Association, Dependency, Composition, Inheritance (relationships)
    expect(ctx.fillText).toHaveBeenCalledWith('Active', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Updated', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Association', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Dependency', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Composition', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Inheritance', expect.any(Number), expect.any(Number))
  })

  it('should compute positions for objects with x=0,y=0 (no explicit position)', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 0, y: 0 }, status: 'idle' },
        { id: 'obj2', name: 'Observer1', type: 'Observer', state: {}, position: { x: 0, y: 0 }, status: 'idle' },
        { id: 'obj3', name: 'Observer2', type: 'Observer', state: {}, position: { x: 0, y: 0 }, status: 'idle' },
      ],
      messages: [],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Objects should still be rendered even without explicit positions
    // roundRect calls: 3 object boxes + label backgrounds for each connection pair
    expect(ctx.roundRect).toHaveBeenCalled()
    expect(ctx.fillText).toHaveBeenCalledWith('Subject', expect.any(Number), expect.any(Number))
  })

  it('should use dashed line for complete message status', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'idle' },
        { id: 'obj2', name: 'Observer', type: 'Observer', state: {}, position: { x: 600, y: 100 }, status: 'idle' },
      ],
      messages: [
        { from: 'obj1', to: 'obj2', method: 'notify', args: [], status: 'complete' },
      ],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.setLineDash).toHaveBeenCalledWith([3, 3])
  })

  it('should use light theme colors when theme is light', () => {
    const state: InteractionState = {
      objects: [
        { id: 'obj1', name: 'Subject', type: 'Subject', state: {}, position: { x: 200, y: 100 }, status: 'active' },
        { id: 'obj2', name: 'Observer A', type: 'ConcreteObserver', state: {}, position: { x: 600, y: 100 }, status: 'idle' },
      ],
      messages: [
        { from: 'obj1', to: 'obj2', method: 'attach', args: [], status: 'active' },
      ],
    }

    renderInteractionState(ctx as unknown as CanvasRenderingContext2D, state, width, height, 'light')

    // Light theme uses different accent colors from dark
    // Light active = #ef4444 (not #FF6B6B which is dark)
    expect(ctx.fillStyleHistory).toContain('#ef4444')
    // Light arrowActive = #22c55e (green, not #4ECDC4 which is dark teal)
    expect(ctx.strokeStyleHistory).toContain('#22c55e')
  })
})