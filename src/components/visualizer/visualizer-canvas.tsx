"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The DPR scale is applied once per dimension change; the user zoom/pan
 * transform is applied per frame via `ctx.setTransform` and reset afterwards.
 */

interface VisualizerCanvasProps {
  render: (ctx: CanvasRenderingContext2D, state: unknown, width: number, height: number, theme: "dark" | "light") => void;
  state: unknown;
  width?: number;
  height?: number;
  zoom?: number;
  panOffset?: { x: number; y: number };
}

/** Snapshot of last-known canvas dimensions used to skip redundant buffer reallocation. */
interface DimSnapshot {
  dpr: number;
  w: number;
  h: number;
}

/**
 * Generic Canvas wrapper — handles DPR scaling, refs, and effect cleanup.
 * Automatically fills the parent container width on mobile (when no explicit width given).
 */
export function VisualizerCanvas({ render, state, width: propWidth, height = 340, zoom = 1, panOffset = { x: 0, y: 0 } }: VisualizerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [containerWidth, setContainerWidth] = useState(propWidth ?? 600);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  /** Last-known dimensions — when null the buffer has never been allocated. */
  const dimRef = useRef<DimSnapshot | null>(null);

  /** Last zoom/pan applied to the context (for identity check). */
  const lastTransformRef = useRef<{ zoom: number; px: number; py: number }>({ zoom: 1, px: 0, py: 0 });

  /** Stable render identity — avoids re-running the effect when the function ref changed but the body is the same. */
  const renderRef = useRef(render);
  renderRef.current = render;

  // ── Theme observer (unchanged) ──
  useEffect(() => {
    const getTheme = () => (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark";
    setTheme(getTheme());

    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // ── Responsive width measurement (unchanged) ──
  useEffect(() => {
    if (propWidth) {
      setContainerWidth(propWidth);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.min(entry.contentRect.width, 700);
      setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [propWidth]);

  const width = propWidth ?? containerWidth;

  // ── Effect A: dimension-only — re-allocate the backing buffer when DPR / width / height change ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || state == null) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const prev = dimRef.current;

    if (prev && prev.dpr === dpr && prev.w === width && prev.h === height) {
      // Dimensions unchanged — nothing to do here.
      return;
    }

    // Allocate (or re-allocate) the backing store.
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    dimRef.current = { dpr, w: width, h: height };
  }, [width, height, state]); // state included so we allocate on first mount (state != null)

  // ── Effect B: render-only — runs on every state / theme / zoom / pan change ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || state == null) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Ensure the buffer is sized (covers the edge-case where Effect A hasn't run yet).
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      dimRef.current = { dpr, w: width, h: height };
    }

    // Apply user zoom/pan via the canvas context transform.
    // `setTransform` replaces the current matrix (no cumulative scale).
    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, panOffset.x * dpr, panOffset.y * dpr);

    renderRef.current(ctx, state, width, height, theme);

    // Reset the transform back to identity so the next frame starts clean.
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    lastTransformRef.current = { zoom, px: panOffset.x, py: panOffset.y };
  }, [state, width, height, render, theme, zoom, panOffset.x, panOffset.y]);

  return (
    <div ref={containerRef} style={{ overflow: "hidden", width: propWidth ? width : "100%", maxWidth: 700, height, borderRadius: 12 }}>
      <canvas
        ref={canvasRef}
        style={{
          width,
          height,
          background: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
        }}
      />
    </div>
  );
}
