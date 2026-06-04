# Changelog

All notable changes to CodePrism will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- **Cross-tab progress sync** via `BroadcastChannel`. Tabs opened to the same CodePrism stay in sync — completing a lesson or unlocking an achievement in one tab updates the others in ~10 ms (down from ~100 ms via `storage` events). Achievement toast fires only in the tab where the action originated, fixing a pre-existing cross-tab toast bug from the persisted `lastUnlocked` field.
- **PWA install support**. Updated `public/manifest.json` with full PWA metadata (icons, theme color, 3 shortcuts for Algorithms/Patterns/Achievements). New `PwaInstallPrompt` component captures the `beforeinstallprompt` event, shows a custom themed toast with a 7-day dismissal cooldown, and falls back to iOS-specific "Add to Home Screen" instructions.
- **Service worker update prompt**. New `SwUpdateToast` blocks the silent `skipWaiting()` of the new SW, instead waiting for an explicit user click before reloading. Prevents surprise page reloads while a user is mid-scenario.
- **Sentry-compatible error reporter**. `src/lib/error-reporter.ts` ships errors via a pluggable transport (PostHog-compatible, no `@sentry/nextjs` SDK). Captures `window.error`, `unhandledrejection`, and React `<ErrorBoundary>` throws. Parses V8 stack traces, sends via fetch (no SDK dependency, ~50 KB savings). Privacy: respects the same consent gate as analytics.
- **Analytics & A/B testing framework**. `src/lib/analytics.ts` ships events via a pluggable transport with built-in `posthogTransport` and `umamiTransport` (no SDK). 12 typed events + 3 built-in feature flags with stable per-browser variant assignment via djb2 hashing of a localStorage `flagId`. GDPR-friendly: DNT respected, opt-in consent, no PII.
- **Developer guide**. New `DEVELOPING.md` with recipes for adding events/flags, wiring up Sentry/PostHog, adjusting bundle budgets, adding i18n keys, and running tests. Linked from the main README.
- **GitHub Actions CI**. New `.github/workflows/ci.yml` with two jobs: `quality` (lint, typecheck, vitest, build, bundle budget — ~3 min) and `e2e` (Playwright with cached browser — ~6 min). Concurrency control cancels in-progress runs on new PR pushes.
- **CI status badge** in `README.md`. Linked to the workflow runs page; auto-updates from latest run status.
- **Star History chart** in `README.md` and `README_ZH.md`, linking to https://star-history.com/#hupeng84/codeprism. Auto-adapts to dark/light theme via `<picture>` + `prefers-color-scheme`.
- **Support / 打赏 section** in `README.md` and `README_ZH.md` with WeChat Pay and Alipay QR codes (`.github/sponsor/wechat-pay.jpg`, `.github/sponsor/alipay.jpg`). Files moved from repo root to `.github/sponsor/`.

### Changed

- **Service worker: heavy chunks now use `cacheFirst`**. Monaco (3.7 MB `editor.main.js`) and Mermaid dynamic chunks (~1.3 MB across 7 files) are cached forever on first load. Saves ~5 MB of revalidation round-trips per cold visualizer page.
- **Service worker: navigation preload enabled**. Browser starts the navigation fetch in parallel with SW boot, cutting cold-start latency by ~50-200 ms. `handleNavigation` races `event.preloadResponse` against a fresh fetch, falling back to cache → `/offline` page.
- **Progress store now IDB-backed with localStorage mirror**. `src/lib/idb-storage.ts` provides a `StateStorage` adapter; reads from IDB first, falls back to localStorage on miss (auto-hydrates IDB), and keeps both in sync. Removes the 5-10 MB localStorage ceiling; readable by the service worker; auto-migrates existing users from localStorage on first load.
- **Visualizer route code-split**. `<CodeEditor>` and `<MermaidUMLCanvas>` are now wrapped in `next/dynamic` with Suspense fallbacks. The ~3 MB Monaco bundle loads from `/public/monaco-editor/` on demand, not from the Next.js bundle.
- **ReactFlow + dagre dead code removed**. The `ReactFlowPatternRenderer` and helpers (unused after the previous refactor) and 3 unused deps (`@dagrejs/dagre`, `@xyflow/react`, `react-x-mermaid`) are gone.

### Performance

- **Bundle budget enforcement**. `bundle-budgets.json` caps First Load JS per route (gzipped). Static check (`scripts/check-bundle-budget.mjs`, <1 s) and runtime check (`tests/bundle-budget.spec.ts` via Playwright) prevent regressions. Visualizer: 500 kB cap (currently 346 kB), Compare: 600 kB, others 200-450 kB.
- **`pnpm verify` script** runs build + budget + unit + e2e in one command.
- **Production console stripping**. `next.config.ts` enables `compiler.removeConsole` in production with `error` + `warn` kept (so user bug reports still capture context). Strips all `console.log` / `console.info` / `console.debug` from user code; vendor code in `node_modules` is untouched. Combined with `productionBrowserSourceMaps: false` (explicit), the deployed bundle ships zero `.map` files and no application-level debug logging.

### Infrastructure

- **`fake-indexeddb`** added as a dev dependency for testing the IDB adapter in jsdom.
- **`scripts/check-bundle-budget.mjs`** — static gzipped-size budget check, supports `BUNDLE_BUDGETS_ROOT` env var for test isolation.
- **`src/lib/progress-sync.ts`** — BroadcastChannel-based mirror with `isApplyingRemote` loop guard, `tabId` session storage, and re-entrancy safety for React 18 StrictMode.
- **`src/components/analytics/PageViewTracker.tsx`** — fires `page_view` on every route change (no-op if no consent).
- **`src/components/analytics/AnalyticsConsent.tsx`** — settings toggle on the achievements page; rendered only after consent state is read from storage to avoid SSR hydration flicker.
- **`src/components/ErrorReporting.tsx`** — mounts the global `window.error` + `unhandledrejection` listeners for the app's lifetime.

## Notes

- Suggested version bump: **1.0.0 → 1.1.0** (additive features, no breaking API changes)
- All 538 unit tests + 9 static-budget assertions pass
- No new external SDK dependencies added — every new feature is implemented in-tree
- See `DEVELOPING.md` for how to wire up real Sentry / PostHog / Umami backends
