# Developing CodePrism

A guide for contributors working on CodePrism's telemetry, A/B testing, and error reporting systems. If you're adding a feature that should be tracked, configurable, or monitored, this is the place to look.

## Table of Contents

- [Adding a new analytics event](#adding-a-new-analytics-event)
- [Adding a new feature flag](#adding-a-new-feature-flag)
- [Wiring up Sentry for error reporting](#wiring-up-sentry-for-error-reporting)
- [Wiring up PostHog as the analytics backend](#wiring-up-posthog-as-the-analytics-backend)
- [Adjusting bundle budgets](#adjusting-bundle-budgets)
- [Adding a new i18n key](#adding-a-new-i18n-key)
- [Running tests](#running-tests)

---

## Adding a new analytics event

Events are defined as a discriminated union in `src/lib/analytics.ts` and dispatched via `track()`. Adding a new one is a 3-step process.

### 1. Add the event type

Edit `src/lib/analytics.ts` and add a new variant to the `AnalyticsEvent` union:

```ts
export type AnalyticsEvent =
  | { type: "page_view"; path: string; locale: string }
  | { type: "lesson_completed"; lessonId: string; category: string; timeSpentSec: number }
  // ... existing events
  | { type: "your_new_event"; userId: string; someValue: number };
```

The TypeScript compiler will then guide you — every `track()` call site is type-checked.

### 2. Track it from your code

```ts
import { track } from "@/lib/analytics";

track({ type: "your_new_event", userId: "...", someValue: 42 });
```

`track()` is a no-op if any of the following is true:

- `navigator.doNotTrack === "1"` (DNT enabled)
- The user has not granted analytics consent (see `useConsent()`)
- We're on the server (`typeof window === "undefined"`)

So you can call it freely without performance or privacy concerns.

### 3. (Recommended) Add a unit test

In `src/lib/analytics.test.ts`, add coverage for the consent + DNT + transport flow. See existing tests for the pattern.

### Where to call `track()` from

Pick the call site closest to the user action:

| Event | Call site |
|---|---|
| `lesson_completed` | `markCompleted` action in `use-progress-store.ts` |
| `theme_changed` | `toggleTheme` / `resetToAuto` in `ThemeProvider.tsx` |
| `pwa_installed` | `handleInstall` in `PwaInstallPrompt.tsx` (on `accepted`) |
| `pwa_install_dismissed` | `handleDismiss` in `PwaInstallPrompt.tsx` |
| `sw_updated` | `handleUpdate` in `SwUpdateToast.tsx` |
| `page_view` | `PageViewTracker.tsx` (auto on route change) |

---

## Adding a new feature flag

Feature flags (A/B tests) are defined at the bottom of `src/lib/analytics.ts` and consumed via the `useFeatureFlag()` hook.

### 1. Define the flag

```ts
// At the bottom of src/lib/analytics.ts
defineFlag({
  name: "your-experiment-name",
  variants: ["control", "variant-a", "variant-b"],
  defaultVariant: "control",
});
```

`name` must be unique. `variants` is a non-empty list of string labels. `defaultVariant` is the fallback when no flag is defined for a user (rare in practice — only happens during a rolling deploy).

### 2. Use it in a component

```tsx
import { useFeatureFlag } from "@/lib/analytics";

function MyComponent() {
  const variant = useFeatureFlag("your-experiment-name");

  if (variant === "variant-a") return <NewDesignA />;
  if (variant === "variant-b") return <NewDesignB />;
  return <ControlDesign />;
}
```

Variant assignment is **stable per browser** — the same user always sees the same variant (hash of the local `flagId`).

### 3. (QA) Force a specific variant

In DevTools console:

```js
localStorage.setItem(
  "codeprism-flag-override-your-experiment-name",
  "variant-a",
);
```

Or in code:

```ts
import { setFlagOverride } from "@/lib/analytics";
setFlagOverride("your-experiment-name", "variant-a");
// setFlagOverride("your-experiment-name", null); // clear
```

### 4. Roll out gradually

To start with 10% of users on the new variant, change the variants list:

```ts
defineFlag({
  name: "your-experiment-name",
  variants: ["control", "variant-a"],   // 50/50 split
  // For 10%, add:  ["control", "control", "control", "control", "control",
  //                "control", "control", "control", "control", "variant-a"],
  defaultVariant: "control",
});
```

When the experiment is over, remove the flag from the component and delete the `defineFlag()` call.

### Built-in flags

| Name | Variants | Purpose |
|---|---|---|
| `show-step-counter` | control, show | Display step counter on visualizer |
| `new-comparison-view` | control, redesign | Redesigned side-by-side compare view |
| `achievement-celebration` | control, confetti | Confetti on achievement unlock |

---

## Wiring up Sentry for error reporting

The error reporter lives in `src/lib/error-reporter.ts` and ships errors via a pluggable transport. By default it does nothing (the `noopTransport`).

### 1. Get a Sentry DSN

Create a project at <https://sentry.io> (or use self-hosted). Copy the DSN — it looks like:

```
https://<key>@<host>/<project_id>
```

### 2. Configure the transport at app bootstrap

Create `instrumentation-client.ts` at the project root (Next.js 15 picks this up automatically):

```ts
// instrumentation-client.ts
import { configureErrorReporting, sentryTransport } from "@/lib/error-reporter";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  configureErrorReporting({
    transport: sentryTransport(process.env.NEXT_PUBLIC_SENTRY_DSN, {
      release: process.env.NEXT_PUBLIC_APP_VERSION,
      environment: process.env.NODE_ENV,
    }),
  });
}
```

The `reportError()` function (and the global `window.onerror` / `unhandledrejection` handlers installed by `<ErrorReporting />`) will now post to Sentry whenever an error is captured.

### 3. Add env vars

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o123.ingest.sentry.io/123456
NEXT_PUBLIC_APP_VERSION=$(git rev-parse --short HEAD)
```

`NEXT_PUBLIC_*` vars are inlined at build time and exposed to the browser.

### 4. Verify

```ts
// In DevTools console:
throw new Error("test from CodePrism");
```

The error should appear in your Sentry dashboard within a few seconds.

### What gets reported

| Source | Captured by | Tag |
|---|---|---|
| React component throws | `<ErrorBoundary>` | `react-error-boundary` |
| Uncaught error in handler | `window.onerror` | `window.error` |
| Unhandled promise rejection | `unhandledrejection` | `unhandledrejection` |
| Manual `reportError(err, ctx)` | wherever you call it | (your choice) |

The `componentStack` is included as `extra` for React errors. Other context (tags, extra, user) is yours to set in the call site.

### Privacy

- Errors respect the **same consent gate** as analytics (DNT or no consent → dropped, dev-only console fallback)
- No PII unless you explicitly add `user.email` etc. to the context
- Stack traces are sent raw (browser will include file paths, function names)

### Migrating to `@sentry/nextjs`

If you later want the full Sentry SDK (source maps, sessions, replay, performance):

```ts
// instrumentation-client.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
  tracesSampleRate: 0.1,
});
```

The `reportError()`, `<ErrorBoundary>`, and `<ErrorReporting />` interfaces stay the same. You can remove the `configureErrorReporting` call and the `sentryTransport` import.

---

## Wiring up PostHog as the analytics backend

The analytics module uses a pluggable transport. The default is `noopTransport` — nothing is sent until you configure one.

### 1. Get a PostHog key

Sign up at <https://posthog.com> (or self-host). Copy the project key (`phc_...`).

### 2. Configure in `instrumentation-client.ts`

```ts
import {
  configureAnalytics,
  configureErrorReporting,
  posthogTransport,
  sentryTransport,
} from "@/lib/analytics";  // ← note: analytics, not error-reporter
import { sentryTransport } from "@/lib/error-reporter";

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  configureAnalytics({
    transport: posthogTransport(
      process.env.NEXT_PUBLIC_POSTHOG_KEY,
      process.env.NEXT_PUBLIC_POSTHOG_HOST, // optional, default app.posthog.com
    ),
  });
}

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  configureErrorReporting({
    transport: sentryTransport(process.env.NEXT_PUBLIC_SENTRY_DSN),
  });
}
```

### 3. Add env vars

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com  # optional
```

### 4. Verify

Open the app, do anything (route change, click a button), then check the PostHog activity feed for the events.

### Other backends

The same pattern works for any HTTP-based analytics:

| Backend | Helper | Notes |
|---|---|---|
| PostHog | `posthogTransport(key, host?)` | Self-hostable |
| Umami | `umamiTransport(websiteId, host?)` | Privacy-first |
| Plausible | write your own | `POST /api/event` |
| Custom webhook | write your own | receives `EnrichedEvent` |

Each is a function that returns a `Transport`:

```ts
type Transport = (event: EnrichedEvent) => void;
// where EnrichedEvent = AnalyticsEvent & { sessionId, flagId, ts }
```

The transport is responsible for delivery, retry, batching — your choice.

---

## Adjusting bundle budgets

Each route has a First Load JS budget in `bundle-budgets.json` at the project root:

```json
{
  "firstLoadJs": {
    "/visualizer/[category]/[slug]": 500000
  }
}
```

Values are **gzipped bytes** (matches what `next build` reports and what users actually download).

### When to bump a budget

- You added a new feature that legitimately grew the route (e.g., new visualization library)
- The current number is comfortably below the budget (just keep it tight)

### When to trim instead

- The new bundle size exceeds the budget
- The increase is more than ~5% — likely a regression

### Verify

```bash
pnpm build          # populates .next/
pnpm build:check    # asserts budgets
```

Both the static check (gzipped chunk sizes from the manifest) and the runtime check (`tests/bundle-budget.spec.ts` via Playwright) use the same `bundle-budgets.json`.

---

## Adding a new i18n key

i18n strings live in `src/messages/en.json` and `src/messages/zh.json`. Both must be updated — missing keys fall back to the key name.

```ts
// In a component
import { useTranslations } from "next-intl";

const t = useTranslations();
return <button>{t("your.newKey")}</button>;
```

```json
// src/messages/en.json
{
  "your": { "newKey": "Click me" }
}

// src/messages/zh.json
{
  "your": { "newKey": "点击我" }
}
```

Namespaces are nested arbitrarily — pick what reads well. Common ones already in use: `nav.*`, `achievements.*`, `pwa.*`, `analytics.*`, `error.*`, `swUpdate.*`, `reference.*`.

---

## Running tests

### Unit tests (Vitest)

```bash
pnpm test              # run once
pnpm test:watch        # watch mode
pnpm test:coverage     # coverage report (lcov + html)
```

Test files live next to source: `src/lib/foo.ts` → `src/lib/foo.test.ts`. For node-only tests, add `/* @vitest-environment node */` at the top. For DOM-dependent tests, `/* @vitest-environment jsdom */` (and import `fake-indexeddb/auto` if you need IndexedDB).

### E2E tests (Playwright)

```bash
pnpm test:e2e          # headless
pnpm test:e2e:ui       # interactive UI
pnpm test:e2e:debug    # step through with inspector
```

E2E specs live in `tests/*.spec.ts`. They spin up a real Chromium against the production build.

### Lint, typecheck, build

```bash
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm build        # next build
pnpm build:check  # bundle budget assertion
```

`pnpm verify` runs all of the above except e2e.

---

## File map

Quick reference for where things live:

| Concern | File |
|---|---|
| Analytics events + flags | `src/lib/analytics.ts` |
| Error reporter | `src/lib/error-reporter.ts` |
| Service worker | `public/sw.js` |
| PWA manifest | `public/manifest.json` |
| Progress store (with `partialize` for consent) | `src/components/visualizer/use-progress-store.ts` |
| Cross-tab sync | `src/lib/progress-sync.ts` |
| IDB-backed storage | `src/lib/idb-storage.ts` |
| Bundle budget config | `bundle-budgets.json` |
| CI workflow | `.github/workflows/ci.yml` |

---

## Asking for help

Open a [GitHub issue](https://github.com/hupeng84/codeprism/issues) or DM [@hupeng84](https://github.com/hupeng84). The above patterns are all tested — if something doesn't work as documented, that's a bug.
