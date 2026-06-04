import { describe, it, expect } from 'vitest'
import type { Scenario, ScenarioDomain } from '@codeprism/core'
import {
  getAllAlgorithms,
  getAllGraphs,
  getAllPatterns,
  getAllSearches,
  getAllStructures,
  getContent,
} from './index.js'

const VALID_DOMAINS: ScenarioDomain[] = [
  'ui-framework', 'database', 'system', 'ai-ml', 'game-dev',
  'network', 'devtools', 'library', 'business', 'concurrency',
  'graphics', 'data-pipeline',
]

/** Walk every content item across all 5 registries. */
function allContent() {
  return [
    ...getAllAlgorithms().map((c) => ({ ...c, _cat: 'algorithm' as const })),
    ...getAllSearches().map((c) => ({ ...c, _cat: 'search' as const })),
    ...getAllGraphs().map((c) => ({ ...c, _cat: 'graph' as const })),
    ...getAllPatterns().map((c) => ({ ...c, _cat: 'pattern' as const })),
    ...getAllStructures().map((c) => ({ ...c, _cat: 'structure' as const })),
  ]
}

describe('Scenarios Integrity', () => {
  describe('All content items have at least one scenario', () => {
    for (const c of allContent()) {
      it(`${c._cat}/${c.slug} has non-empty scenarios[]`, () => {
        expect(c.scenarios).toBeDefined()
        expect(Array.isArray(c.scenarios)).toBe(true)
        expect((c.scenarios as Scenario[]).length).toBeGreaterThan(0)
      })
    }
  })

  describe('Scenario fields are well-formed', () => {
    for (const c of allContent()) {
      it(`${c._cat}/${c.slug} scenarios have valid schema`, () => {
        const scenarios = c.scenarios as Scenario[]
        const seenIds = new Set<string>()
        for (const s of scenarios) {
          // id is non-empty and unique within the content
          expect(s.id).toBeTruthy()
          expect(s.id.length).toBeGreaterThan(0)
          expect(seenIds.has(s.id)).toBe(false)
          seenIds.add(s.id)

          // i18nKey follows the expected pattern
          // The category naming is:
          //   algorithm / search / graph → "algorithms"
          //   pattern                    → "patterns"
          //   structure                  → "structures"
          const expectedCategory =
            c._cat === 'pattern' ? 'patterns' :
            c._cat === 'structure' ? 'structures' :
            'algorithms'
          const expectedKey = `content.${expectedCategory}.${c.slug}.scenarios.${s.id}`
          expect(s.i18nKey).toBe(expectedKey)

          // domain is one of the 12 enum values
          expect(VALID_DOMAINS).toContain(s.domain)

          // reference (optional) is a non-empty string
          if (s.reference !== undefined) {
            expect(typeof s.reference).toBe('string')
            expect(s.reference.length).toBeGreaterThan(0)
          }

          // codeSnippet (optional) has language and code
          if (s.codeSnippet) {
            expect(typeof s.codeSnippet.language).toBe('string')
            expect(s.codeSnippet.language.length).toBeGreaterThan(0)
            expect(typeof s.codeSnippet.code).toBe('string')
            expect(s.codeSnippet.code.length).toBeGreaterThan(0)
          }
        }
      })
    }
  })

  describe('i18nKey map coverage', () => {
    // For every scenario in every content item, the i18nKey should be
    // addressable. We don't load messages here, but we can sanity-check
    // that getContent(scenario.i18nKey split) makes sense.
    it('every i18nKey is rooted under the expected content subtree', () => {
      for (const c of allContent()) {
        for (const s of c.scenarios as Scenario[]) {
          const expectedCategory =
            c._cat === 'pattern' ? 'patterns' :
            c._cat === 'structure' ? 'structures' :
            'algorithms'
          expect(s.i18nKey.startsWith(`content.${expectedCategory}.${c.slug}.scenarios.`)).toBe(true)
        }
      }
    })
  })

  describe('Cross-content lookup consistency', () => {
    it('getContent(category, slug) returns the same item as direct registry', () => {
      for (const c of allContent()) {
        const looked = getContent(c._cat, c.slug)
        expect(looked).toBeDefined()
        expect(looked?.id).toBe(c.id)
      }
    })
  })
})
