"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { Frame, TableState } from "@codeprism/core";
import { renderTableState } from "@codeprism/core";

interface TableCanvasProps {
  frames: Frame<TableState>[];
}

/**
 * Canvas component for rendering 2D DP table visualizations.
 * Uses the same generic canvas pattern as VisualizerCanvas but specialized for TableState.
 * Adapts cell size to fit the canvas; the canvas itself is responsive.
 */
export function TableCanvas({ frames }: TableCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  // Use the last frame as default, or first frame
  const currentFrame = frames.length > 0 ? frames[frames.length - 1] : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !currentFrame) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Measure container width, use fixed height
    const width = container ? container.clientWidth : 700;
    const height = 380;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    renderTableState(ctx, currentFrame.state, width, height);
  }, [currentFrame]);

  if (!currentFrame) {
    return (
      <div ref={containerRef} className="w-full" style={{ height: 380 }}>
        <div className="flex items-center justify-center h-full rounded-xl bg-bg-glass-light text-text-tertiary text-sm">
          {t("reference.tableCanvas.clickPlay")}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 380,
          borderRadius: 12,
          background: "rgba(255,255,255,0.03)",
        }}
      />
    </div>
  );
}
