"use client";

import { useMemo, useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { startMeasure, endMeasure } from "@/lib/benchmark";
import type { UMLClassDiagram, UMLRelationship } from "@codeprism/core";
import mermaid from "mermaid";

// ============================================================
// Theme configuration — matched to the app's design system
// (see src/app/globals.css :root and [data-theme="light"])
// ============================================================

type ThemeMode = "dark" | "light";

/** Mermaid theme variables — surfaces, class box, edges, fonts. */
const MERMAID_THEME: Record<ThemeMode, Record<string, string>> = {
  dark: {
    // Surfaces
    background: "#0B0E17",
    primaryColor: "#1E2740",
    primaryTextColor: "#E8ECF4",
    primaryBorderColor: "#A78BFA",
    secondaryColor: "#161C2C",
    tertiaryColor: "#111622",

    // Class box
    classText: "#E8ECF4",
    classBoxBackgroundColor: "#161C2C",
    classBoxBorderColor: "#2A3550",
    classBoxBorderWidth: "1.5px",
    classBoxBorderRadius: "10px",
    classBoxTextColor: "#E8ECF4",
    classBoxFontFamily: '"DM Sans", system-ui, sans-serif',
    classBoxFontSize: "13px",
    classBoxFontWeight: "500",

    // Class title (the bold class name row)
    classTitleTextColor: "#FFFFFF",
    classTitleFontSize: "14px",
    classTitleFontWeight: "700",

    // Attributes / methods body
    classAttributeTextColor: "#E8ECF4",
    classAttributeLabelColor: "#8892A8",
    classAttributeLabelBackground: "transparent",
    classAttributeFontSize: "12px",

    // Stereotype label («interface», «abstract»)
    classLabelColor: "#A78BFA",
    classLabelBackgroundColor: "transparent",
    classLabelFontSize: "11px",
    classLabelFontStyle: "italic",

    // Edges
    lineColor: "#5A6480",
    edgeLabelBackground: "#0B0E17",
    edgeLabelColor: "#8892A8",

    // Notes
    noteTextColor: "#E8ECF4",
    noteBkgColor: "#1E2740",
    noteBorderColor: "#2A3550",

    // Defaults
    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: "13px",
  },
  light: {
    background: "#FFFFFF",
    primaryColor: "#FFFFFF",
    primaryTextColor: "#0F172A",
    primaryBorderColor: "#7C3AED",
    secondaryColor: "#F1F5F9",
    tertiaryColor: "#E2E8F0",

    classText: "#0F172A",
    classBoxBackgroundColor: "#FFFFFF",
    classBoxBorderColor: "#CBD5E1",
    classBoxBorderWidth: "1.5px",
    classBoxBorderRadius: "10px",
    classBoxTextColor: "#0F172A",
    classBoxFontFamily: '"DM Sans", system-ui, sans-serif',
    classBoxFontSize: "13px",
    classBoxFontWeight: "500",

    classTitleTextColor: "#0F172A",
    classTitleFontSize: "14px",
    classTitleFontWeight: "700",

    classAttributeTextColor: "#0F172A",
    classAttributeLabelColor: "#64748B",
    classAttributeLabelBackground: "transparent",
    classAttributeFontSize: "12px",

    classLabelColor: "#7C3AED",
    classLabelBackgroundColor: "transparent",
    classLabelFontSize: "11px",
    classLabelFontStyle: "italic",

    lineColor: "#94A3B8",
    edgeLabelBackground: "#FFFFFF",
    edgeLabelColor: "#475569",

    noteTextColor: "#0F172A",
    noteBkgColor: "#F8FAFC",
    noteBorderColor: "#CBD5E1",

    fontFamily: '"DM Sans", system-ui, sans-serif',
    fontSize: "13px",
  },
};

/**
 * Relationship type metadata — used in the diagram legend so users can
 * recognise the different arrow styles (Mermaid draws them natively).
 *
 * Note: Mermaid 11 removed the per-edge `linkStyle` syntax (it parses
 * `linkStyle 0 stroke:...` as a class declaration and errors with
 * "Expecting 'NEWLINE', 'EOF', got 'LABEL'"). There is currently no
 * supported way to colour an individual relationship edge in classDiagram
 * — confirmed in mermaid-js/mermaid#6933. The single `lineColor` theme
 * variable colours every edge uniformly. Per-type colours would need a
 * fork or post-render SVG patch.
 */
const RELATIONSHIP_META: Record<UMLRelationship["type"], { label: string }> = {
  extends:     { label: "extends" },
  implements:  { label: "implements" },
  composition: { label: "composition" },
  aggregation: { label: "aggregation" },
  association: { label: "association" },
  dependency:  { label: "dependency" },
};

/**
 * The Mermaid arrow glyph for each relationship type — shown in the
 * diagram legend so users can recognise the syntax that produced it.
 * Mermaid draws these natively; we just need to surface the mapping.
 */
const RELATIONSHIP_ARROW: Record<UMLRelationship["type"], string> = {
  extends:     "──▷|",
  implements:  "─ ─▷|",
  composition: "◆──▷",
  aggregation: "◇──▷",
  association: "──▷",
  dependency:  "─ ─▷",
};

// ============================================================
// Helpers
// ============================================================

/** Convert visibility symbol to Mermaid notation */
function visibility(v: string): string {
  return v === "+" ? "+" : v === "-" ? "-" : v === "#" ? "#" : "~";
}

interface MermaidOptions {
  direction: "TB" | "LR";
}

/** Convert UMLClassDiagram to Mermaid class diagram syntax */
function diagramToMermaid(diagram: UMLClassDiagram, options: MermaidOptions): string {
  const lines: string[] = ["classDiagram", `    direction ${options.direction}`];

  // Define classes
  for (const cls of diagram.classes) {
    lines.push(`    class ${cls.name} {`);

    // Stereotype (inside class body)
    if (cls.stereotype) {
      const stereotype = cls.stereotype.replace(/[«»]/g, (m) => (m === "«" ? "<<" : ">>"));
      lines.push(`        ${stereotype}`);
    }

    // Attributes
    for (const attr of cls.attributes) {
      lines.push(`        ${visibility(attr.visibility)}${attr.type} ${attr.name}`);
    }

    // Methods
    for (const method of cls.methods) {
      const params = method.params || "";
      lines.push(`        ${visibility(method.visibility)}${method.name}(${params}) ${method.returnType}`);
    }

    lines.push("    }");
  }

  // Define relationships
  for (const rel of diagram.relationships) {
    let arrow = "--";
    switch (rel.type) {
      case "extends":     arrow = "<|--"; break;
      case "implements":  arrow = "<|.."; break;
      case "composition": arrow = "*--";  break;
      case "aggregation": arrow = "o--";  break;
      case "dependency":  arrow = "..>"; break;
      case "association":
      default:            arrow = "-->"; break;
    }

    // Add multiplicity if present
    let relLine = `    ${rel.from} ${arrow} ${rel.to}`;
    if (rel.fromMultiplicity || rel.toMultiplicity) {
      const fromMult = rel.fromMultiplicity ? `"${rel.fromMultiplicity}" ` : "";
      const toMult = rel.toMultiplicity ? ` "${rel.toMultiplicity}"` : "";
      relLine = `    ${rel.from} ${fromMult}${arrow}${toMult} ${rel.to}`;
    }

    if (rel.label) relLine += ` : ${rel.label}`;
    lines.push(relLine);
  }

  return lines.join("\n");
}

function getCurrentTheme(): ThemeMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

// ============================================================
// Component
// ============================================================

interface MermaidUMLCanvasProps {
  diagram: UMLClassDiagram;
  zoom?: number;
}

/**
 * MermaidUMLCanvas — renders a UML class diagram using Mermaid.js.
 * Polished for the CodePrism design system: theme-aware (light/dark),
 * accent-colored relationship edges, header / legend chrome, dot-grid
 * backdrop, direction toggle, and copy-source affordances.
 */
export function MermaidUMLCanvas({ diagram, zoom = 1 }: MermaidUMLCanvasProps) {
  const t = useTranslations();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [direction, setDirection] = useState<"TB" | "LR">("TB");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // ── Track theme via data-theme attribute on <html> ──
  useEffect(() => {
    setTheme(getCurrentTheme());
    const observer = new MutationObserver(() => setTheme(getCurrentTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // ── Initialize mermaid with the current theme ──
  useEffect(() => {
    if (typeof window === "undefined") return;
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: MERMAID_THEME[theme],
      securityLevel: "loose",
      fontFamily: MERMAID_THEME[theme].fontFamily,
    });
  }, [theme]);

  // ── Distinct relationship types in the diagram (for the legend) ──
  const relationshipTypes = useMemo<UMLRelationship["type"][]>(() => {
    const seen: UMLRelationship["type"][] = [];
    for (const rel of diagram.relationships) {
      if (!seen.includes(rel.type)) seen.push(rel.type);
    }
    return seen;
  }, [diagram.relationships]);

  // ── Generated Mermaid source ──
  const mermaidCode = useMemo(
    () => diagramToMermaid(diagram, { direction }),
    [diagram, direction],
  );

  // ── Render mermaid (re-runs on theme or source change) ──
  useEffect(() => {
    let cancelled = false;
    const renderDiagram = async () => {
      if (!containerRef.current || !mermaidCode) return;
      setIsLoading(true);
      try {
        const uniqueId = `mermaid-uml-${Date.now()}`;
        startMeasure("mermaid.render");
        try {
          const { svg, bindFunctions } = await mermaid.render(uniqueId, mermaidCode);
          if (cancelled) return;
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            // Mermaid 11 emits SVG with only a `viewBox` attribute — the
            // root <svg> has no intrinsic size, so in a flex container
            // it collapses to 0×0. Force a non-zero size so the layout
            // is stable; CSS `width: 100% / height: 100%` will then
            // size the box and `preserveAspectRatio` (set by Mermaid)
            // will scale the actual content.
            const rootSvg = containerRef.current.querySelector("svg");
            if (rootSvg instanceof SVGSVGElement) {
              rootSvg.setAttribute("width", "100%");
              rootSvg.setAttribute("height", "100%");
            }
            if (bindFunctions) {
              setTimeout(() => {
                if (containerRef.current) bindFunctions(containerRef.current);
              }, 0);
            }
          }
          setError("");
        } finally {
          // Always end the measure, even on cancellation or render error.
          endMeasure("mermaid.render");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Mermaid rendering error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        // Always clear the loading state, even if the effect was torn
        // down mid-render. Otherwise a cancelled-then-cancelled-again
        // race would leave the loading overlay covering the SVG forever.
        setIsLoading(false);
      }
    };
    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [mermaidCode, theme]);

  // ── Reset pan when external zoom changes ──
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [zoom]);

  // ── Drag handlers (attached to the drag area, not the chrome) ──
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleResetPosition = useCallback(() => setPosition({ x: 0, y: 0 }), []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [mermaidCode]);

  const handleRetry = useCallback(() => {
    setError("");
    // Bounce direction to force a re-render through mermaidCode memo.
    setDirection((d) => d);
  }, []);

  const isDark = theme === "dark";

  // Theme-aware color tokens for the chrome
  const colors = {
    surface: isDark
      ? "linear-gradient(135deg, #0B0E17 0%, #111622 50%, #0B0E17 100%)"
      : "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #F8FAFC 100%)",
    headerBg: isDark ? "rgba(11,14,23,0.55)" : "rgba(255,255,255,0.65)",
    headerBorder: isDark ? "rgba(167,139,250,0.18)" : "rgba(15,23,42,0.08)",
    textPrimary: isDark ? "#E8ECF4" : "#0F172A",
    textSecondary: isDark ? "#8892A8" : "#64748B",
    textMuted: isDark ? "#5A6480" : "#94A3B8",
    accent: isDark ? "#A78BFA" : "#7C3AED",
    toolbarBg: isDark ? "rgba(22,28,44,0.9)" : "rgba(255,255,255,0.9)",
    toolbarBorder: isDark ? "#2A3550" : "#E2E8F0",
    toolbarHover: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
  };

  // Dot grid + radial accent glow (theme-aware)
  const gridDot = isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.07)";
  const gridGlow = isDark ? "rgba(167,139,250,0.07)" : "rgba(167,139,250,0.05)";

  // ── Empty state ──
  if (diagram.classes.length === 0) {
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-xl"
        style={{
          background: colors.surface,
          boxShadow: "0 2px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="text-center px-6">
          <div
            className="mx-auto mb-3 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: isDark ? "rgba(167,139,250,0.10)" : "rgba(124,58,237,0.08)",
              border: `1px solid ${isDark ? "rgba(167,139,250,0.2)" : "rgba(124,58,237,0.2)"}`,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="6" rx="1" />
              <rect x="14" y="3" width="7" height="6" rx="1" />
              <rect x="3" y="15" width="7" height="6" rx="1" />
              <rect x="14" y="15" width="7" height="6" rx="1" />
            </svg>
          </div>
          <div className="text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
            No classes to display
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            This diagram has no classes yet.
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-xl"
        style={{
          background: colors.surface,
          boxShadow: "0 2px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="text-center max-w-sm px-6">
          <div
            className="mx-auto mb-3 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(248,113,113,0.10)",
              border: "1px solid rgba(248,113,113,0.25)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="text-sm font-medium mb-1" style={{ color: colors.textPrimary }}>
            {t("reference.uml.renderFailed")}
          </div>
          <div
            className="text-[11px] mb-4 font-mono break-words px-3 py-2 rounded-md"
            style={{
              color: "#F87171",
              background: isDark ? "rgba(248,113,113,0.06)" : "rgba(248,113,113,0.05)",
              border: "1px solid rgba(248,113,113,0.15)",
            }}
          >
            {error}
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
            style={{
              background: isDark ? "rgba(248,113,113,0.12)" : "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.3)",
              color: "#F87171",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(248,113,113,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark
                ? "rgba(248,113,113,0.12)"
                : "rgba(248,113,113,0.08)";
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full rounded-xl overflow-hidden relative flex flex-col"
      style={{
        background: colors.surface,
        boxShadow: "0 2px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        color: colors.textPrimary,
      }}
    >
      <style>{`
        .mermaid-uml-wrap {
          position: relative;
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-image:
            radial-gradient(circle, ${gridDot} 1px, transparent 1px),
            radial-gradient(circle at center, ${gridGlow} 0%, transparent 60%);
          background-size: 24px 24px, 100% 100%;
          background-position: 0 0, 0 0;
          overflow: hidden;
          cursor: ${isDragging ? "grabbing" : "grab"};
          user-select: none;
          animation: umlFadeIn 0.3s var(--ease-out, ease-out);
        }
        @keyframes umlFadeIn {
          from { opacity: 0; transform: scale(0.99); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes umlSpin {
          to { transform: rotate(360deg); }
        }
        .uml-spinner {
          animation: umlSpin 0.8s linear infinite;
        }
        .mermaid-uml-svg {
          padding: 24px;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
          box-sizing: border-box;
        }
        .mermaid-uml-svg svg {
          /* Mermaid 11 emits an SVG with only a viewBox (no intrinsic
             width/height). Earlier versions set width/height inline
             which our previous "width: auto" rule used to rely on.
             Force the SVG to fill the wrapper; the preserveAspectRatio
             attribute Mermaid sets handles the actual content scaling. */
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          display: block;
        }
        /* Mermaid output polish — enforce our font on the SVG text */
        .mermaid-uml-svg svg text,
        .mermaid-uml-svg svg .nodeLabel,
        .mermaid-uml-svg svg .edgeLabel {
          font-family: "DM Sans", system-ui, sans-serif !important;
        }
        .mermaid-uml-svg svg .classTitle text,
        .mermaid-uml-svg svg .classTitle span {
          font-family: "Sora", "DM Sans", system-ui, sans-serif !important;
          letter-spacing: 0.01em;
        }
        /* Hover affordance on the class boxes (mermaid wraps them in <g>) */
        .mermaid-uml-svg svg .classGroup rect {
          transition: filter 0.2s ease, stroke 0.2s ease;
        }
        .mermaid-uml-svg svg .classGroup:hover rect {
          filter: brightness(1.08);
        }
        .uml-toolbar-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          font-size: 11px;
          font-family: "JetBrains Mono", ui-monospace, monospace;
          border-radius: 6px;
          background: transparent;
          color: ${colors.textSecondary};
          transition: background 0.15s ease, color 0.15s ease;
          cursor: pointer;
          border: 0;
        }
        .uml-toolbar-btn:hover {
          background: ${colors.toolbarHover};
          color: ${colors.textPrimary};
        }
        .uml-toolbar-btn.is-success {
          color: #4ECDC4;
        }
      `}</style>

      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b"
        style={{
          borderColor: colors.headerBorder,
          background: colors.headerBg,
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{
              background: isDark ? "rgba(167,139,250,0.12)" : "rgba(124,58,237,0.08)",
              border: `1px solid ${isDark ? "rgba(167,139,250,0.22)" : "rgba(124,58,237,0.20)"}`,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="6" rx="1" />
              <rect x="14" y="3" width="7" height="6" rx="1" />
              <rect x="3" y="15" width="7" height="6" rx="1" />
              <rect x="14" y="15" width="7" height="6" rx="1" />
              <line x1="10" y1="6" x2="14" y2="6" />
              <line x1="10" y1="18" x2="14" y2="18" />
              <line x1="6.5" y1="9" x2="6.5" y2="15" />
              <line x1="17.5" y1="9" x2="17.5" y2="15" />
            </svg>
          </span>
          <span
            className="text-sm font-semibold truncate"
            style={{ fontFamily: '"Sora", system-ui, sans-serif', letterSpacing: "-0.005em" }}
          >
            UML Class Diagram
          </span>
        </div>
        <div
          className="flex items-center gap-2.5 text-[11px] shrink-0"
          style={{ color: colors.textSecondary }}
        >
          <span className="flex items-center gap-1.5">
            <span
              className="font-mono font-semibold px-1.5 py-0.5 rounded"
              style={{
                color: colors.textPrimary,
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
              }}
            >
              {diagram.classes.length}
            </span>
            <span>classes</span>
          </span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span className="flex items-center gap-1.5">
            <span
              className="font-mono font-semibold px-1.5 py-0.5 rounded"
              style={{
                color: colors.textPrimary,
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)",
              }}
            >
              {diagram.relationships.length}
            </span>
            <span>relations</span>
          </span>
        </div>
      </div>

      {/* ── Drag area ── */}
      <div
        className="mermaid-uml-wrap"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={containerRef}
          className="mermaid-uml-svg"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              background: isDark ? "rgba(11,14,23,0.5)" : "rgba(255,255,255,0.5)",
              backdropFilter: "blur(2px)",
            }}
          >
            <div
              className="px-3 py-2 rounded-lg text-xs flex items-center gap-2"
              style={{
                background: isDark ? "rgba(22,28,44,0.92)" : "rgba(255,255,255,0.92)",
                border: `1px solid ${colors.toolbarBorder}`,
                color: colors.textSecondary,
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}
            >
              <span
                className="uml-spinner w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: isDark ? "rgba(167,139,250,0.25)" : "rgba(124,58,237,0.25)",
                  borderTopColor: colors.accent,
                  borderRightColor: colors.accent,
                }}
              />
              <span>Rendering…</span>
            </div>
          </div>
        )}

        {/* Floating mini-toolbar (top-right) */}
        <div
          className="absolute top-2 right-2 flex items-center gap-0.5 p-0.5 rounded-lg"
          style={{
            background: colors.toolbarBg,
            border: `1px solid ${colors.toolbarBorder}`,
            backdropFilter: "blur(10px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setDirection((d) => (d === "TB" ? "LR" : "TB"))}
            className="uml-toolbar-btn"
            title="Toggle layout direction"
            aria-label={`Layout direction: ${direction === "TB" ? "top to bottom" : "left to right"}`}
          >
            {direction === "TB" ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="4" x2="12" y2="20" />
                <polyline points="6 14 12 20 18 14" />
                <line x1="5" y1="4" x2="19" y2="4" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="4" y1="12" x2="20" y2="12" />
                <polyline points="14 6 20 12 14 18" />
                <line x1="4" y1="5" x2="4" y2="19" />
              </svg>
            )}
            <span>{direction}</span>
          </button>
          <span
            className="mx-0.5"
            style={{ width: 1, height: 14, background: colors.toolbarBorder }}
            aria-hidden="true"
          />
          <button
            onClick={handleCopy}
            className={`uml-toolbar-btn ${isCopied ? "is-success" : ""}`}
            title="Copy Mermaid source"
            aria-label="Copy diagram source"
          >
            {isCopied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Reset pan button (bottom-right, only when panned) */}
        {(position.x !== 0 || position.y !== 0) && (
          <button
            onClick={handleResetPosition}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute bottom-3 right-3 px-2.5 py-1.5 text-[11px] font-mono rounded-md flex items-center gap-1.5 transition-colors"
            style={{
              background: colors.toolbarBg,
              border: `1px solid ${colors.toolbarBorder}`,
              color: colors.textSecondary,
              backdropFilter: "blur(10px)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            }}
            title="Reset pan position"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.textPrimary;
              e.currentTarget.style.background = colors.toolbarHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.textSecondary;
              e.currentTarget.style.background = colors.toolbarBg;
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            {t("reference.aria.resetPosition")}
          </button>
        )}
      </div>

      {/* ── Legend bar ── */}
      {relationshipTypes.length > 0 && (
        <div
          className="flex items-center justify-center gap-x-5 gap-y-1 px-4 py-2 shrink-0 border-t flex-wrap"
          style={{
            borderColor: colors.headerBorder,
            background: colors.headerBg,
            backdropFilter: "blur(10px)",
          }}
        >
          {relationshipTypes.map((type) => {
            const meta = RELATIONSHIP_META[type];
            return (
              <div key={type} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="inline-block w-6 text-center font-mono text-[10px] shrink-0"
                  style={{ color: isDark ? "#CBD5E1" : "#475569" }}
                  aria-hidden="true"
                >
                  {RELATIONSHIP_ARROW[type]}
                </span>
                <span
                  className="font-medium"
                  style={{ color: isDark ? "#CBD5E1" : "#475569" }}
                >
                  {meta.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
