/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { VisualizerCanvas } from "./visualizer-canvas";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Create a Partial<CanvasRenderingContext2D> spy that tracks calls. */
function createMockCtx() {
  const calls: { method: string; args: unknown[] }[] = [];
  const handler: ProxyHandler<Partial<CanvasRenderingContext2D>> = {
    get(_target, prop) {
      if (prop === "__calls") return calls;
      return (...args: unknown[]) => {
        calls.push({ method: String(prop), args });
      };
    },
  };
  return new Proxy({} as Partial<CanvasRenderingContext2D>, handler);
}

// ── Mock getContext ──
let mockCtx: ReturnType<typeof createMockCtx>;

beforeEach(() => {
  mockCtx = createMockCtx();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  // Prevent real canvas operations from throwing in jsdom
  Object.defineProperty(window, "devicePixelRatio", { value: 1, writable: true, configurable: true });
});

// ── Tests ──────────────────────────────────────────────────────────────────

type RenderFn = (...args: unknown[]) => void;

describe("VisualizerCanvas", () => {
  const noopRender = vi.fn<RenderFn>(() => {});

  it("calls render on mount with the initial state", () => {
    const state = { step: 0 };
    render(<VisualizerCanvas render={noopRender} state={state} width={400} height={200} />);

    expect(noopRender).toHaveBeenCalledTimes(1);
    // Verify the arguments: ctx, state, width, height, theme
    const args = noopRender.mock.calls[0] as unknown[];
    expect(args[1]).toBe(state);
    expect(args[2]).toBe(400);
    expect(args[3]).toBe(200);
    expect(args[4]).toBe("dark"); // default theme
  });

  it("does not reallocate the buffer when re-rendering with the same state", () => {
    const state = { step: 0 };
    const { rerender } = render(
      <VisualizerCanvas render={noopRender} state={state} width={400} height={200} />,
    );

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const widthBefore = canvas.width;
    const heightBefore = canvas.height;

    // Re-render with the same state and dimensions
    rerender(<VisualizerCanvas render={noopRender} state={state} width={400} height={200} />);

    // The buffer should NOT have been re-allocated
    expect(canvas.width).toBe(widthBefore);
    expect(canvas.height).toBe(heightBefore);
  });

  it("reallocates the buffer when width changes", () => {
    const state = { step: 0 };
    const { rerender } = render(
      <VisualizerCanvas render={noopRender} state={state} width={400} height={200} />,
    );

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const widthBefore = canvas.width;

    // Re-render with a different width
    rerender(<VisualizerCanvas render={noopRender} state={state} width={600} height={200} />);

    // Width should have changed (buffer re-allocated)
    expect(canvas.width).not.toBe(widthBefore);
  });

  it("does NOT reallocate the buffer when only zoom changes", () => {
    const state = { step: 0 };
    const { rerender } = render(
      <VisualizerCanvas render={noopRender} state={state} width={400} height={200} zoom={1} />,
    );

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const widthBefore = canvas.width;
    const heightBefore = canvas.height;

    // Re-render with a different zoom value
    rerender(<VisualizerCanvas render={noopRender} state={state} width={400} height={200} zoom={1.5} />);

    // Buffer should NOT be re-allocated — only the context transform changes
    expect(canvas.width).toBe(widthBefore);
    expect(canvas.height).toBe(heightBefore);
  });

  it("sets the context transform to include zoom and pan", () => {
    const state = { step: 0 };
    render(
      <VisualizerCanvas
        render={noopRender}
        state={state}
        width={400}
        height={200}
        zoom={2}
        panOffset={{ x: 10, y: 20 }}
      />,
    );

    // Find setTransform calls in the mock context
    const allCalls = (mockCtx as unknown as { __calls: { method: string; args: unknown[] }[] }).__calls;
    const setTransformCalls = allCalls.filter(
      (c) => c.method === "setTransform",
    );

    // At least one setTransform call should include the zoom/pan values
    // DPR=1, zoom=2 → setTransform(2, 0, 0, 2, 10, 20)
    const userTransform = setTransformCalls.find(
      (c) => c.args[0] === 2 && c.args[4] === 10 && c.args[5] === 20,
    );
    expect(userTransform).toBeDefined();
  });

  it("removes CSS transform from the canvas element", () => {
    const state = { step: 0 };
    render(
      <VisualizerCanvas
        render={noopRender}
        state={state}
        width={400}
        height={200}
        zoom={2}
        panOffset={{ x: 10, y: 20 }}
      />,
    );

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    // CSS transform should NOT be set on the canvas element (zoom is handled via ctx)
    expect(canvas.style.transform).toBe("");
  });
});
