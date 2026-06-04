import { describe, it, expect } from 'vitest'
import {
  getAllAlgorithms,
  getAllSearches,
  getAlgorithm,
} from './index.js'

/** Assert that `arr` is sorted in ascending order. */
function isSortedAsc(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false
  }
  return true
}

/** A canonical unsorted input used for sort correctness tests. */
const SORT_INPUT = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]

describe('Algorithm Correctness', () => {
  describe('Sorting algorithms produce sorted output', () => {
    for (const algo of getAllAlgorithms()) {
      it(`${algo.slug} sorts a known input ascending`, () => {
        // Skip algorithms whose state shape is not SortState. These are
        // DP/fundamental algorithms (knapsack, lcs, lis, edit-distance,
        // fibonacci, sliding-window, two-pointers, n-queens) which produce
        // different state shapes. We only verify they yield frames below.
        const sortSlugs = new Set([
          'bubble-sort', 'insertion-sort', 'selection-sort', 'shell-sort',
          'counting-sort', 'radix-sort', 'bucket-sort', 'cocktail-sort',
          'comb-sort', 'odd-even-sort', 'quick-sort', 'heap-sort', 'merge-sort',
        ])
        if (!sortSlugs.has(algo.slug)) {
          const frames = Array.from(algo.generator(SORT_INPUT))
          expect(frames.length).toBeGreaterThan(0)
          return
        }

        const frames = Array.from(algo.generator(SORT_INPUT))
        expect(frames.length).toBeGreaterThan(0)

        // The last frame's state should contain the sorted array.
        const lastState = frames[frames.length - 1].state as { array?: number[] }
        expect(lastState.array).toBeDefined()
        expect(isSortedAsc(lastState.array!)).toBe(true)
        // The sorted array must contain every element of the input (permutation).
        expect([...lastState.array!].sort((a, b) => a - b)).toEqual(
          [...SORT_INPUT].sort((a, b) => a - b),
        )
      })
    }
  })

  describe('Sorting algorithms handle edge cases', () => {
    it('empty array produces frames without crashing', () => {
      for (const algo of getAllAlgorithms()) {
        if (!['bubble-sort', 'merge-sort'].includes(algo.slug)) continue
        const frames = Array.from(algo.generator([]))
        expect(frames.length).toBeGreaterThanOrEqual(1)
      }
    })

    it('single-element array terminates', () => {
      for (const slug of ['bubble-sort', 'quick-sort', 'merge-sort']) {
        const algo = getAlgorithm(slug)!
        const frames = Array.from(algo.generator([42]))
        const last = frames[frames.length - 1].state as { array: number[] }
        expect(last.array).toEqual([42])
      }
    })

    it('already-sorted array terminates', () => {
      for (const slug of ['bubble-sort', 'insertion-sort', 'merge-sort']) {
        const algo = getAlgorithm(slug)!
        const frames = Array.from(algo.generator([1, 2, 3, 4, 5]))
        const last = frames[frames.length - 1].state as { array: number[] }
        expect(isSortedAsc(last.array)).toBe(true)
      }
    })

    it('reverse-sorted array terminates', () => {
      for (const slug of ['bubble-sort', 'quick-sort', 'merge-sort']) {
        const algo = getAlgorithm(slug)!
        const frames = Array.from(algo.generator([5, 4, 3, 2, 1]))
        const last = frames[frames.length - 1].state as { array: number[] }
        expect(isSortedAsc(last.array)).toBe(true)
      }
    })
  })

  describe('Search algorithms produce well-formed frames', () => {
    // The search generators pick an internal target for visualization
    // (e.g. arr[mid]+1) rather than searching for a user-supplied value,
    // so we verify the framework rather than a specific found index.
    for (const search of getAllSearches()) {
      it(`${search.slug} yields valid SearchState frames`, () => {
        const frames = Array.from(search.generator([1, 3, 5, 7, 9, 11, 13, 15]))
        expect(frames.length).toBeGreaterThan(0)

        for (const frame of frames) {
          const state = frame.state as {
            array?: number[];
            range?: [number, number];
            mid?: number;
            found?: number;
          }
          // Each frame must have a valid array, range, mid, found.
          expect(state.array).toBeDefined()
          expect(state.range).toBeDefined()
          expect(typeof state.mid).toBe('number')
          expect(typeof state.found).toBe('number')
          // The array in each frame must remain sorted (algorithms sort on entry).
          expect(isSortedAsc(state.array!)).toBe(true)
          // range must be a valid sub-range of the array.
          const [lo, hi] = state.range!
          expect(lo).toBeGreaterThanOrEqual(0)
          expect(hi).toBeLessThan(state.array!.length)
          expect(lo).toBeLessThanOrEqual(hi + 1)
        }
      })
    }

    for (const search of getAllSearches()) {
      it(`${search.slug} final state has a coherent found index`, () => {
        const frames = Array.from(search.generator([2, 4, 6, 8, 10, 12, 14]))
        const last = frames[frames.length - 1].state as {
          array: number[];
          found: number;
        }
        // found is either -1 (miss) or a valid index in array.
        if (last.found === -1) {
          expect(last.found).toBe(-1)
        } else {
          expect(last.found).toBeGreaterThanOrEqual(0)
          expect(last.found).toBeLessThan(last.array.length)
        }
      })
    }
  })

  describe('DP / non-array algorithms yield frames', () => {
    // For these algorithms the state shape isn't SortState/SearchState.
    // We only verify the generator is well-formed and produces frames.
    for (const slug of [
      'fibonacci', 'knapsack', 'lcs', 'lis', 'edit-distance',
      'sliding-window', 'two-pointers', 'n-queens',
    ]) {
      it(`${slug} generator runs without error and produces frames`, () => {
        const algo = getAlgorithm(slug)!
        const frames = Array.from(algo.generator([1, 2, 3, 4, 5]))
        expect(frames.length).toBeGreaterThan(0)
        for (const f of frames) {
          expect(f).toHaveProperty('step')
          expect(f).toHaveProperty('state')
          expect(f).toHaveProperty('highlightLine')
        }
      })
    }
  })
})
