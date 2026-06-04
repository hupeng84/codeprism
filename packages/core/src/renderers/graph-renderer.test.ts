import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderGraphState } from './graph-renderer.js'
import type { GraphState, GraphNode, GraphEdge } from '../types.js'

// Mock CanvasRenderingContext2D that tracks all property assignments via history arrays
const createMockContext = () => {
  const fillStyleHistory: string[] = []
  const strokeStyleHistory: string[] = []
  const lineWidthHistory: number[] = []
  const fontHistory: string[] = []

  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    save: vi.fn(),
    restore: vi.fn(),

    // Tracked font (last value)
    get font() {
      return fontHistory[fontHistory.length - 1] || ''
    },
    set font(value: string) {
      fontHistory.push(value)
    },
    get fontHistory() {
      return fontHistory
    },

    textAlign: '',
    textBaseline: '',

    // Tracked lineWidth (last value)
    get lineWidth() {
      return lineWidthHistory[lineWidthHistory.length - 1] || 0
    },
    set lineWidth(value: number) {
      lineWidthHistory.push(value)
    },
    get lineWidthHistory() {
      return lineWidthHistory
    },

    // Tracked strokeStyle (last value)
    get strokeStyle() {
      return strokeStyleHistory[strokeStyleHistory.length - 1] || ''
    },
    set strokeStyle(value: string) {
      strokeStyleHistory.push(value)
    },
    get strokeStyleHistory() {
      return strokeStyleHistory
    },

    shadowColor: '',
    shadowBlur: 0,

    // Tracked fillStyle (last value)
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

describe('renderGraphState', () => {
  let ctx: ReturnType<typeof createMockContext>
  const width = 800
  const height = 400

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('should clear canvas before drawing', () => {
    const state: GraphState = {
      nodes: [],
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height)
  })

  it('should draw "(Empty Graph)" text when graph is empty', () => {
    const state: GraphState = {
      nodes: [],
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('(Empty Graph)', width / 2, height / 2)
    expect(ctx.fontHistory).toContain('14px DM Sans, sans-serif')
    expect(ctx.textAlign).toBe('center')
  })

  it('should draw a single node with default status colors', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'default' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Circle arc: 0, Math.PI * 2
    expect(ctx.arc).toHaveBeenCalledWith(200, 200, 22, 0, Math.PI * 2)
    // Default node fill color
    expect(ctx.fillStyleHistory).toContain('rgba(255,255,255,0.06)')
    // Default stroke color (used as fillStyle for legend dots too)
    expect(ctx.fillStyleHistory).toContain('rgba(255,255,255,0.2)')
  })

  it('should draw node label with fillText', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'default' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('A', 200, 200)
  })

  it('should apply visiting status colors to node', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'visiting' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Visiting fill color
    expect(ctx.fillStyleHistory).toContain('rgba(255,217,61,0.2)')
    // Visiting stroke color (via fillStyle for glow + legend dot)
    expect(ctx.fillStyleHistory).toContain('#FFD93D')
    // Visiting text color
    expect(ctx.fillStyleHistory).toContain('#FFD93D')
  })

  it('should apply visited status colors to node', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'visited' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillStyleHistory).toContain('rgba(78,205,196,0.15)')
    expect(ctx.fillStyleHistory).toContain('#4ECDC4')
  })

  it('should apply found status colors to node', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'found' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // found fill
    expect(ctx.fillStyleHistory).toContain('rgba(78,205,196,0.25)')
    // found stroke
    expect(ctx.fillStyleHistory).toContain('#4ECDC4')
    // found text color
    expect(ctx.fillStyleHistory).toContain('#fff')
  })

  it('should apply current status colors to node', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'current' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // current fill
    expect(ctx.fillStyleHistory).toContain('rgba(255,107,107,0.2)')
    // current stroke
    expect(ctx.fillStyleHistory).toContain('#FF6B6B')
    // current text color
    expect(ctx.fillStyleHistory).toContain('#FF6B6B')
  })

  it('should not draw glow for default-status nodes', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'default' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // save/restore should not be called for default nodes (no glow)
    expect(ctx.save).not.toHaveBeenCalled()
    expect(ctx.restore).not.toHaveBeenCalled()
    expect(ctx.shadowBlur).toBe(0)
  })

  it('should draw glow effect (shadowBlur=15) for non-default nodes', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'visiting' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // save/restore bracket the glow arc
    expect(ctx.save).toHaveBeenCalled()
    expect(ctx.restore).toHaveBeenCalled()
    expect(ctx.shadowBlur).toBe(15)
    expect(ctx.shadowColor).toBe('#FFD93D')
  })

  it('should draw edges between connected nodes', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 100, y: 200, status: 'default' },
      { id: 'b', label: 'B', value: 2, x: 400, y: 200, status: 'default' },
    ]
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', status: 'default' },
    ]
    const state: GraphState = {
      nodes,
      edges,
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Edge line from a to b
    expect(ctx.moveTo).toHaveBeenCalledWith(100, 200)
    expect(ctx.lineTo).toHaveBeenCalledWith(400, 200)
    // Default edge color set via strokeStyle
    expect(ctx.strokeStyleHistory).toContain('rgba(255,255,255,0.1)')
    // Default edge lineWidth=1.5 appears in history
    expect(ctx.lineWidthHistory).toContain(1.5)
  })

  it('should draw arrow heads on edges', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 100, y: 200, status: 'default' },
      { id: 'b', label: 'B', value: 2, x: 400, y: 200, status: 'default' },
    ]
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', status: 'default' },
    ]
    const state: GraphState = {
      nodes,
      edges,
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // Arrow head is drawn with additional moveTo/lineTo pairs
    // Total moveTo calls: 1 (edge start) + 2 (arrow head) = 3 minimum
    expect(ctx.moveTo).toHaveBeenCalledTimes(3)
    // Arrow lineWidth=2 appears in history
    expect(ctx.lineWidthHistory).toContain(2)
  })

  it('should apply traversing color to edge via strokeStyle', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 100, y: 200, status: 'default' },
      { id: 'b', label: 'B', value: 2, x: 400, y: 200, status: 'default' },
    ]
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', status: 'traversing' },
    ]
    const state: GraphState = {
      nodes,
      edges,
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.strokeStyleHistory).toContain('#FFD93D')
    // Non-default edge lineWidth=3 appears in history
    expect(ctx.lineWidthHistory).toContain(3)
  })

  it('should apply traversed color to edge via strokeStyle', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 100, y: 200, status: 'default' },
      { id: 'b', label: 'B', value: 2, x: 400, y: 200, status: 'default' },
    ]
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', status: 'traversed' },
    ]
    const state: GraphState = {
      nodes,
      edges,
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.strokeStyleHistory).toContain('#4ECDC4')
  })

  it('should apply highlighted color to edge via strokeStyle', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 100, y: 200, status: 'default' },
      { id: 'b', label: 'B', value: 2, x: 400, y: 200, status: 'default' },
    ]
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', status: 'highlighted' },
    ]
    const state: GraphState = {
      nodes,
      edges,
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.strokeStyleHistory).toContain('#FF6B6B')
  })

  it('should skip edges with missing from/to nodes', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 100, y: 200, status: 'default' },
    ]
    const edges: GraphEdge[] = [
      { from: 'a', to: 'nonexistent', status: 'default' },
    ]
    const state: GraphState = {
      nodes,
      edges,
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    // No edge moveTo since 'nonexistent' node not found
    expect(ctx.moveTo).not.toHaveBeenCalledWith(100, 200)
  })

  it('should display operation label text', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'default' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: 'DFS Traversal',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('DFS Traversal', 14, 22)
    // Operation label sets 12px font (check it appears in history, even if legend later overwrites)
    expect(ctx.fontHistory).toContain('12px DM Sans, sans-serif')
    expect(ctx.textAlign).toBe('left')
  })

  it('should render legend items', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'default' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Legend has 4 items, each draws an arc (circle dot) and fillText
expect(ctx.fillText).toHaveBeenCalledWith('Default', expect.any(Number), expect.any(Number))
  expect(ctx.fillText).toHaveBeenCalledWith('Visiting', expect.any(Number), expect.any(Number))
  expect(ctx.fillText).toHaveBeenCalledWith('Visited', expect.any(Number), expect.any(Number))
  expect(ctx.fillText).toHaveBeenCalledWith('Current', expect.any(Number), expect.any(Number))

    // measureText is called for each legend item to compute layout
    expect(ctx.measureText).toHaveBeenCalled()
  })

  it('should draw legend circle dots with correct colors', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'default' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Legend dot colors come from nodeColors stroke values, set via fillStyle
    // default stroke: rgba(255,255,255,0.2)
    // visiting stroke: #FFD93D
    // visited stroke: #4ECDC4
    // current stroke: #FF6B6B
    expect(ctx.fillStyleHistory).toContain('rgba(255,255,255,0.2)')
    expect(ctx.fillStyleHistory).toContain('#FFD93D')
    expect(ctx.fillStyleHistory).toContain('#4ECDC4')
    expect(ctx.fillStyleHistory).toContain('#FF6B6B')
  })

  it('should use light theme colors when theme="light"', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 200, y: 200, status: 'visiting' },
    ]
    const state: GraphState = {
      nodes,
      edges: [],
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height, 'light')

    // Light visiting fill color
    expect(ctx.fillStyleHistory).toContain('rgba(245,158,11,0.15)')
    // Light visiting stroke color
    expect(ctx.fillStyleHistory).toContain('#f59e0b')
  })

  it('should use light theme edge colors via strokeStyle', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 100, y: 200, status: 'default' },
      { id: 'b', label: 'B', value: 2, x: 400, y: 200, status: 'default' },
    ]
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', status: 'traversing' },
    ]
    const state: GraphState = {
      nodes,
      edges,
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height, 'light')

    // Light traversing edge color via strokeStyle
    expect(ctx.strokeStyleHistory).toContain('#f59e0b')
  })

  it('should draw multiple nodes and edges', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 100, y: 100, status: 'default' },
      { id: 'b', label: 'B', value: 2, x: 300, y: 100, status: 'visiting' },
      { id: 'c', label: 'C', value: 3, x: 200, y: 300, status: 'visited' },
    ]
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', status: 'default' },
      { from: 'b', to: 'c', status: 'traversing' },
    ]
    const state: GraphState = {
      nodes,
      edges,
      visitedOrder: ['a', 'b'],
      operation: 'BFS Traversal',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Arc calls: 1 (default circle) + 2 (visiting glow+circle) + 2 (visited glow+circle) + 4 (legend dots) = 9
    expect(ctx.arc).toHaveBeenCalledTimes(9)
    // fillText: 3 node labels + 4 legend labels + 1 operation = 8
    expect(ctx.fillText).toHaveBeenCalledTimes(8)
    // Operation text
    expect(ctx.fillText).toHaveBeenCalledWith('BFS Traversal', 14, 22)
  })

  it('should draw edges with arrow heads for all status types', () => {
    const nodes: GraphNode[] = [
      { id: 'a', label: 'A', value: 1, x: 100, y: 200, status: 'default' },
      { id: 'b', label: 'B', value: 2, x: 400, y: 200, status: 'default' },
      { id: 'c', label: 'C', value: 3, x: 250, y: 50, status: 'default' },
      { id: 'd', label: 'D', value: 4, x: 250, y: 350, status: 'default' },
    ]
    const edges: GraphEdge[] = [
      { from: 'a', to: 'b', status: 'default' },
      { from: 'b', to: 'c', status: 'traversing' },
      { from: 'c', to: 'd', status: 'traversed' },
      { from: 'd', to: 'a', status: 'highlighted' },
    ]
    const state: GraphState = {
      nodes,
      edges,
      visitedOrder: [],
      operation: '',
    }

    renderGraphState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // 4 edges: each draws 1 moveTo (line start) + 2 moveTo (arrow) = 3 moveTo each
    expect(ctx.moveTo).toHaveBeenCalledTimes(12)
    // 4 edges: each draws 1 lineTo (line end) + 2 lineTo (arrow head lines) = 3 lineTo each
    expect(ctx.lineTo).toHaveBeenCalledTimes(12)
  })
})
