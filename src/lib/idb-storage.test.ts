/* @vitest-environment jsdom */
import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { idbStorage } from "./idb-storage";

const KEY = "codeprism-progress";

/**
 * Reset between tests. Clears localStorage and the `kv` object store so each
 * test starts from a known state. Uses `objectStore.clear()` rather than
 * `deleteDatabase` because fake-indexeddb can block on a delete when other
 * connections (from earlier tests' cleanup) are still in the process of
 * closing — a clear() is always safe and immediate.
 */
function resetStorage() {
  localStorage.clear();
  return new Promise<void>((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve();
      return;
    }
    const req = indexedDB.open("codeprism", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv");
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      try {
        const tx = db.transaction("kv", "readwrite");
        tx.objectStore("kv").clear();
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          resolve();
        };
      } catch {
        db.close();
        resolve();
      }
    };
    req.onerror = () => resolve();
  });
}

/** Write directly to IDB, bypassing the adapter. Handles the upgrade path
 *  in case the test environment hasn't seen the DB before. */
function rawIdbPut(value: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("codeprism", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) {
        db.createObjectStore("kv");
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction("kv", "readwrite");
      tx.objectStore("kv").put(value, KEY);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };
    req.onerror = () => reject(req.error);
  });
}

beforeEach(async () => {
  await resetStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ── Basic CRUD ────────────────────────────────────────────────────────────

describe("idbStorage — basic CRUD", () => {
  it("returns null for a missing key", async () => {
    expect(await idbStorage.getItem(KEY)).toBeNull();
  });

  it("round-trips a value", async () => {
    await idbStorage.setItem(KEY, "hello");
    expect(await idbStorage.getItem(KEY)).toBe("hello");
  });

  it("overwrites an existing value", async () => {
    await idbStorage.setItem(KEY, "first");
    await idbStorage.setItem(KEY, "second");
    expect(await idbStorage.getItem(KEY)).toBe("second");
  });

  it("removes a value", async () => {
    await idbStorage.setItem(KEY, "doomed");
    await idbStorage.removeItem(KEY);
    expect(await idbStorage.getItem(KEY)).toBeNull();
  });
});

// ── localStorage mirror ──────────────────────────────────────────────────

describe("idbStorage — localStorage mirror", () => {
  it("mirrors setItem writes to localStorage", async () => {
    await idbStorage.setItem(KEY, "mirrored");
    expect(localStorage.getItem(KEY)).toBe("mirrored");
  });

  it("mirrors removeItem to localStorage", async () => {
    await idbStorage.setItem(KEY, "present");
    expect(localStorage.getItem(KEY)).toBe("present");
    await idbStorage.removeItem(KEY);
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});

// ── First-read hydration ─────────────────────────────────────────────────

describe("idbStorage — first-read migration from localStorage", () => {
  it("returns localStorage value when IDB is empty", async () => {
    // Simulate an existing user who only has data in localStorage.
    localStorage.setItem(KEY, "from-legacy");
    const value = await idbStorage.getItem(KEY);
    expect(value).toBe("from-legacy");
  });

  it("hydrates IDB from localStorage on first read (fire-and-forget)", async () => {
    localStorage.setItem(KEY, "legacy-data");
    await idbStorage.getItem(KEY);

    // Fire-and-forget hydration is async — wait a tick.
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Read directly from IDB to confirm hydration happened.
    const idbValue = await new Promise<string | null>((resolve, reject) => {
      const req = indexedDB.open("codeprism", 1);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction("kv", "readonly");
        const r = tx.objectStore("kv").get(KEY);
        r.onsuccess = () => {
          db.close();
          resolve((r.result as string | undefined) ?? null);
        };
        r.onerror = () => {
          db.close();
          reject(r.error);
        };
      };
      req.onerror = () => reject(req.error);
    });
    expect(idbValue).toBe("legacy-data");
  });

  it("prefers IDB over localStorage when they diverge", async () => {
    // Set up "IDB has X, LS has Y" via a direct IDB write (bypassing the
    // adapter, which would otherwise keep them in sync).
    await rawIdbPut("fresh-from-idb");
    localStorage.setItem(KEY, "stale-in-ls");

    expect(await idbStorage.getItem(KEY)).toBe("fresh-from-idb");
  });
});

// ── Failure tolerance ────────────────────────────────────────────────────

describe("idbStorage — failure tolerance", () => {
  it("still works when localStorage throws on write", async () => {
    // Stub localStorage with a throwing impl. The adapter must swallow
    // the errors and keep writing to IDB.
    const stub = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error("QuotaExceeded");
      }),
      removeItem: vi.fn(() => {
        throw new Error("Disabled");
      }),
    };
    vi.stubGlobal("localStorage", stub);

    // setItem should still complete (IDB write succeeds, LS write is caught).
    await expect(idbStorage.setItem(KEY, "x")).resolves.toBeUndefined();

    // getItem: IDB has the value, returns it. LS is consulted for fallback
    // only when IDB is null, but IDB has 'x' so we never hit the LS path.
    expect(await idbStorage.getItem(KEY)).toBe("x");
  });

  it("falls back to localStorage when IDB is empty after delete", async () => {
    // First write to localStorage only.
    localStorage.setItem(KEY, "from-ls");

    // Delete the IDB to force a "empty" state. Subsequent getItem will
    // see IDB returns null and fall through to localStorage.
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase("codeprism");
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });

    expect(await idbStorage.getItem(KEY)).toBe("from-ls");
  });
});
