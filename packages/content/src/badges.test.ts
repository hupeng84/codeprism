import { describe, it, expect } from 'vitest'
import { BADGES, evaluateBadges, badgeProgress } from './badges.js'

/** Build a completed map with the given slugs marked true. */
function completed(...slugs: string[]): Record<string, boolean> {
  const m: Record<string, boolean> = {}
  for (const s of slugs) m[s] = true
  return m
}

describe('Achievement Badges', () => {
  describe('Catalog integrity', () => {
    it('exposes a non-empty catalog of badges', () => {
      expect(BADGES.length).toBeGreaterThan(0)
    })

    it('every badge has a unique id', () => {
      const ids = new Set<string>()
      for (const b of BADGES) {
        expect(ids.has(b.id)).toBe(false)
        ids.add(b.id)
      }
    })

    it('every badge has a non-empty icon, color, and i18nKey', () => {
      for (const b of BADGES) {
        expect(b.icon.length).toBeGreaterThan(0)
        expect(b.color.startsWith('#')).toBe(true)
        expect(b.i18nKey.startsWith('achievements.badges.')).toBe(true)
      }
    })

    it('every badge has a sensible threshold and total', () => {
      for (const b of BADGES) {
        expect(b.threshold).toBeGreaterThan(0)
        expect(b.total).toBeGreaterThanOrEqual(b.threshold)
      }
    })
  })

  describe('evaluateBadges()', () => {
    it('returns empty set for fresh user with no completions or favorites', () => {
      const unlocked = evaluateBadges({ completed: {}, favorites: {} })
      expect(unlocked.size).toBe(0)
    })

    it('first-step unlocks after 1 completion', () => {
      const unlocked = evaluateBadges({ completed: completed('pattern/observer'), favorites: {} })
      expect(unlocked.has('first-step')).toBe(true)
    })

    it('explorer unlocks at 10 completions', () => {
      const slugs = Array.from({ length: 10 }, (_, i) => `pattern/p${i}`)
      const unlocked = evaluateBadges({ completed: completed(...slugs), favorites: {} })
      expect(unlocked.has('explorer')).toBe(true)
      expect(unlocked.has('first-step')).toBe(true)
    })

    it('explorer does NOT unlock at 9 completions', () => {
      const slugs = Array.from({ length: 9 }, (_, i) => `pattern/p${i}`)
      const unlocked = evaluateBadges({ completed: completed(...slugs), favorites: {} })
      expect(unlocked.has('explorer')).toBe(false)
    })

    it('pattern-master unlocks after 23 pattern completions', () => {
      const slugs = Array.from({ length: 23 }, (_, i) => `pattern/p${i}`)
      const unlocked = evaluateBadges({ completed: completed(...slugs), favorites: {} })
      expect(unlocked.has('pattern-master')).toBe(true)
      expect(unlocked.has('pattern-explorer')).toBe(true)
    })

    it('algorithm-master unlocks after 21 algorithm completions', () => {
      const slugs = Array.from({ length: 21 }, (_, i) => `algorithm/a${i}`)
      const unlocked = evaluateBadges({ completed: completed(...slugs), favorites: {} })
      expect(unlocked.has('algorithm-master')).toBe(true)
    })

    it('algorithm-master counts search and graph algorithms too', () => {
      // 10 algorithm + 5 search + 6 graph = 21 total algorithm-category items
      const slugs = [
        ...Array.from({ length: 10 }, (_, i) => `algorithm/a${i}`),
        ...Array.from({ length: 5 }, (_, i) => `search/s${i}`),
        ...Array.from({ length: 6 }, (_, i) => `graph/g${i}`),
      ]
      const unlocked = evaluateBadges({ completed: completed(...slugs), favorites: {} })
      expect(unlocked.has('algorithm-master')).toBe(true)
    })

    it('structure-master unlocks after 16 structure completions', () => {
      const slugs = Array.from({ length: 16 }, (_, i) => `structure/s${i}`)
      const unlocked = evaluateBadges({ completed: completed(...slugs), favorites: {} })
      expect(unlocked.has('structure-master')).toBe(true)
    })

    it('curator unlocks at 5 favorites (not completions)', () => {
      const favs: Record<string, boolean> = {}
      for (let i = 0; i < 5; i++) favs[`pattern/p${i}`] = true
      const unlocked = evaluateBadges({ completed: {}, favorites: favs })
      expect(unlocked.has('curator')).toBe(true)
      // It must NOT count favorites as completions for first-step.
      expect(unlocked.has('first-step')).toBe(false)
    })

    it('completionist unlocks only when ALL items are completed', () => {
      // 76 = 23 patterns + 21 algorithms + 9 graph + 7 search + 16 structures
      const all = [
        ...Array.from({ length: 23 }, (_, i) => `pattern/p${i}`),
        ...Array.from({ length: 21 }, (_, i) => `algorithm/a${i}`),
        ...Array.from({ length: 7 }, (_, i) => `search/s${i}`),
        ...Array.from({ length: 9 }, (_, i) => `graph/g${i}`),
        ...Array.from({ length: 16 }, (_, i) => `structure/s${i}`),
      ]
      expect(all.length).toBe(76)
      const unlocked = evaluateBadges({ completed: completed(...all), favorites: {} })
      expect(unlocked.has('completionist')).toBe(true)
    })

    it('evaluation is monotonic: more progress never un-unlocks a badge', () => {
      const slugs = Array.from({ length: 30 }, (_, i) => `pattern/p${i}`)
      const before = evaluateBadges({ completed: completed(...slugs.slice(0, 5)), favorites: {} })
      const after = evaluateBadges({ completed: completed(...slugs), favorites: {} })
      // Every badge unlocked at 5 completions should still be unlocked at 30.
      for (const id of before) {
        expect(after.has(id)).toBe(true)
      }
      // And we should have MORE unlocks at 30.
      expect(after.size).toBeGreaterThan(before.size)
    })
  })

  describe('badgeProgress()', () => {
    it('returns the current metric value for a badge', () => {
      const state = { completed: completed('pattern/a', 'pattern/b'), favorites: {} }
      const badge = BADGES.find((b) => b.id === 'pattern-explorer')!
      expect(badgeProgress(state, badge)).toBe(2)
    })
  })
})
