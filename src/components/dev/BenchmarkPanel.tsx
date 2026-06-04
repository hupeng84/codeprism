"use client";

import { useEffect, useState, useCallback } from "react";
import { getRecorder, type BenchmarkStats } from "@/lib/benchmark";

/**
 * Development-only floating panel showing live benchmark stats.
 *
 * Only mounts when:
 *  - `process.env.NODE_ENV === 'development'`
 *  - `localStorage.getItem('codeprism-bench') === '1'`
 *
 * Hidden by default — users opt in via the localStorage flag.
 */
export function BenchmarkPanel() {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState<Record<string, BenchmarkStats>>({});

  // Check mount conditions once on client
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem("codeprism-bench") !== "1") return;
    setVisible(true);
  }, []);

  // Subscribe to recorder updates and poll every 500ms
  useEffect(() => {
    if (!visible) return;

    const recorder = getRecorder();

    const poll = () => {
      setStats(recorder.getAllStats());
    };

    poll();
    const interval = setInterval(poll, 500);

    const unsub = recorder.subscribe(poll);

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [visible]);

  const handleReset = useCallback(() => {
    getRecorder().clear();
    setStats({});
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible) return null;

  const entries = Object.entries(stats).sort((a, b) => b[1].max - a[1].max);

  return (
    <div
      className="print-hide"
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 50,
        minWidth: 280,
        maxWidth: 360,
        maxHeight: "40vh",
        overflowY: "auto",
        borderRadius: 10,
        border: "1px solid var(--app-border)",
        background: "var(--app-bg-card)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        fontFamily: '"JetBrains Mono", ui-monospace, monospace',
        fontSize: 11,
        color: "var(--app-text-primary)",
        padding: "10px 12px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 12, letterSpacing: "-0.01em" }}>
          Benchmarks
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={handleReset}
            style={{
              background: "var(--app-bg-elevated)",
              color: "var(--app-text-secondary)",
              border: "1px solid var(--app-border)",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            Reset
          </button>
          <button
            onClick={handleClose}
            style={{
              background: "var(--app-bg-elevated)",
              color: "var(--app-text-secondary)",
              border: "1px solid var(--app-border)",
              borderRadius: 4,
              padding: "2px 8px",
              fontSize: 10,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Stats table */}
      {entries.length === 0 ? (
        <div style={{ color: "var(--app-text-tertiary)", padding: "8px 0" }}>
          No data yet…
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "var(--app-text-tertiary)" }}>
              <th style={{ textAlign: "left", padding: "2px 4px", fontWeight: 500 }}>Name</th>
              <th style={{ textAlign: "right", padding: "2px 4px", fontWeight: 500 }}>Avg</th>
              <th style={{ textAlign: "right", padding: "2px 4px", fontWeight: 500 }}>P95</th>
              <th style={{ textAlign: "right", padding: "2px 4px", fontWeight: 500 }}>Max</th>
              <th style={{ textAlign: "right", padding: "2px 4px", fontWeight: 500 }}>N</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, s]) => (
              <tr
                key={name}
                style={{
                  borderTop: "1px solid var(--app-border)",
                }}
              >
                <td style={{ padding: "3px 4px", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {name}
                </td>
                <td style={{ textAlign: "right", padding: "3px 4px", fontVariantNumeric: "tabular-nums" }}>
                  {s.avg.toFixed(2)}
                </td>
                <td style={{ textAlign: "right", padding: "3px 4px", fontVariantNumeric: "tabular-nums" }}>
                  {s.p95.toFixed(2)}
                </td>
                <td style={{ textAlign: "right", padding: "3px 4px", fontVariantNumeric: "tabular-nums" }}>
                  {s.max.toFixed(2)}
                </td>
                <td style={{ textAlign: "right", padding: "3px 4px" }}>
                  {s.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
