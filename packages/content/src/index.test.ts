import { describe, it, expect } from 'vitest'
import {
  algorithms,
  searches,
  graphs,
  patterns,
  structures,
  getAlgorithm,
  getSearch,
  getGraph,
  getPattern,
  getStructure,
  getContent,
  getAllAlgorithms,
  getAllSearches,
  getAllGraphs,
  getAllPatterns,
  getAllStructures,
  isAlgorithmContent,
  isPatternContent,
  isStructureContent,
  isSearchContent,
  isGraphContent,
  getContentFrames,
  getContentCodeLines,
} from './index.js'

describe('Content Registry', () => {
  describe('Algorithms', () => {
    it('should have 21 algorithms (13 sort + 8 DP/fundamental)', () => {
      expect(Object.keys(algorithms)).toHaveLength(21)
    })

    it('should return algorithm by slug', () => {
      const bubble = getAlgorithm('bubble-sort')
      expect(bubble).toBeDefined()
      expect(bubble?.titleKey).toBe('content.algorithms.bubble-sort.title')
      expect(bubble?.category).toBe('algorithm')
    })

    it('should return undefined for invalid slug', () => {
      expect(getAlgorithm('invalid')).toBeUndefined()
    })

    it('should have generator function for each algorithm', () => {
      Object.values(algorithms).forEach(algo => {
        expect(typeof algo.generator).toBe('function')
      })
    })

    it('should generate frames from algorithm generator', () => {
      const bubble = getAlgorithm('bubble-sort')!
      const gen = bubble.generator([3, 1, 2])
      const frames = Array.from(gen)
      expect(frames.length).toBeGreaterThan(0)
      expect(frames[0].state).toHaveProperty('array')
    })
  })

  describe('Searches', () => {
    it('should have 7 search algorithms', () => {
      expect(Object.keys(searches)).toHaveLength(7)
    })

    it('should return search by slug', () => {
      const binary = getSearch('binary-search')
      expect(binary).toBeDefined()
      expect(binary?.category).toBe('search')
    })

    it('should generate frames from search generator', () => {
      const binary = getSearch('binary-search')!
      const gen = binary.generator([1, 2, 3, 4, 5])
      const frames = Array.from(gen)
      expect(frames.length).toBeGreaterThan(0)
    })
  })

  describe('Graphs', () => {
    it('should have 9 graph algorithms', () => {
      expect(Object.keys(graphs)).toHaveLength(9)
    })

    it('should return graph by slug', () => {
      const dfs = getGraph('dfs')
      expect(dfs).toBeDefined()
      expect(dfs?.category).toBe('graph')
    })
  })

  describe('Patterns', () => {
    it('should have 23 design patterns', () => {
      expect(Object.keys(patterns)).toHaveLength(23)
    })

    it('should return pattern by slug', () => {
      const observer = getPattern('observer')
      expect(observer).toBeDefined()
      expect(observer?.category).toBe('pattern')
    })
  })

  describe('Structures', () => {
    it('should have 16 data structures', () => {
      expect(Object.keys(structures)).toHaveLength(16)
    })

    it('should return structure by slug', () => {
      const bst = getStructure('bst')
      expect(bst).toBeDefined()
      expect(bst?.category).toBe('structure')
    })
  })

  describe('Unified Lookup', () => {
    it('should get content by category and slug', () => {
      expect(getContent('algorithm', 'bubble-sort')).toBeDefined()
      expect(getContent('search', 'binary-search')).toBeDefined()
      expect(getContent('graph', 'dfs')).toBeDefined()
      expect(getContent('pattern', 'observer')).toBeDefined()
      expect(getContent('structure', 'bst')).toBeDefined()
    })

    it('should return undefined for invalid category', () => {
      expect(getContent('invalid', 'bubble-sort')).toBeUndefined()
    })
  })

  describe('Type Guards', () => {
    it('should identify algorithm content', () => {
      const algo = getAlgorithm('bubble-sort')!
      expect(isAlgorithmContent(algo)).toBe(true)
    })

    it('should identify pattern content', () => {
      const pattern = getPattern('observer')!
      expect(isPatternContent(pattern)).toBe(true)
    })

    it('should identify structure content', () => {
      const structure = getStructure('bst')!
      expect(isStructureContent(structure)).toBe(true)
    })

    it('should identify search content', () => {
      const search = getSearch('binary-search')!
      expect(isSearchContent(search)).toBe(true)
    })

    it('should identify graph content', () => {
      const graph = getGraph('dfs')!
      expect(isGraphContent(graph)).toBe(true)
    })
  })

  describe('Frame Helpers', () => {
    it('should get frames for algorithm content', () => {
      const algo = getAlgorithm('bubble-sort')!
      const frames = getContentFrames(algo)
      expect(frames.length).toBeGreaterThan(0)
    })

    it('should get frames for pattern content', () => {
      const pattern = getPattern('observer')!
      const frames = getContentFrames(pattern)
      expect(frames.length).toBeGreaterThan(0)
    })

    it('should get code lines for content', () => {
      const algo = getAlgorithm('bubble-sort')!
      const lines = getContentCodeLines(algo)
      expect(lines.length).toBeGreaterThan(0)
      expect(Array.isArray(lines)).toBe(true)
    })
  })

  describe('getAll functions', () => {
    it('getAllAlgorithms returns array', () => {
      const all = getAllAlgorithms()
      expect(Array.isArray(all)).toBe(true)
      expect(all.length).toBe(21)
    })

    it('getAllSearches returns array', () => {
      const all = getAllSearches()
      expect(Array.isArray(all)).toBe(true)
      expect(all.length).toBe(7)
    })

    it('getAllGraphs returns array', () => {
      const all = getAllGraphs()
      expect(Array.isArray(all)).toBe(true)
      expect(all.length).toBe(9)
    })

    it('getAllPatterns returns array', () => {
      const all = getAllPatterns()
      expect(Array.isArray(all)).toBe(true)
      expect(all.length).toBe(23)
    })

    it('getAllStructures returns array', () => {
      const all = getAllStructures()
      expect(Array.isArray(all)).toBe(true)
      expect(all.length).toBe(16)
    })
  })
})
