/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

// ── Mock BroadcastChannel ────────────────────────────────────────────────────
//
// jsdom doesn't ship BroadcastChannel. The mock below simulates peer-to-peer
// delivery: every MockBroadcastChannel registered under the same name sees
// the others' postMessage calls (minus the sender's own, matching browser
// behaviour).

class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  private listeners = new Set<(event: MessageEvent) => void>();
  static channels: Map<string, Set<MockBroadcastChannel>> = new Map();

  constructor(name: string) {
    this.name = name;
    let set = MockBroadcastChannel.channels.get(name);
    if (!set) {
      set = new Set();
      MockBroadcastChannel.channels.set(name, set);
    }
    set.add(this);
  }

  postMessage(data: unknown) {
    // Deliver to all other channels with the same name.
    const peers = MockBroadcastChannel.channels.get(this.name);
    if (!peers) return;
    const event = new MessageEvent("message", { data });
    for (const peer of peers) {
      if (peer === this) continue;
      if (peer.onmessage) peer.onmessage(event);
      for (const listener of peer.listeners) listener(event);
    }
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (type === "message") this.listeners.add(listener);
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (type === "message") this.listeners.delete(listener);
  }

  close() {
    MockBroadcastChannel.channels.get(this.name)?.delete(this);
  }
}

// Replace the global before importing the module under test.
vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

import { useProgressStore } from "@/components/visualizer/use-progress-store";
import { startProgressSync, useProgressSync } from "./progress-sync";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Reset the progress store to a known baseline between tests. */
function resetStore() {
  useProgressStore.setState({
    completed: {},
    favorites: {},
    lastVisited: {},
    achievements: {},
    lastUnlocked: null,
  });
}

// ── Setup / teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  resetStore();
  // Each test gets a fresh BroadcastChannel registry.
  MockBroadcastChannel.channels.clear();
});

afterEach(() => {
  // Clean up any channels still alive (defensive — startProgressSync's
  // returned teardown function should have already done this).
  MockBroadcastChannel.channels.clear();
  vi.restoreAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("startProgressSync", () => {
  it("opens a BroadcastChannel on the progress name", () => {
    expect(MockBroadcastChannel.channels.size).toBe(0);

    const stop = startProgressSync();

    const channels = MockBroadcastChannel.channels.get("codeprism-progress");
    expect(channels?.size).toBe(1);

    stop();
  });

  it("is idempotent — calling twice opens only one channel", () => {
    const stop1 = startProgressSync();
    const stop2 = startProgressSync();

    const channels = MockBroadcastChannel.channels.get("codeprism-progress");
    expect(channels?.size).toBe(1);

    stop1();
    stop2();
  });

  it("broadcasts the persistent slice when markCompleted runs in this tab", () => {
    const stop = startProgressSync();
    const peer = new MockBroadcastChannel("codeprism-progress");
    const received: unknown[] = [];
    peer.onmessage = (e) => received.push(e.data);

    // Trigger a state change in this tab.
    useProgressStore.getState().markCompleted("algorithm/bubble-sort");

    expect(received).toHaveLength(1);
    const msg = received[0] as { type: string; state: { completed: Record<string, boolean> } };
    expect(msg.type).toBe("state");
    expect(msg.state.completed).toEqual({ "algorithm/bubble-sort": true });

    stop();
  });

  it("does NOT include lastUnlocked in the broadcast payload", () => {
    const stop = startProgressSync();
    const peer = new MockBroadcastChannel("codeprism-progress");
    const received: unknown[] = [];
    peer.onmessage = (e) => received.push(e.data);

    // markCompleted sets lastUnlocked; we want to make sure that doesn't leak.
    useProgressStore.getState().markCompleted("algorithm/quick-sort");

    const msg = received[0] as { state: Record<string, unknown> };
    expect(msg.state).not.toHaveProperty("lastUnlocked");

    stop();
  });

  it("applies incoming state to the local store from another tab", () => {
    const stop = startProgressSync();

    // Simulate Tab A broadcasting its state to us.
    const peerA = new MockBroadcastChannel("codeprism-progress");
    peerA.postMessage({
      type: "state",
      tabId: "tab-A",
      state: {
        completed: { "algorithm/merge-sort": true },
        favorites: { "pattern/observer": true },
        lastVisited: { "structure/bst": 1234 },
        achievements: { "first-step": 1000 },
      },
    });

    const state = useProgressStore.getState();
    expect(state.completed).toEqual({ "algorithm/merge-sort": true });
    expect(state.favorites).toEqual({ "pattern/observer": true });
    expect(state.lastVisited).toEqual({ "structure/bst": 1234 });
    expect(state.achievements).toEqual({ "first-step": 1000 });

    stop();
  });

  it("does NOT fire the achievement toast in the receiving tab (lastUnlocked stays null)", () => {
    const stop = startProgressSync();

    const peerA = new MockBroadcastChannel("codeprism-progress");
    peerA.postMessage({
      type: "state",
      tabId: "tab-A",
      state: {
        completed: { "algorithm/heap-sort": true },
        favorites: {},
        lastVisited: {},
        achievements: { "first-step": 1000 },
      },
    });

    // lastUnlocked is transient — receiving remote state must not set it.
    expect(useProgressStore.getState().lastUnlocked).toBeNull();

    stop();
  });

  it("ignores messages with our own tabId (defensive against self-echo)", () => {
    const stop = startProgressSync();
    const ourTabId = sessionStorage.getItem("codeprism-tab-id");
    expect(ourTabId).toBeTruthy();

    const peerSelf = new MockBroadcastChannel("codeprism-progress");
    peerSelf.postMessage({
      type: "state",
      tabId: ourTabId!,
      state: {
        completed: { "pattern/singleton": true },
        favorites: {},
        lastVisited: {},
        achievements: {},
      },
    });

    // The state should not have been applied (this would only happen if
    // the receiver somehow reflected its own message).
    expect(useProgressStore.getState().completed).toEqual({});

    stop();
  });

  it("does not echo back: a received message does not trigger a new broadcast", () => {
    const stop = startProgressSync();
    const peerA = new MockBroadcastChannel("codeprism-progress");
    const sentToA: unknown[] = [];
    peerA.onmessage = (e) => sentToA.push(e.data);

    // Tab A sends us a state update.
    peerA.postMessage({
      type: "state",
      tabId: "tab-A",
      state: {
        completed: { "graph/bfs": true },
        favorites: {},
        lastVisited: {},
        achievements: {},
      },
    });

    // Give microtasks a chance to run.
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // We should NOT have sent a message back to A (no loop).
        expect(sentToA).toHaveLength(0);
        stop();
        resolve();
      }, 0);
    });
  });

  it("survives a local state change after receiving a remote one (no leak)", () => {
    const stop = startProgressSync();
    const peerA = new MockBroadcastChannel("codeprism-progress");
    const sentToA: unknown[] = [];
    peerA.onmessage = (e) => sentToA.push(e.data);

    // 1. Receive from A.
    peerA.postMessage({
      type: "state",
      tabId: "tab-A",
      state: {
        completed: { "graph/dfs": true },
        favorites: {},
        lastVisited: {},
        achievements: {},
      },
    });

    // 2. Then make a local change.
    useProgressStore.getState().markCompleted("graph/dijkstra");

    // Only the local change should have been broadcast (1 message, the
    // local one). The remote-apply phase must not have posted.
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(sentToA).toHaveLength(1);
        const msg = sentToA[0] as { state: { completed: Record<string, boolean> } };
        expect(msg.state.completed).toEqual({
          "graph/dfs": true, // from A
          "graph/dijkstra": true, // from us
        });
        stop();
        resolve();
      }, 0);
    });
  });

  it("teardown closes the channel and stops broadcasting", () => {
    const stop = startProgressSync();
    const peerA = new MockBroadcastChannel("codeprism-progress");
    const sentToA: unknown[] = [];
    peerA.onmessage = (e) => sentToA.push(e.data);

    stop();

    // After teardown, local changes should NOT broadcast.
    useProgressStore.getState().markCompleted("search/binary-search");

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(sentToA).toHaveLength(0);
        resolve();
      }, 0);
    });
  });
});

describe("useProgressSync (React hook)", () => {
  it("starts the channel on mount and tears it down on unmount", () => {
    const { unmount } = renderHook(() => useProgressSync());

    const channels = MockBroadcastChannel.channels.get("codeprism-progress");
    expect(channels?.size).toBe(1);

    unmount();

    expect(MockBroadcastChannel.channels.get("codeprism-progress")?.size ?? 0).toBe(0);
  });

  it("is safe under StrictMode-style double mount (single channel)", () => {
    // Render two hooks independently (simulating StrictMode double-invoke).
    const { unmount: u1 } = renderHook(() => useProgressSync());
    const { unmount: u2 } = renderHook(() => useProgressSync());

    const channels = MockBroadcastChannel.channels.get("codeprism-progress");
    expect(channels?.size).toBe(1);

    u1();
    u2();
  });
});
