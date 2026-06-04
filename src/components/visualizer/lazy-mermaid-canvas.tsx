"use client";

/**
 * Lazy Mermaid UML canvas. The real `MermaidUMLCanvas` (and its ~200 KB
 * `mermaid` + `react-x-mermaid` payload) is dynamically imported so it is
 * only loaded when the user actually opens a pattern page or switches
 * to the UML tab. Algorithm / structure / search pages never pay the cost.
 *
 * Wrapped in an ErrorBoundary so a failed import (chunk 404, network
 * glitch, ESM evaluation error) surfaces a visible "couldn't load
 * diagram" state instead of an empty region that the user can't act on.
 */

import { Component, type ErrorInfo, type ReactNode, Suspense } from "react";
import dynamic from "next/dynamic";
import type { UMLClassDiagram } from "@codeprism/core";

const MermaidCanvasDynamic = dynamic(
  () =>
    import("./MermaidUMLCanvas").then((m) => ({ default: m.MermaidUMLCanvas })),
  {
    ssr: false,
    loading: () => null,
  },
);

interface LazyMermaidUMLCanvasProps {
  diagram: UMLClassDiagram;
  zoom?: number;
}

export function LazyMermaidUMLCanvas(props: LazyMermaidUMLCanvasProps) {
  return (
    <MermaidLoadErrorBoundary>
      <Suspense fallback={<MermaidFallback />}>
        <MermaidCanvasDynamic {...props} />
      </Suspense>
    </MermaidLoadErrorBoundary>
  );
}

/**
 * Catches errors thrown by the dynamic import (e.g. chunk fetch failure
 * on a stale build, mermaid module evaluation error) and shows a
 * recoverable fallback instead of an empty container.
 */
class MermaidLoadErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, _info: ErrorInfo) {
    // Surface in the dev console so the dev can find it quickly.
    // eslint-disable-next-line no-console
    console.error("LazyMermaidUMLCanvas: failed to load", err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="h-full w-full flex flex-col items-center justify-center bg-bg-deep text-text-tertiary text-sm gap-3 p-6"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "rgba(248,113,113,0.10)",
              border: "1px solid rgba(248,113,113,0.25)",
            }}
            aria-hidden="true"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F87171"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="text-sm font-medium text-text-primary text-center">
            Couldn’t load UML diagram
          </div>
          <p className="text-xs text-text-tertiary text-center max-w-xs">
            {this.state.message || "The diagram bundle failed to load."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="mt-2 px-3 py-1.5 text-xs rounded-md text-text-primary bg-bg-glass-light hover:bg-bg-glass-medium transition-colors"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Skeleton shown while Mermaid is being fetched / initialized.
 * Matches the dark/light theme tokens so it blends with the page chrome.
 */
function MermaidFallback() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-bg-deep text-text-tertiary text-sm gap-3">
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 border-2 border-border border-t-[#FF6B6B] rounded-full animate-spin"
          aria-hidden="true"
        />
        <span>Loading UML diagram…</span>
      </div>
      <p className="text-[11px] text-text-tertiary/70 max-w-xs text-center">
        Mermaid (~200 KB) is being downloaded on demand.
      </p>
    </div>
  );
}
