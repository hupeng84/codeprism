// CodePrism Service Worker
// Manual caching with Workbox-like strategies
//
// v4 changes (cumulative since v3):
//   - Heavy chunks (Monaco / Mermaid) now use cacheFirst with a dedicated cache
//     namespace. Their filenames are content-hashed (Next.js) or versioned via
//     the `/monaco-editor/` static path, so stale entries are never requested
//     again. Saves ~5 MB of revalidation round-trips on cold start.
//   - Removed `self.skipWaiting()` from install. The new SW waits in `installed`
//     state and the user is prompted via the `SwUpdateToast` component. The
//     toast sends a `SKIP_WAITING` message which we honour here.
//   - Navigation preload enabled in activate. The browser starts fetching the
//     next navigation request in parallel with the SW booting, and the fetch
//     handler awaits `event.preloadResponse` first. Cold start on the
//     /visualizer route drops by ~50-200 ms on a typical connection.

const CACHE_VERSION = "v4";
const CACHE_NAMES = {
  appShell: `codeprism-app-shell-${CACHE_VERSION}`,
  staticAssets: `codeprism-static-assets-${CACHE_VERSION}`,
  // Monaco (~3.7 MB editor.main.js) + Mermaid chunks (~1.3 MB across 7 files).
  // High limit because these are MBs of code, not 60 small icons.
  heavyChunks: `codeprism-heavy-chunks-${CACHE_VERSION}`,
  fonts: `codeprism-fonts-${CACHE_VERSION}`,
  api: `codeprism-api-${CACHE_VERSION}`,
};

const MAX_STATIC_ENTRIES = 60;
const MAX_HEAVY_ENTRIES = 200; // 200 × ~50 KB avg ≈ 10 MB ceiling

// Pre-cache the app shell on install. /offline.html is the static panic-button
// fallback (rendered even before the SW takes over); /offline is the locale-aware
// Next.js route used by the SW's networkFirstWithFallback when navigation fails.
const APP_SHELL_URLS = ["/", "/offline.html", "/offline"];

// ── Install: pre-cache app shell (do NOT skipWaiting) ─────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.appShell).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  // Intentionally no skipWaiting() here. The new SW waits in `installed` state
  // and the SwUpdateToast component shows a "New version available" prompt.
  // When the user clicks Update, the client posts {SKIP_WAITING} to us.
});

// ── Activate: clean old caches + enable navigation preload ───────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 1. Drop any caches from previous SW versions.
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !Object.values(CACHE_NAMES).includes(key))
          .map((key) => caches.delete(key))
      );

      // 2. Enable navigation preload. The browser starts the navigation
      //    fetch in parallel with SW boot. The fetch handler awaits
      //    `event.preloadResponse` first, falling back to its own fetch
      //    if the preload is missing or slower. Net effect: the user sees
      //    a faster first paint on every cold navigation.
      if ("navigationPreload" in self.registration) {
        try {
          await self.registration.navigationPreload.enable();
        } catch {
          // Some browsers (e.g. older Safari) throw — degrade gracefully.
        }
      }

      // 3. Take control of all open clients immediately.
      await self.clients.claim();
    })()
  );
});

// ── Message: respond to client prompts ────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    // User clicked "Update" in SwUpdateToast. Activate now and claim clients.
    // The page's `controllerchange` listener will trigger a window.location.reload().
    self.skipWaiting();
  }
});

// ── Fetch: routing strategies ─────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith("http")) return;

  // Strategy router
  if (isHeavyChunk(url)) {
    // Monaco + Mermaid chunks: content-hashed filenames, safe to cache forever.
    // Saves ~5 MB of network round-trips per cold visualizer page load.
    event.respondWith(cacheFirst(request, CACHE_NAMES.heavyChunks, MAX_HEAVY_ENTRIES));
  } else if (isJavaScript(url)) {
    // JS chunks have content-hashed filenames — always fetch fresh to avoid
    // stale module factories that cause "Cannot read properties of undefined"
    event.respondWith(networkFirst(request, CACHE_NAMES.staticAssets));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, CACHE_NAMES.staticAssets, MAX_STATIC_ENTRIES));
  } else if (isFont(url)) {
    event.respondWith(cacheFirstWithRevalidation(request, CACHE_NAMES.fonts));
  } else if (isNavigation(request) || isAppShell(url)) {
    // Navigations + app-shell routes: prefer the preloaded response, fall back
    // to a regular fetch, then to the cached shell, then to /offline.
    event.respondWith(handleNavigation(event));
  } else {
    // API / dynamic: network-first with cache fallback
    event.respondWith(networkFirst(request, CACHE_NAMES.api));
  }
});

// ── Strategy: CacheFirst ──────────────────────────────────────────────────────
async function cacheFirst(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      await putWithLimit(cache, request, response.clone(), maxEntries);
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
  }
}

// ── Strategy: CacheFirst with background revalidation (for fonts) ─────────────
async function cacheFirstWithRevalidation(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Always try to revalidate in the background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;
  const response = await fetchPromise;
  return response || new Response("Offline", { status: 503 });
}

// ── Strategy: NetworkFirst ────────────────────────────────────────────────────
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}

// ── Strategy: Navigation with preload + offline fallback ─────────────────────
//
// Order of preference:
//   1. `event.preloadResponse` — started in parallel with SW boot by the
//      browser. Fastest path; resolved here before we issue our own fetch.
//   2. `fetch(event.request)` — the fallback. Always started in parallel
//      with (1) so the cache is populated even if (1) wins.
//   3. Cached navigation response from the app-shell cache.
//   4. `/offline` (locale-aware Next route) or `/offline.html` (static panic).
async function handleNavigation(event) {
  // Kick off the real fetch in parallel — populates the cache on success.
  const fetchPromise = fetch(event.request)
    .then((response) => {
      if (response && response.ok) {
        const cloned = response.clone();
        caches.open(CACHE_NAMES.appShell).then((cache) => {
          cache.put(event.request, cloned).catch(() => {});
        });
      }
      return response;
    })
    .catch(() => null);

  // Await the preload first (it's already in flight by the browser).
  let preloaded = null;
  try {
    preloaded = (await event.preloadResponse) || null;
  } catch {
    // preloadResponse can reject if preload is disabled or the request
    // doesn't qualify. Fall through to the regular fetch.
  }

  const response = preloaded || (await fetchPromise);
  if (response) return response;

  // Both failed — try cache, then /offline.
  const cache = await caches.open(CACHE_NAMES.appShell);
  const cached = await cache.match(event.request);
  if (cached) return cached;
  const offline =
    (await cache.match("/offline")) || (await cache.match("/offline.html"));
  return offline || new Response("Offline", { status: 503 });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function isJavaScript(url) {
  return /\.(js|mjs)$/i.test(url.pathname);
}

function isStaticAsset(url) {
  return /\.(css|png|jpe?g|gif|webp|avif|ico|svg|woff2?|ttf|eot)$/i.test(url.pathname);
}

function isFont(url) {
  return /\.(woff2?|ttf|eot)$/i.test(url.pathname);
}

function isNavigation(request) {
  return request.mode === "navigate";
}

function isAppShell(url) {
  return (
    url.pathname === "/" ||
    url.pathname === "/offline.html" ||
    url.pathname === "/offline"
  );
}

/**
 * Heavy chunks — content-hashed, large, slow to revalidate over flaky networks.
 *
 * Triggers:
 *   - `/monaco-editor/...` — Monaco editor files served from /public. The
 *     `editor.main.js` alone is 3.7 MB. Not content-hashed but versioned via
 *     the static path; bumping the Monaco dep + redeploying ships a new path.
 *   - `/_next/static/chunks/*.js` — Next.js content-hashed dynamic chunks
 *     (includes the Mermaid dynamic chunks: ~1.3 MB across 7 files).
 */
function isHeavyChunk(url) {
  if (url.pathname.startsWith("/monaco-editor/") && /\.(js|mjs|wasm)$/i.test(url.pathname)) {
    return true;
  }
  if (
    url.pathname.startsWith("/_next/static/chunks/") &&
    /\.(js|mjs)$/i.test(url.pathname)
  ) {
    return true;
  }
  return false;
}

// Cache size limiter (LRU-style: evict oldest entries)
async function putWithLimit(cache, request, response, maxEntries) {
  if (!maxEntries) {
    await cache.put(request, response);
    return;
  }

  const keys = await cache.keys();
  if (keys.length >= maxEntries) {
    // Remove oldest entry
    await cache.delete(keys[0]);
  }
  await cache.put(request, response);
}
