"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import type { Frame, TableState, UMLClassDiagram, Scenario, PlaybackStatus } from "@codeprism/core";
import {
  renderSortState,
  renderSearchState,
  renderTreeState,
  renderGraphState,
  renderListState,
  renderHashState,
} from "@codeprism/core";
import { serializePlaybackState } from "@codeprism/core";
import {
  getContent,
  getContentFrames,
  getContentCodeLines,
} from "@codeprism/content";
import { VisualizerCanvas } from "@/components/visualizer/visualizer-canvas";
import { TableCanvas } from "@/components/visualizer/TableCanvas";
import { LazyMermaidUMLCanvas } from "@/components/visualizer/lazy-mermaid-canvas";
import { PlaybackControls } from "@/components/visualizer/playback-controls";
import { ArrayInputEditor } from "@/components/visualizer/ArrayInputEditor";
import SidebarNav from "@/components/visualizer/SidebarNav";
import { LazyCodeEditor } from "@/components/visualizer/lazy-code-editor";
import { LanguageCodeTabs } from "@/components/visualizer/LanguageCodeTabs";
import { ScenarioSection } from "@/components/visualizer/ScenarioSection";
import { Sheet, SheetContent, SheetTitle } from "@codeprism/ui";
import { usePlaybackStore, usePlaybackLoop } from "@/components/visualizer/use-playback-store";
import { useVisualStore } from "@/components/visualizer/use-visual-store";
import { useProgressStore } from "@/components/visualizer/use-progress-store";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  category: string;
  slug: string;
}

/** Pick the right renderer based on category + frame state shape */
function pickRenderer(cat: string, st: unknown) {
  if (cat === "search") return renderSearchState;
  if (cat === "graph") return renderGraphState;
  if (cat === "algorithm") return renderSortState;
  // structure category — dispatch by state shape
  if (cat === "structure") {
    const s = st as Record<string, unknown>;
    if (s && "slots" in s) return renderHashState;
    if (s && "nodes" in s && "orientation" in s) return renderListState;
    return renderTreeState; // default for tree-based structures (BST etc.)
  }
  return renderSortState;
}

/** Debounce hook — returns a debounced version of the value after `delay` ms. */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ────────────────────────────────────────────────────────────────────────────
// ShareButton — copies a deep-link of the current page state to the clipboard.
// Uses the project's url-state serialiser so the URL is round-trippable
// by getInitialStateFromURL() on reload.
// ────────────────────────────────────────────────────────────────────────────
function ShareButton({
  category,
  slug,
  step,
  speed,
  status,
  input,
  isPattern,
  t,
}: {
  category: string;
  slug: string;
  step: number;
  speed: number;
  status: PlaybackStatus;
  input?: number[];
  isPattern: boolean;
  t: (k: string) => string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;
    const dark = document.documentElement.getAttribute("data-theme") !== "light";
    const query = serializePlaybackState({
      step,
      speed,
      status,
      input,
      dark,
      // Patterns always show the static UML; others default to "runtime" view
      view: isPattern ? "structure" : "runtime",
    });
    // Build the URL preserving the current locale segment.
    const segments = window.location.pathname.split("/").filter(Boolean);
    const locale = segments[0] ?? "zh";
    const url = `${window.location.origin}/${locale}/visualizer/${category}/${slug}${query ? `?${query}` : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setFailed(true);
      setTimeout(() => setFailed(false), 1500);
    }
  }, [step, speed, status, input, isPattern, category, slug, t]);

  const label = copied
    ? t("visualizer.shareLinkCopied")
    : failed
      ? t("visualizer.shareLinkFailed")
      : t("visualizer.share");

  const color = copied
    ? "#4ECDC4"
    : failed
      ? "#F87171"
      : "var(--app-text-tertiary)";

  return (
    <button
      onClick={handleShare}
      className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md transition-colors shrink-0 text-xs"
      style={{ color, background: "transparent" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--app-bg-glass-light)";
        if (!copied && !failed) e.currentTarget.style.color = "var(--app-text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = color;
      }}
      title={t("visualizer.share")}
      aria-label={t("visualizer.share")}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
      <span>{label}</span>
    </button>
  );
}

export default function VisualizerClient({ category, slug }: Props) {
  const t = useTranslations();
  const locale = useLocale();

  const categoryLabels: Record<string, string> = {
    algorithm: t("sidebar.algorithm"),
    search: t("sidebar.search"),
    graph: t("sidebar.graph"),
    structure: t("sidebar.structure"),
    pattern: t("sidebar.pattern"),
  };

  const content = useMemo(() => getContent(category, slug), [category, slug]);
  const isPattern = category === "pattern";
  const isSearch = category === "search";
  const isAlgorithm = category === "algorithm";
  const showInputEditor = isAlgorithm || isSearch;

  // Locale-aware display titles
  const displayTitle = content ? t((content as {titleKey: string}).titleKey) : "";
  const displayDescription = content ? t((content as {descKey: string}).descKey) : "";

  // Unified playback store
  // TODO(perf): when adding more visualizer consumers, prefer per-field selectors
  // via usePlaying()/useSpeed()/etc. to avoid store-wide re-renders.
  const store = usePlaybackStore();
  const {
    playing, speed, currentStep, totalSteps,
    state, highlightedLine,
    setPlaying, setSpeed,
    stepForward, stepBack, reset, seek,
  } = store;

  // Auto-scroll step list to keep current step visible
  const stepListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = stepListRef.current;
    if (!container) return;
    // Each step item is roughly 60-80px tall, scroll current step into view
    const itemHeight = 70;
    const targetScroll = currentStep * itemHeight - container.clientHeight / 2 + itemHeight / 2;
    container.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
  }, [currentStep]);

  // Detect TableState (DP algorithms with 2D grid)
  const isTable = state != null && typeof state === "object" && "grid" in (state as Record<string, unknown>);

  // ── Input array editor state ──
  const defaultInput = content?.defaultInput ?? [];
  const [inputArray, setInputArray] = useState<number[]>(defaultInput);
  const debouncedInputArray = useDebounced(inputArray, 300);

  // Reset inputArray when content changes (navigating to a different algorithm)
  useEffect(() => {
    if (content) {
      setInputArray(content.defaultInput ?? []);
    }
  }, [content]);

  // Pre-compute all frames
  const frames: Frame<unknown>[] = useMemo(() => {
    if (!content) return [];
    return getContentFrames(content, showInputEditor ? debouncedInputArray : undefined);
  }, [content, debouncedInputArray, showInputEditor]);

  // Table frames for TableCanvas (sliced up to currentStep for animation)
  const tableFrames = useMemo(() => {
    return frames as Frame<TableState>[];
  }, [frames]);

  // Init the store with pre-computed frames
  // NOTE: store.init is stable (defined once in create), and frames is stable (useMemo).
  // DO NOT add `store` as a dep — it's a new object reference on every render,
  // which would cause set(...) → re-render → effect re-run → infinite loop.
  useEffect(() => {
    if (frames.length === 0) return;
    store.init(frames);
  }, [frames]);

  // Playback loop — patterns use slower default timing
  usePlaybackLoop(isPattern ? 1200 : 600);

  // ── Mobile sidebar state ──
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // ── Desktop sidebar collapse state ──
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebarCollapsed = useCallback(() => setSidebarCollapsed((prev) => !prev), []);

  // ── Right panel collapse state ──
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const toggleRightSidebarCollapsed = useCallback(() => setRightSidebarCollapsed((prev) => !prev), []);

  // ── Language tab state ──
  const [activeLanguage, setActiveLanguage] = useState("typescript");

  // Reset language selection when content changes
  useEffect(() => {
    setActiveLanguage("typescript");
  }, [category, slug]);

  // ── Code panel resize state ──
  const [codePanelHeight, setCodePanelHeight] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartHeight.current = codePanelHeight;
  }, [codePanelHeight]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = dragStartY.current - e.clientY;
      const newHeight = Math.min(Math.max(dragStartHeight.current + delta, 150), 600);
      setCodePanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  // Listen for hamburger menu toggle from Navbar
  useEffect(() => {
    const handler = () => setSidebarOpen((prev) => !prev);
    window.addEventListener("toggle-sidebar-nav", handler);
    return () => window.removeEventListener("toggle-sidebar-nav", handler);
  }, []);

  // Close sidebar on route change (slug/category change)
  useEffect(() => {
    setSidebarOpen(false);
  }, [category, slug]);

  // ── Visual store (zoom, pan, active tab) ──
  const { activeTab, setActiveTab, zoom, setZoom, panOffset, resetView } = useVisualStore();

  // ── Progress store ──
  const contentKey = `${category}/${slug}`;
  const { markCompleted, toggleFavorite, updateLastVisited, isFavorite } = useProgressStore();
  const hasInteracted = useRef(false);

  // Track last visited on mount
  useEffect(() => {
    updateLastVisited(contentKey);
  }, [contentKey, updateLastVisited]);

  // Mark as completed when reaching the last frame (only after user interaction)
  useEffect(() => {
    if (currentStep === totalSteps - 1 && totalSteps > 1 && hasInteracted.current) {
      markCompleted(contentKey);
    }
  }, [currentStep, totalSteps, contentKey, markCompleted]);

  // Track user interaction with playback
  useEffect(() => {
    if (playing || currentStep > 0) {
      hasInteracted.current = true;
    }
  }, [playing, currentStep]);

const favorited = isFavorite(contentKey);

  // UML diagram data for pattern content (MUST be before any early return — hooks ordering)
  const hasDiagram = isPattern && content && "diagram" in content && (content as { diagram?: UMLClassDiagram }).diagram != null;

  // ── Guard: empty frames (no visualization data) ──
  if (totalSteps === 0) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-bg-primary">
        <div className="text-text-tertiary text-sm">{t("visualizer.loading")}</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-bg-primary">
        <div className="text-text-tertiary text-sm">{t("visualizer.notFound")}</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center bg-bg-primary">
        <div className="text-text-tertiary text-sm">{t("visualizer.notFound")}</div>
      </div>
    );
  }

  const codeLines = getContentCodeLines(content);

  // Determine code display based on language tabs
  const codeExamples = content && "codeExamples" in content
    ? (content as { codeExamples?: Record<string, { code: string; language: string; languageLabel: string }> }).codeExamples
    : undefined;
  const hasCodeExamples = codeExamples != null && Object.keys(codeExamples).length > 0;
  const activeCodeExample = hasCodeExamples ? codeExamples[activeLanguage] : undefined;
  const displayCode = activeCodeExample
    ? activeCodeExample.code
    : codeLines.join("\n");
  const displayLanguage = activeCodeExample
    ? activeCodeExample.language
    : "typescript";

  // Only highlight when viewing the default language (generator line numbers match that code)
  const defaultLanguage = content?.language?.toLowerCase() ?? "typescript";
  const effectiveHighlight = activeLanguage === defaultLanguage ? highlightedLine : -1;

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-bg-primary">

      <header className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Category badge */}
          <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-bg-glass-light text-text-tertiary shrink-0">
            {categoryLabels[category] ?? category}
          </span>
          {/* Title */}
          <h1 className="text-sm font-semibold text-text-primary truncate">
            {content.icon} {displayTitle}
          </h1>
          {/* Favorite */}
          <button
            onClick={() => toggleFavorite(contentKey)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-bg-glass-light transition-colors shrink-0"
            aria-label={favorited ? t("visualizer.unfavorite") : t("visualizer.favorite")}
            title={favorited ? t("visualizer.unfavorite") : t("visualizer.favorite")}
          >
            {favorited ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD93D" stroke="#FFD93D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-tertiary">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/>
              </svg>
            )}
          </button>
          {/* Compare — links to the compare page pre-selecting this item on the left */}
          <Link
            href={`/${locale}/compare?category=${category}&left=${(content as { slug: string }).slug}`}
            className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-colors shrink-0 text-xs"
            title={t("visualizer.compare")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 3h5v5" />
              <path d="M8 21H3v-5" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            <span>{t("visualizer.compare")}</span>
          </Link>
          {/* Print — opens the browser print dialog (print styles strip chrome) */}
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-colors shrink-0 text-xs"
            title={t("visualizer.print")}
            aria-label={t("visualizer.print")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" rx="1" />
            </svg>
            <span>{t("visualizer.print")}</span>
          </button>
          {/* Share — copies a deep-link with current step/speed/input/view to clipboard */}
          <ShareButton
            category={category}
            slug={slug}
            step={currentStep}
            speed={speed}
            status={playing ? ("playing" as PlaybackStatus) : ("paused" as PlaybackStatus)}
            input={showInputEditor ? inputArray : undefined}
            isPattern={isPattern}
            t={t}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {content.tags.map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-bg-glass-light text-text-tertiary">{tag}</span>
          ))}
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left sidebar — hidden on mobile */}
        <div 
          className={`hidden md:flex bg-bg-deep border-r border-border flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            sidebarCollapsed ? "w-[48px] min-w-[48px]" : "w-[320px] min-w-[320px]"
          }`}
        >
          {/* Collapse toggle button */}
          <div className="flex items-center justify-end px-2 py-2 border-b border-border shrink-0">
            <button
              onClick={toggleSidebarCollapsed}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-bg-glass-light transition-colors text-text-tertiary hover:text-text-primary"
              aria-label={sidebarCollapsed ? t("visualizer.sidebar.expand") : t("visualizer.sidebar.collapse")}
              title={sidebarCollapsed ? t("visualizer.sidebar.expand") : t("visualizer.sidebar.collapse")}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
              >
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          </div>

          {/* Navigation tree */}
          <div className={`border-b border-border overflow-y-auto shrink-0 ${sidebarCollapsed ? "max-h-0" : "max-h-[40vh]"}`}>
            <SidebarNav category={category} slug={slug} />
          </div>

          <div className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${sidebarCollapsed ? "opacity-0" : "opacity-100"}`}>
            <div className="space-y-4">
              {/* Input array editor — only for algorithm/search */}
              {showInputEditor && (
                <div className="pb-4 border-b border-border">
                  <ArrayInputEditor
                    value={inputArray}
                    onChange={setInputArray}
                    maxElements={20}
                  />
                </div>
              )}
              <div>
                <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">{t("visualizer.description")}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{displayDescription}</p>
              </div>
              <ScenarioSection
                scenarios={(content as { scenarios?: Scenario[] }).scenarios}
              />
              <div>
                <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">{t("visualizer.complexity")}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-bg-glass-light rounded-lg p-2.5">
                    <div className="text-[10px] text-text-tertiary mb-0.5">{t("visualizer.timeComplexity")}</div>
                    <div className="text-sm font-mono text-[#FFD93D]">{content.complexity.time}</div>
                  </div>
                  <div className="bg-bg-glass-light rounded-lg p-2.5">
                    <div className="text-[10px] text-text-tertiary mb-0.5">{t("visualizer.spaceComplexity")}</div>
                    <div className="text-sm font-mono text-[#4ECDC4]">{content.complexity.space}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab bar — only for non-pattern content with UML diagram */}
          {hasDiagram && !isPattern && (
            <div className="flex items-center gap-0 border-b border-border shrink-0 px-4">
              <button
                onClick={() => setActiveTab("demo")}
                className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  activeTab !== "uml"
                    ? "text-text-primary border-[#FF6B6B]"
                    : "text-text-tertiary border-transparent hover:text-text-secondary"
                }`}
              >
                {t("visualizer.runDemo")}
              </button>
              <button
                onClick={() => setActiveTab("uml")}
                className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === "uml"
                    ? "text-text-primary border-[#FF6B6B]"
                    : "text-text-tertiary border-transparent hover:text-text-secondary"
                }`}
              >
{t("visualizer.uml")}
              </button>
            </div>
          )}
          {/* Tab content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Patterns: always show UML directly, no tab switching */}
            {isPattern && hasDiagram ? (
              <>
                {/* Zoom controls — above canvas, right-aligned */}
                <div className="flex items-center justify-end gap-1 px-6 pt-4 shrink-0">
                  <button
                    onClick={() => setZoom(zoom - 0.1)}
                    disabled={zoom <= 0.5}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t("reference.aria.zoomOut")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <button
                    onClick={resetView}
                    className="px-2 py-0.5 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors rounded hover:bg-bg-glass-light"
                    title={t("reference.aria.resetView")}
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    onClick={() => setZoom(zoom + 0.1)}
                    disabled={zoom >= 2}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t("reference.aria.zoomIn")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
                <div className="flex-1 min-h-0 p-4">
                  {content?.diagram && <LazyMermaidUMLCanvas diagram={content.diagram} zoom={zoom} />}
                </div>
              </>
            ) : activeTab === "uml" && hasDiagram ? (
              <>
                {/* Zoom controls — above canvas, right-aligned */}
                <div className="flex items-center justify-end gap-1 px-6 pt-4 shrink-0">
                  <button
                    onClick={() => setZoom(zoom - 0.1)}
                    disabled={zoom <= 0.5}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t("reference.aria.zoomOut")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <button
                    onClick={resetView}
                    className="px-2 py-0.5 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors rounded hover:bg-bg-glass-light"
                    title={t("reference.aria.resetView")}
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    onClick={() => setZoom(zoom + 0.1)}
                    disabled={zoom >= 2}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t("reference.aria.zoomIn")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
                <div className="flex-1 min-h-0 p-4">
                  {content?.diagram && <LazyMermaidUMLCanvas diagram={content.diagram} zoom={zoom} />}
                </div>
              </>
            ) : (
              <>
                {/* Zoom controls — above canvas, right-aligned */}
                <div className="flex items-center justify-end gap-1 px-6 pt-4 shrink-0">
                  <button
                    onClick={() => setZoom(zoom - 0.1)}
                    disabled={zoom <= 0.5}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t("reference.aria.zoomOut")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <button
                    onClick={resetView}
                    className="px-2 py-0.5 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors rounded hover:bg-bg-glass-light"
                    title={t("reference.aria.resetView")}
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    onClick={() => setZoom(zoom + 0.1)}
                    disabled={zoom >= 2}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t("reference.aria.zoomIn")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
                <div className="flex items-center justify-center p-4 shrink-0">
                  {isTable ? (
                    <TableCanvas frames={tableFrames.slice(0, currentStep + 1)} />
                  ) : (
                    <VisualizerCanvas
                      render={pickRenderer(category, state) as (ctx: CanvasRenderingContext2D, state: unknown, w: number, h: number) => void}
                      state={state}
                      height={320}
                      zoom={zoom}
                      panOffset={panOffset}
                    />
                  )}
                </div>
                <div className="w-full max-w-[700px] mx-auto px-4 shrink-0">
                  <PlaybackControls
                    playing={playing} speed={speed} step={currentStep} totalSteps={totalSteps}
                    onPlayPause={() => setPlaying(!playing)}
                    onStepBack={stepBack} onStepForward={stepForward}
                    onReset={reset} onSpeedChange={setSpeed} onSeek={seek}
                  />
                </div>
              </>
            )}
          </div>
          {/* Resizable divider */}
          <div
            className={`h-1 bg-border hover:bg-[#FF6B6B] cursor-row-resize transition-colors shrink-0 ${
              isDragging ? "bg-[#FF6B6B]" : ""
            }`}
            onMouseDown={handleDragStart}
          />
          {/* Code — fixed height based on drag */}
          <div className="mx-4 mt-4 overflow-hidden" style={{ height: codePanelHeight }}>
            {hasCodeExamples && (
              <LanguageCodeTabs
                codeExamples={codeExamples!}
                activeLanguage={activeLanguage}
                onLanguageChange={setActiveLanguage}
              />
            )}
            <div className="h-full">
              <LazyCodeEditor
                code={displayCode}
                language={displayLanguage}
                highlightLine={effectiveHighlight}
                readOnly={true}
              />
            </div>
          </div>
        </div>

        {/* Right panel — hidden for patterns */}
        {!isPattern && (
        <div 
          className={`bg-bg-deep border-l border-border flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
            rightSidebarCollapsed ? "w-[48px] min-w-[48px]" : "w-[240px] min-w-[240px]"
          }`}
        >
          {/* Collapse toggle button */}
          <div className="flex items-center justify-start px-2 py-2 border-b border-border shrink-0">
            <button
              onClick={toggleRightSidebarCollapsed}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-bg-glass-light transition-colors text-text-tertiary hover:text-text-primary"
              aria-label={rightSidebarCollapsed ? t("visualizer.rightSidebar.expand") : t("visualizer.rightSidebar.collapse")}
              title={rightSidebarCollapsed ? t("visualizer.rightSidebar.expand") : t("visualizer.rightSidebar.collapse")}
            >
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${rightSidebarCollapsed ? "rotate-180" : ""}`}
              >
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <div className={`p-4 border-b border-border shrink-0 transition-all duration-300 ${rightSidebarCollapsed ? "opacity-0 h-0 p-0 overflow-hidden" : ""}`}>
            <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{t("visualizer.steps")}</h3>
          </div>
          <div className={`flex-1 overflow-y-auto transition-all duration-300 ${rightSidebarCollapsed ? "opacity-0" : "opacity-100"}`} ref={stepListRef}>
            {/* Steps in order: step 0 at top, last step at bottom */}
            {frames.map((frame) => {
              const stepIndex = frame.step;
              const isCurrent = stepIndex === currentStep;
              const isPast = stepIndex < currentStep;
              return (
                <div
                  key={stepIndex}
                  className={`px-4 py-3 border-b border-border transition-colors ${
                    isCurrent
                      ? "bg-accent-coral-soft border-l-2 border-l-[#FF6B6B]"
                      : isPast
                        ? "opacity-60"
                        : "opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-mono ${
                        isCurrent
                          ? "bg-[#FF6B6B] text-white"
                          : "bg-bg-glass-light text-text-tertiary"
                      }`}
                    >
                      {stepIndex}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-medium text-[#FF6B6B]">{t("visualizer.current")}</span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${
                    isCurrent ? "text-text-primary" : "text-text-secondary"
                  }`}>
                    {frame.description || "—"}
                  </p>
                </div>
              );
            })}
          </div>
          {/* Stats footer */}
          <div className={`p-4 border-t border-border shrink-0 space-y-1.5 transition-all duration-300 ${rightSidebarCollapsed ? "opacity-0 h-0 p-0 overflow-hidden" : ""}`}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary">{t("visualizer.step")}</span>
              <span className="text-text-secondary font-mono">{currentStep} / {Math.max(0, totalSteps - 1)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary">{t("visualizer.speed")}</span>
              <span className="text-text-secondary">{speed}x</span>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Mobile sidebar — using shadcn Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-[280px] p-0 bg-bg-deep border-border">
          <SheetTitle className="px-4 py-3 border-b border-border text-sm font-semibold text-text-primary">{t("visualizer.navTitle")}</SheetTitle>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav category={category} slug={slug} onNavigate={closeSidebar} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
