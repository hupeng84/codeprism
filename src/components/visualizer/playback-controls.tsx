"use client";

import { useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Slider } from "@codeprism/ui";
import { Tooltip, TooltipTrigger, TooltipContent } from "@codeprism/ui";

interface PlaybackControlsProps {
  playing: boolean;
  speed: number;
  step: number;
  totalSteps: number;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (step: number) => void;
}

const SPEEDS = [0.5, 1, 2, 4];

export function PlaybackControls({
  playing,
  speed,
  step,
  totalSteps,
  onPlayPause,
  onStepBack,
  onStepForward,
  onReset,
  onSpeedChange,
  onSeek,
}: PlaybackControlsProps) {
  const t = useTranslations();
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input / Monaco
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.closest(".monaco-editor")) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onPlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          onStepBack();
          break;
        case "ArrowRight":
          e.preventDefault();
          onStepForward();
          break;
      }
    },
    [onPlayPause, onStepBack, onStepForward],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col gap-3">
      {/* Step slider */}
      <Slider
        value={step}
        min={0}
        max={Math.max(0, totalSteps - 1)}
        onValueChange={(val) => onSeek(Array.isArray(val) ? val[0] : val)}
        className="w-full"
      />

      {/* Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          {/* Reset */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={onReset}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-all"
                />
              }
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8a6 6 0 0 1 10.47-4M14 8a6 6 0 0 1-10.47 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13 2v3h-3M3 14v-3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </TooltipTrigger>
            <TooltipContent>{t("playback.reset")}</TooltipContent>
          </Tooltip>

          {/* Step Back */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={onStepBack}
                  disabled={step <= 0}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                />
              }
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </TooltipTrigger>
            <TooltipContent>{t("playback.stepBack")}</TooltipContent>
          </Tooltip>

          {/* Play/Pause */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={onPlayPause}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-glass-light hover:bg-bg-card-hover text-text-primary transition-all"
                />
              }
            >
              {playing ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor"/>
                  <rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 2.5v11l9-5.5-9-5.5z" fill="currentColor"/>
                </svg>
              )}
            </TooltipTrigger>
            <TooltipContent>{playing ? t("playback.pause") : t("playback.play")}</TooltipContent>
          </Tooltip>

          {/* Step Forward */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={onStepForward}
                  disabled={step >= totalSteps - 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-glass-light transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                />
              }
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </TooltipTrigger>
            <TooltipContent>{t("playback.stepForward")}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3">
          {/* Step indicator */}
          <span className="text-xs text-text-tertiary font-mono">
            {step} / {totalSteps - 1}
          </span>

          {/* Speed controls */}
          <div className="flex items-center gap-1 bg-bg-glass-light rounded-lg p-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
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