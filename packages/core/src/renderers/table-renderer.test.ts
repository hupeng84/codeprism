import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderTableState } from './table-renderer.js'
import type { TableState } from '../types.js'

const createMockContext = () => {
  const fillStyleHistory: string[] = []
  const strokeStyleHistory: string[] = []
  const lineWidthHistory: number[] = []

  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 50 }),
    setLineDash: vi.fn(),
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
    get lineWidthHistory() {
      return lineWidthHistory
    },
    get fillStyleHistory() {
      return fillStyleHistory
    },
    get strokeStyleHistory() {
      return strokeStyleHistory
    },
  }
}

describe('renderTableState', () => {
  let ctx: ReturnType<typeof createMockContext>
  const width = 800
  const height = 400

  const baseState: TableState = {
    grid: [
      [0, 0, 0],
      [3, 5, 8],
      [3, 5, 8],
    ],
    rows: 3,
    cols: 3,
    currentCell: null,
    comparingCells: [],
    sortedCells: [],
    rowHeaders: ['', 'item 0', 'item 1'],
    colHeaders: ['0', '1', '2'],
    currentValue: null,
  }

  beforeEach(() => {
    ctx = createMockContext()
  })

  it('should clear canvas before drawing', () => {
    renderTableState(ctx as unknown as CanvasRenderingContext2D, baseState, width, height)
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height)
  })

  it('should draw grid with proper dimensions (4x4 total including headers)', () => {
    renderTableState(ctx as unknown as CanvasRenderingContext2D, baseState, width, height)

    // 4 column headers + 3 row headers + 9 data cells + 3 legend color swatches = 19 fillRect
    expect(ctx.fillRect).toHaveBeenCalledTimes(19)

    // 4 column header borders + 3 row header borders + 9 data cell borders = 16 strokeRect
    expect(ctx.strokeRect).toHaveBeenCalledTimes(16)
  })

  it('should render column headers in the top row', () => {
    renderTableState(ctx as unknown as CanvasRenderingContext2D, baseState, width, height)

    // Column header texts: "", "0", "1", "2"
    expect(ctx.fillText).toHaveBeenCalledWith('', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('0', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('1', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('2', expect.any(Number), expect.any(Number))
  })

  it('should render row headers in the leftmost column', () => {
    renderTableState(ctx as unknown as CanvasRenderingContext2D, baseState, width, height)

    // Row header texts: "", "item 0", "item 1"
    expect(ctx.fillText).toHaveBeenCalledWith('', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('item 0', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('item 1', expect.any(Number), expect.any(Number))
  })

  it('should render data cell values as text', () => {
    renderTableState(ctx as unknown as CanvasRenderingContext2D, baseState, width, height)

    // Grid values: 0,0,0,3,5,8,3,5,8
    expect(ctx.fillText).toHaveBeenCalledWith('0', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('3', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('5', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('8', expect.any(Number), expect.any(Number))
  })

  it('should highlight current cell with red border', () => {
    const state: TableState = {
      ...baseState,
      currentCell: [1, 1],
    }

    renderTableState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Current border color #FF6B6B should appear in strokeStyle history
    expect(ctx.strokeStyleHistory).toContain('#FF6B6B')
    // Current fill color should appear in fillStyle history
    expect(ctx.fillStyleHistory).toContain('rgba(255,107,107,0.2)')
    // An extra strokeRect call for the current cell highlight (inset by 1)
    expect(ctx.strokeRect).toHaveBeenCalled()
  })

  it('should fill comparing cells with comparing color', () => {
    const state: TableState = {
      ...baseState,
      currentCell: [2, 2],
      comparingCells: [[0, 1], [2, 0]],
    }

    renderTableState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Comparing fill color should appear
    expect(ctx.fillStyleHistory).toContain('rgba(255,217,61,0.15)')
  })

  it('should fill sorted cells with sorted color', () => {
    const state: TableState = {
      ...baseState,
      sortedCells: [[0, 0], [0, 1], [0, 2]],
    }

    renderTableState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // Sorted fill color should appear
    expect(ctx.fillStyleHistory).toContain('rgba(78,205,196,0.15)')
  })

  it('should draw dashed arrow lines from comparing cells to current cell', () => {
    const state: TableState = {
      ...baseState,
      currentCell: [2, 2],
      comparingCells: [[0, 1], [1, 0]],
    }

    renderTableState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // setLineDash called twice: once to set [4,3], once to clear []
    expect(ctx.setLineDash).toHaveBeenCalledWith([4, 3])
    expect(ctx.setLineDash).toHaveBeenCalledWith([])

    // beginPath called for each arrow line (2 comparing cells)
    expect(ctx.beginPath).toHaveBeenCalledTimes(2)
    expect(ctx.moveTo).toHaveBeenCalledTimes(2)
    expect(ctx.lineTo).toHaveBeenCalledTimes(2)
    expect(ctx.stroke).toHaveBeenCalledTimes(2)
  })

it('should draw legend items (Current, Reading, Done)', () => {
  renderTableState(ctx as unknown as CanvasRenderingContext2D, baseState, width, height)

  // Legend items are drawn right-to-left, so order is: Done, Reading, Current
  expect(ctx.fillText).toHaveBeenCalledWith('Done', expect.any(Number), expect.any(Number))
  expect(ctx.fillText).toHaveBeenCalledWith('Reading', expect.any(Number), expect.any(Number))
  expect(ctx.fillText).toHaveBeenCalledWith('Current', expect.any(Number), expect.any(Number))

  // Legend color swatches (3 fillRect for legend)
  expect(ctx.fillRect).toHaveBeenCalledTimes(19) // 4 header + 3 row header + 9 data + 3 legend
})

  it('should use ctx.measureText for legend spacing', () => {
    renderTableState(ctx as unknown as CanvasRenderingContext2D, baseState, width, height)

    // measureText called for each legend item (3 times)
    expect(ctx.measureText).toHaveBeenCalledTimes(3)
  })

  it('should work with light theme', () => {
    renderTableState(ctx as unknown as CanvasRenderingContext2D, baseState, width, height, 'light')

    // Light theme should still clear and draw
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height)
    expect(ctx.fillRect).toHaveBeenCalled()
    expect(ctx.strokeRect).toHaveBeenCalled()
    expect(ctx.fillText).toHaveBeenCalled()
  })

  it('should not draw arrows when there is no current cell', () => {
    const state: TableState = {
      ...baseState,
      currentCell: null,
      comparingCells: [[0, 1]],
    }

    renderTableState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    // No arrows drawn, so setLineDash should not be called
    expect(ctx.setLineDash).not.toHaveBeenCalled()
  })

  it('should not draw arrows when comparingCells is empty', () => {
    const state: TableState = {
      ...baseState,
      currentCell: [1, 1],
      comparingCells: [],
    }

    renderTableState(ctx as unknown as CanvasRenderingContext2D, state, width, height)

    expect(ctx.setLineDash).not.toHaveBeenCalled()
  })
})
