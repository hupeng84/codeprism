"use client";

import React, { useState, useMemo } from "react";
import {
  renderSortState,
  renderSearchState,
  renderGraphState,
  renderTreeState,
  renderListState,
  renderHashState,
} from "@codeprism/core";
import {
  getContent,
  getContentCodeLines,
} from "@codeprism/content";
import type { AnyContent } from "@codeprism/content";
import { VisualizerCanvas } from "@/components/visualizer/visualizer-canvas";
import { MermaidUMLCanvas } from "@/components/visualizer/MermaidUMLCanvas";
import { usePanelPlayback } from "@/components/visualizer/use-panel-playback";
import type { PanelPlayback } from "@/components/visualizer/use-panel-playback";
import { useTranslations, useLocale } from "next-intl";

// ── Pick renderer based on category and state shape ──
function pickRenderer(cat: string, st: unknown) {
  if (cat === "search") return renderSearchState;
  if (cat === "graph") return renderGraphState;
  if (cat === "algorithm") return renderSortState;
  if (cat === "structure") {
    const s = st as Record<string, unknown>;
    if (s && "slots" in s) return renderHashState;
    if (s && "nodes" in s && "orientation" in s) return renderListState;
    return renderTreeState;
  }
  return renderSortState;
}

// ── Compact inline playback controls ──
function InlinePlaybackControls({
  playing,
  speed,
  step,
  totalSteps,
  onPlayPause,
  onStepBack,
  onStepForward,
  onReset,
  onSpeedChange,
}: {
  playing: boolean;
  speed: number;
  step: number;
  totalSteps: number;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpeedChange: (s: number) => void;
}) {
  const t = useTranslations();
  const progress = totalSteps > 1 ? (step / (totalSteps - 1)) * 100 : 0;
  const speeds = [0.5, 1, 2, 4];

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      {/* Progress bar */}
      <div className="h-1 bg-bg-glass-light rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-all"
            title={t("playback.reset")}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 8a6 6 0 0 1 10.47-4M14 8a6 6 0 0 1-10.47 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 2v3h-3M3 14v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={onStepBack}
            disabled={step <= 0}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title={t("playback.stepBack")}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={onPlayPause}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-glass-light hover:bg-bg-glass-light text-text-primary transition-all"
            title={playing ? t("playback.pause") : t("playback.play")}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor"/>
                <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 2.5v11l9-5.5-9-5.5z" fill="currentColor"/>
              </svg>
            )}
          </button>
          <button
            onClick={onStepForward}
            disabled={step >= totalSteps - 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            title={t("playback.stepForward")}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-tertiary font-mono">
            {step}/{totalSteps - 1}
          </span>
          <div className="flex items-center gap-0.5 bg-bg-glass-light rounded-md p-0.5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  speed === s
                    ? "bg-[#FF6B6B] text-white"
                    : "text-text-tertiary hover:text-text-primary"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Single compare panel ──
function ComparePanel({
  content,
  category,
  accentColor,
  playback,
}: {
  content: AnyContent;
  category: string;
  accentColor: string;
  playback: PanelPlayback;
}) {
  const t = useTranslations();
  const codeLines = useMemo(() => getContentCodeLines(content), [content]);
  // For structures, pass state so the renderer can be picked by state shape.
  // For patterns, we render the MermaidUMLCanvas instead of the canvas renderer.
  const renderer = useMemo(
    () => (category === "pattern" ? null : pickRenderer(category, playback.state)),
    [category, playback.state],
  );
  const isPattern = category === "pattern";
  const [activeTab, setActiveTab] = useState<"code" | "info">("code");

  return (
    <div className="flex flex-col bg-bg-deep border border-border rounded-xl overflow-hidden flex-1 min-w-0">
      {/* Colored header bar */}
      <div
        className="h-1"
        style={{ background: accentColor }}
      />

      {/* Title */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-border">
        <span className="text-lg">{content.icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {"titleKey" in content ? t((content as {titleKey: string}).titleKey) : (content as {title: string}).title}
          </h3>
          <p className="text-[10px] text-text-tertiary truncate">{(content as {title: string}).title}</p>
        </div>
      </div>

      {/* Canvas / UML area */}
      <div className="flex items-center justify-center p-3 bg-bg-primary" style={{ minHeight: 336 }}>
        {isPattern && "diagram" in content && (content as { diagram?: unknown }).diagram ? (
          <MermaidUMLCanvas
            diagram={(content as { diagram: NonNullable<typeof content.diagram> }).diagram}
            zoom={1}
          />
        ) : renderer ? (
          <VisualizerCanvas
            render={renderer as (ctx: CanvasRenderingContext2D, state: unknown, w: number, h: number) => void}
            state={playback.state}
            width={520}
            height={300}
          />
        ) : null}
      </div>

      {/* Playback controls */}
      <InlinePlaybackControls
        playing={playback.isPlaying}
        speed={playback.speed}
        step={playback.currentStep}
        totalSteps={playback.totalSteps}
        onPlayPause={playback.isPlaying ? playback.pause : playback.play}
        onStepBack={playback.stepBack}
        onStepForward={playback.stepForward}
        onReset={playback.reset}
        onSpeedChange={playback.setSpeed}
      />

      {/* Tab bar */}
      <div className="flex border-t border-border">
        <button
          onClick={() => setActiveTab("code")}
          className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
            activeTab === "code"
              ? "text-text-primary border-b-2"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
          style={activeTab === "code" ? { borderColor: accentColor } : undefined}
        >
          {t("compare.code")}
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
            activeTab === "info"
              ? "text-text-primary border-b-2"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
          style={activeTab === "info" ? { borderColor: accentColor } : undefined}
        >
          {t("compare.info")}
        </button>
      </div>

      {/* Tab content */}
      <div className="h-[180px] overflow-y-auto">
        {activeTab === "code" ? (
          <pre className="p-3 text-[11px] font-mono leading-relaxed">
            {codeLines.map((line: string, i: number) => (
              <div
                key={i}
                className={`py-0.5 px-2 -mx-2 rounded transition-colors ${
                  playback.highlightedLine === i
                    ? "text-text-primary border-l-2"
                    : "text-text-tertiary"
                }`}
                style={
                  playback.highlightedLine === i
                    ? { backgroundColor: `${accentColor}15`, borderLeftColor: accentColor }
                    : undefined
                }
              >
                <span className="inline-block w-5 text-text-tertiary select-none mr-2 text-[10px]">
                  {i + 1}
                </span>
                {line}
              </div>
            ))}
          </pre>
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-xs text-text-secondary leading-relaxed">
              {content.description}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-bg-glass-light rounded-lg p-2.5">
                <div className="text-[10px] text-text-tertiary mb-0.5">{t("compare.timeComplexity")}</div>
                <div className="text-xs font-mono text-[#FFD93D]">
                  {content.complexity.time}
                </div>
              </div>
              <div className="bg-bg-glass-light rounded-lg p-2.5">
                <div className="text-[10px] text-text-tertiary mb-0.5">{t("compare.spaceComplexity")}</div>
                <div className="text-xs font-mono text-[#4ECDC4]">
                  {content.complexity.space}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Complexity comparison table ──
function ComplexityTable({
  contentA,
  contentB,
}: {
  contentA: AnyContent;
  contentB: AnyContent;
}) {
  const t = useTranslations();
  const rows = [
    { label: t("compare.timeComplexity"), a: contentA.complexity.time, b: contentB.complexity.time },
    { label: t("compare.spaceComplexity"), a: contentA.complexity.space, b: contentB.complexity.space },
  ];
const displayTitleA = t((contentA as {titleKey: string}).titleKey);
const displayTitleB = t((contentB as {titleKey: string}).titleKey);

  return (
    <div className="bg-bg-deep border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          {t("compare.complexityCompare")}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-left text-text-tertiary font-medium">{t("compare.metric")}</th>
              <th className="px-4 py-2.5 text-left font-medium" style={{ color: "#FF6B6B" }}>
                {displayTitleA}
              </th>
              <th className="px-4 py-2.5 text-left font-medium" style={{ color: "#4ECDC4" }}>
                {displayTitleB}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 text-text-tertiary">{row.label}</td>
                <td className="px-4 py-2.5 font-mono text-text-secondary">{row.a}</td>
                <td className="px-4 py-2.5 font-mono text-text-secondary">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main compare client ──
interface Props {
  category: string;
  a: string;
  b: string;
}

export default function CompareClient({ category, a, b }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const contentA = useMemo(() => getContent(category, a), [category, a]);
  const contentB = useMemo(() => getContent(category, b), [category, b]);

  const panelA = usePanelPlayback(contentA ?? null);
  const panelB = usePanelPlayback(contentB ?? null);

  const [sync, setSync] = useState(true);

  // Intercept panel actions to apply sync
  const syncA = useMemo(
    () => ({
      ...panelA,
      play: sync ? () => { panelA.play(); panelB.setPlaying(true); } : panelA.play,
      pause: sync ? () => { panelA.pause(); panelB.setPlaying(false); } : panelA.pause,
      stepForward: sync ? () => { panelA.stepForward(); panelB.stepForward(); } : panelA.stepForward,
      stepBack: sync ? () => { panelA.stepBack(); panelB.stepBack(); } : panelA.stepBack,
      reset: sync ? () => { panelA.reset(); panelB.reset(); } : panelA.reset,
    }),
    [panelA, panelB, sync],
  );

  const syncB = useMemo(
    () => ({
      ...panelB,
      play: sync ? () => { panelB.play(); panelA.setPlaying(true); } : panelB.play,
      pause: sync ? () => { panelB.pause(); panelA.setPlaying(false); } : panelB.pause,
      stepForward: sync ? () => { panelB.stepForward(); panelA.stepForward(); } : panelB.stepForward,
      stepBack: sync ? () => { panelB.stepBack(); panelA.stepBack(); } : panelB.stepBack,
      reset: sync ? () => { panelB.reset(); panelA.reset(); } : panelA.reset,
    }),
    [panelA, panelB, sync],
  );

  if (!contentA || !contentB) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-tertiary text-sm">{t("visualizer.notFound")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <a
              href={`/${locale}/compare`}
              className="text-text-tertiary hover:text-text-secondary transition-colors text-sm"
            >
              {t("compare.breadcrumb")}
            </a>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-text-tertiary">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm text-text-secondary">
              {t((contentA as {titleKey: string}).titleKey)} vs {t((contentB as {titleKey: string}).titleKey)}
            </span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
            {t((contentA as {titleKey: string}).titleKey)}
            <span className="text-text-tertiary mx-3">vs</span>
            {t((contentB as {titleKey: string}).titleKey)}
          </h1>
        </div>

        {/* Sync toggle */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSync(!sync)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              sync
                ? "bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/20"
                : "bg-bg-glass-light text-text-tertiary border border-border hover:text-text-secondary"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 8a4 4 0 0 1 8 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M12 8a4 4 0 0 1-8 0"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="2 2"
              />
            </svg>
            {t("compare.sync.label")}: {sync ? t("compare.sync.on") : t("compare.sync.off")}
          </button>
          <span className="text-[11px] text-text-tertiary">
            {sync ? t("compare.sync.hint.on") : t("compare.sync.hint.off")}
          </span>
        </div>

        {/* Two panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <ComparePanel
            content={contentA}
            category={category}
            accentColor="#FF6B6B"
            playback={syncA}
          />
          <ComparePanel
            content={contentB}
            category={category}
            accentColor="#4ECDC4"
            playback={syncB}
          />
        </div>

        {/* Complexity comparison table */}
        <ComplexityTable contentA={contentA} contentB={contentB} />
      </div>
    </div>
  );
}
