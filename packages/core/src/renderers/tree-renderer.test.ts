import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderTreeState } from './tree-renderer.js'
import type { TreeState, TreeNode } from '../types.js'

// Mock CanvasRenderingContext2D that tracks all fillStyle and strokeStyle assignments
const createMockContext = () => {
  const fillStyleHistory: string[] = []
  const strokeStyleHistory: string[] = []

  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
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
    get fillStyleHistory() {
      return fillStyleHistory
    },
    get strokeStyle() {
      return strokeStyleHistory[strokeStyleHistory.length - 1] || ''
    },
    set strokeStyle(value: string) {
      strokeStyleHistory.push(value)
    },
    get strokeStyleHistory() {
      return strokeStyleHistory
    },
  }
}

/** Helper to build a simple TreeNode */
function makeNode(
  id: string,
  value: number,
  status: TreeNode['status'] = 'default',
  left: TreeNode | null = null,
  right: TreeNode | null = null,
): TreeNode {
  return { id, value, x: 0, y: 0, left, right, status }
}

describe('renderTreeState', () => {
  let ctx: ReturnType<typeof createMockContext>
  const width = 800
  const height = 400

  beforeEach(() => {
    ctx = createMockContext()
  })

  // ── Canvas clearing ──────────────────────────────────────────────

  it('should clear canvas before drawing', () => {
    const state: TreeState = { root: null, operation: '' }
    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height)
  })

  // ── Empty tree ───────────────────────────────────────────────────

  it('should draw "(Empty Tree)" text when root is null', () => {
    const state: TreeState = { root: null, operation: '' }
    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.fillText).toHaveBeenCalledWith('(Empty Tree)', width / 2, height / 2)
  })

  // ── Edges between parent-child nodes ─────────────────────────────

  it('should draw edges between parent and children', () => {
    const right = makeNode('n2', 20)
    const left = makeNode('n1', 5)
    const root = makeNode('root', 10, 'default', left, right)
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // One edge to left child + one edge to right child = 2 moveTo + 2 lineTo + 2 stroke
    expect(ctx.moveTo).toHaveBeenCalledTimes(2)
    expect(ctx.lineTo).toHaveBeenCalledTimes(2)
    expect(ctx.stroke).toHaveBeenCalled()
  })

  // ── Node circles ─────────────────────────────────────────────────

  it('should draw a circle (arc) for each node', () => {
    const left = makeNode('n1', 5)
    const right = makeNode('n2', 20)
    const root = makeNode('root', 10, 'default', left, right)
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // 3 nodes → 3 arc calls
    expect(ctx.arc).toHaveBeenCalledTimes(3)
  })

  it('should call arc with RADIUS=18 and full circle', () => {
    const root = makeNode('r', 42)
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    expect(ctx.arc).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      18,
      0,
      Math.PI * 2,
    )
  })

  // ── Status colors: default ───────────────────────────────────────

  it('should use default node fill color', () => {
    const root = makeNode('r', 1, 'default')
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    expect(ctx.fillStyleHistory).toContain('rgba(255,255,255,0.08)')
  })

  // ── Status colors: visiting ──────────────────────────────────────

  it('should use visiting node stroke color', () => {
    const root = makeNode('r', 1, 'visiting')
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    expect(ctx.strokeStyleHistory).toContain('#FFD93D')
  })

  it('should use inserted node stroke color', () => {
    const state: TreeState = {
      root: {
        id: 'n1', value: 42, x: 200, y: 150, status: 'inserted',
        left: null, right: null,
      },
      operation: 'insert',
    }
    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.strokeStyleHistory).toContain('#4ECDC4')
  })

  // ── Status colors: found ─────────────────────────────────────────

  it('should use found node stroke color', () => {
    const root = makeNode('r', 1, 'found')
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    expect(ctx.strokeStyleHistory).toContain('#4ECDC4')
  })

  it('should use deleted node stroke color', () => {
    const state: TreeState = {
      root: {
        id: 'n1', value: 42, x: 200, y: 150, status: 'deleted',
        left: null, right: null,
      },
      operation: 'delete',
    }
    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)
    expect(ctx.strokeStyleHistory).toContain('#FF6B6B')
  })

  // ── Operation label ──────────────────────────────────────────────

  it('should display the operation label', () => {
    const root = makeNode('r', 10)
    const state: TreeState = { root, operation: 'Find 10' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    expect(ctx.fillText).toHaveBeenCalledWith('Find 10', 14, 22)
  })

  // ── Value labels inside nodes ────────────────────────────────────

  it('should display value labels inside each node', () => {
    const root = makeNode('r', 42, 'default', makeNode('l', 7), makeNode('n', 99))
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    expect(ctx.fillText).toHaveBeenCalledWith('42', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('7', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('99', expect.any(Number), expect.any(Number))
  })

  // ── Light theme support ──────────────────────────────────────────

  it('should use light theme node colors when theme="light"', () => {
    const root = makeNode('r', 1, 'default')
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height, 'light')

    // Light default fill: rgba(0,0,0,0.06)
    expect(ctx.fillStyleHistory).toContain('rgba(0,0,0,0.06)')
  })

  it('should use light theme visiting stroke color', () => {
    const root = makeNode('r', 1, 'visiting')
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height, 'light')

    expect(ctx.strokeStyleHistory).toContain('#f59e0b')
  })

  it('should use light theme deleted stroke color', () => {
    const state: TreeState = {
      root: {
        id: 'n1', value: 42, x: 200, y: 150, status: 'deleted',
        left: null, right: null,
      },
      operation: 'delete',
    }
    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height, 'light')
    expect(ctx.strokeStyleHistory).toContain('#ef4444')
  })

  // ── Single node (no children) ────────────────────────────────────

  it('should draw a single node without edges', () => {
    const root = makeNode('r', 1)
    const state: TreeState = { root, operation: '' }

    renderTreeState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    expect(ctx.arc).toHaveBeenCalledTimes(1)
    expect(ctx.moveTo).not.toHaveBeenCalled()
    expect(ctx.lineTo).not.toHaveBeenCalled()
  })
})
