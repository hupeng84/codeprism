"use client";

/**
 * IndexedDB-backed state storage for Zustand's `persist` middleware.
 *
 * Why IDB:
 *   - ~50% headroom vs localStorage's 5-10 MB limit (browsers vary)
 *   - Async API means writes don't block the main thread
 *   - Accessible to the service worker (so the SW could read progress in
 *     the future, e.g. to send a richer offline response)
 *   - More robust to private-mode / storage-clear / quota errors
 *
 * Why also write to localStorage:
 *   - Keeps the cross-tab `storage` event working on browsers without
 *     BroadcastChannel (Safari < 15.4, IE). Our BroadcastChannel sync
 *     covers modern browsers, but storage events are the legacy fallback.
 *   - One-time cost: a duplicate string write per setItem. Negligible.
 *
 * On first read (IDB empty, localStorage has data):
 *   - We return the localStorage value AND fire-and-forget hydrate IDB
 *     from it. From the next read on, IDB is the source of truth.
 *
 * Failure handling:
 *   - If IDB throws (private mode, quota, disabled), the adapter degrades
 *     to pure localStorage so the app keeps working.
 *   - If localStorage throws (quota, disabled), IDB still works.
 */

const DB_NAME = "codeprism";
const DB_VERSION = 1;
const STORE_NAME = "kv";

// ── Raw IDB primitives ──────────────────────────────────────────────────────

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("IDB upgrade blocked"));
  });
}

async function idbGet(key: string): Promise<string | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => {
      db.close();
      resolve((req.result as string | undefined) ?? null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

async function idbSet(key: string, value: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function idbRemove(key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// ── localStorage guards ─────────────────────────────────────────────────────

function lsAvailable(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function lsGet(key: string): string | null {
  if (!lsAvailable()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  if (!lsAvailable()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or private mode — IDB will still have the value.
  }
}

function lsRemove(key: string): void {
  if (!lsAvailable()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

// ── Zustand StateStorage adapter ────────────────────────────────────────────

/** Dev-only warning for storage operation failures. Helps spot quota /
 *  private-mode issues that would otherwise be silent in production.
 *
 * Skips on the server: `indexedDB` is `undefined` in Node, and the
 * resulting "IDB unavailable" rejection is the *expected* code path during
 * SSR — not something we want to spam in the dev console on every request. */
function warnDev(scope: string, op: "read" | "write" | "delete", name: string, err: unknown) {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "development") {
    console.warn(
      `[idb-storage] ${op}(${name}) ${scope} failed; continuing with fallback. Error:`,
      err,
    );
  }
}

/**
 * Drop-in `StateStorage` for `createJSONStorage(() => idbStorage)`. All
 * methods are async (matching the IDB API). On IDB failure, every method
 * degrades to localStorage so the store still works.
 */
export const idbStorage = {
  async getItem(name: string): Promise<string | null> {
    try {
      const idbValue = await idbGet(name);
      if (idbValue !== null) return idbValue;
    } catch (e) {
      warnDev("IDB read", "read", name, e);
    }
    // IDB empty or unavailable: try localStorage. If it has data, fire
    // a one-time hydration of IDB so the next read is faster.
    const lsValue = lsGet(name);
    if (lsValue !== null) {
      idbSet(name, lsValue).catch((e) => warnDev("hydration", "write", name, e));
    }
    return lsValue;
  },

  async setItem(name: string, value: string): Promise<void> {
    // Write to both, in parallel. Failures on either side are tolerated.
    await Promise.all([
      idbSet(name, value).catch((e) => warnDev("IDB write", "write", name, e)),
      Promise.resolve(lsSet(name, value)),
    ]);
  },

  async removeItem(name: string): Promise<void> {
    await Promise.all([
      idbRemove(name).catch((e) => warnDev("IDB delete", "delete", name, e)),
      Promise.resolve(lsRemove(name)),
    ]);
  },
};
