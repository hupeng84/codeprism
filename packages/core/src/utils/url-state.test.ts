import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  serializePlaybackState,
  deserializePlaybackState,
  updateURLWithState,
  getInitialStateFromURL,
  getViewFromURL,
  getDarkFromURL,
  getInputFromURL,
} from './url-state.js'
import type { PlaybackStatus } from '../types.js'

describe('url-state', () => {
  describe('serializePlaybackState', () => {
    it('should serialize basic state', () => {
      const state = {
        step: 5,
        speed: 1,
        status: 'playing' as PlaybackStatus,
      }
      const result = serializePlaybackState(state)
      expect(result).toContain('step=5')
      expect(result).toContain('speed=1')
      expect(result).toContain('status=playing')
    })

    it('should serialize state with input', () => {
      const state = {
        step: 0,
        speed: 1,
        status: 'idle' as PlaybackStatus,
        input: [3, 1, 2],
      }
      const result = serializePlaybackState(state)
      // URLSearchParams encodes commas as %2C
      expect(result).toContain('input=')
      expect(result).toContain('3')
      expect(result).toContain('1')
      expect(result).toContain('2')
    })

    it('should serialize state with dark mode', () => {
      const state = {
        step: 0,
        speed: 1,
        status: 'idle' as PlaybackStatus,
        dark: false,
      }
      const result = serializePlaybackState(state)
      expect(result).toContain('dark=false')
    })

    it('should serialize state with view mode', () => {
      const state = {
        step: 0,
        speed: 1,
        status: 'idle' as PlaybackStatus,
        view: 'code' as const,
      }
      const result = serializePlaybackState(state)
      expect(result).toContain('view=code')
    })

    it('should serialize all params', () => {
      const state = {
        step: 10,
        speed: 2,
        status: 'paused' as PlaybackStatus,
        input: [1, 2, 3],
        dark: true,
        view: 'runtime' as const,
      }
      const result = serializePlaybackState(state)
      expect(result).toContain('step=10')
      expect(result).toContain('speed=2')
      expect(result).toContain('status=paused')
      expect(result).toContain('input=')
      expect(result).toContain('dark=true')
      expect(result).toContain('view=runtime')
    })
  })

  describe('deserializePlaybackState', () => {
    it('should deserialize valid state', () => {
      const search = 'step=5&speed=1&status=playing'
      const result = deserializePlaybackState(search)
      expect(result).toEqual({
        step: 5,
        speed: 1,
        status: 'playing',
      })
    })

    it('should return null for missing params', () => {
      const search = 'step=5&speed=1'
      const result = deserializePlaybackState(search)
      expect(result).toBeNull()
    })

    it('should return null for invalid step', () => {
      const search = 'step=abc&speed=1&status=playing'
      const result = deserializePlaybackState(search)
      expect(result).toBeNull()
    })

    it('should return null for invalid speed', () => {
      const search = 'step=5&speed=abc&status=playing'
      const result = deserializePlaybackState(search)
      expect(result).toBeNull()
    })

    it('should return null for invalid status', () => {
      const search = 'step=5&speed=1&status=invalid'
      const result = deserializePlaybackState(search)
      expect(result).toBeNull()
    })

    it('should deserialize with input', () => {
      const search = 'step=0&speed=1&status=idle&input=3%2C1%2C2'
      const result = deserializePlaybackState(search)
      expect(result).toEqual({
        step: 0,
        speed: 1,
        status: 'idle',
        input: [3, 1, 2],
      })
    })

    it('should deserialize with dark mode', () => {
      const search = 'step=0&speed=1&status=idle&dark=false'
      const result = deserializePlaybackState(search)
      expect(result).toEqual({
        step: 0,
        speed: 1,
        status: 'idle',
        dark: false,
      })
    })

    it('should deserialize with view mode', () => {
      const search = 'step=0&speed=1&status=idle&view=code'
      const result = deserializePlaybackState(search)
      expect(result).toEqual({
        step: 0,
        speed: 1,
        status: 'idle',
        view: 'code',
      })
    })

    it('should deserialize with all params', () => {
      const search = 'step=10&speed=2&status=paused&input=1%2C2%2C3&dark=true&view=runtime'
      const result = deserializePlaybackState(search)
      expect(result).toEqual({
        step: 10,
        speed: 2,
        status: 'paused',
        input: [1, 2, 3],
        dark: true,
        view: 'runtime',
      })
    })

    it('should handle invalid input gracefully', () => {
      const search = 'step=0&speed=1&status=idle&input=abc%2Cdef'
      const result = deserializePlaybackState(search)
      expect(result).toEqual({
        step: 0,
        speed: 1,
        status: 'idle',
      })
    })

    it('should handle invalid view gracefully', () => {
      const search = 'step=0&speed=1&status=idle&view=invalid'
      const result = deserializePlaybackState(search)
      expect(result).toEqual({
        step: 0,
        speed: 1,
        status: 'idle',
      })
    })
  })

  describe('updateURLWithState', () => {
    let replaceStateSpy: ReturnType<typeof vi.fn>

    beforeEach(() => {
      replaceStateSpy = vi.fn()
      
      // Use vi.stubGlobal to mock window
      vi.stubGlobal('window', {
        location: {
          href: 'http://localhost:3000/visualizer/algorithm/bubble-sort?old=value',
        },
        history: {
          replaceState: replaceStateSpy,
        },
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('should update URL with state', () => {
      const state = {
        step: 5,
        speed: 1,
        status: 'playing' as PlaybackStatus,
      }
      updateURLWithState(state)
      expect(replaceStateSpy).toHaveBeenCalled()
    })

    it('should call replaceState with new URL containing state params', () => {
      const state = {
        step: 5,
        speed: 1,
        status: 'playing' as PlaybackStatus,
      }
      updateURLWithState(state)
      const callArgs = replaceStateSpy.mock.calls[0]
      const newUrl = callArgs[2] as string
      expect(newUrl).toContain('step=5')
      expect(newUrl).toContain('status=playing')
      // Should still contain the base URL
      expect(newUrl).toContain('/visualizer/algorithm/bubble-sort')
    })
  })

  describe('getInitialStateFromURL', () => {
    it('should return null on server', () => {
      // Simulate server environment by temporarily removing window
      const originalWindow = globalThis.window
      // @ts-ignore
      delete globalThis.window
      const result = getInitialStateFromURL()
      expect(result).toBeNull()
      globalThis.window = originalWindow
    })
  })

  describe('getViewFromURL', () => {
    it('should return default view on server', () => {
      const originalWindow = globalThis.window
      // @ts-ignore
      delete globalThis.window
      const result = getViewFromURL()
      expect(result).toBe('runtime')
      globalThis.window = originalWindow
    })
  })

  describe('getDarkFromURL', () => {
    it('should return true on server', () => {
      const originalWindow = globalThis.window
      // @ts-ignore
      delete globalThis.window
      const result = getDarkFromURL()
      expect(result).toBe(true)
      globalThis.window = originalWindow
    })
  })

  describe('getInputFromURL', () => {
    it('should return null on server', () => {
      const originalWindow = globalThis.window
      // @ts-ignore
      delete globalThis.window
      const result = getInputFromURL()
      expect(result).toBeNull()
      globalThis.window = originalWindow
    })
  })
})
