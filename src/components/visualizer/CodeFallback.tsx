"use client";

/**
 * Lightweight code-viewer fallback used while the Monaco editor bundle
 * (~3 MB gzipped) is being downloaded. Renders the same `code` /
 * `highlightLine` content as a styled `<pre>` so the user never sees
 * a blank panel during the first paint.
 *
 * No syntax highlighting — keeps the bundle small. Once Monaco loads,
 * the dynamic import swaps this out for the real editor.
 */

interface CodeFallbackProps {
  code: string;
  language?: string;
  highlightLine?: number;
}

export function CodeFallback({
  code,
  language,
  highlightLine = -1,
}: CodeFallbackProps) {
  const lines = code.split("\n");
  const label = language ? language.charAt(0).toUpperCase() + language.slice(1) : "";

  return (
    <div className="h-full w-full flex flex-col bg-bg-deep overflow-hidden">
      {label && (
        <div className="px-3 py-1.5 text-[10px] font-mono text-text-tertiary border-b border-border/40 shrink-0">
          {label}
        </div>
      )}
      <pre
        className="flex-1 m-0 px-4 py-3 overflow-auto text-[12px] leading-[1.6] font-mono whitespace-pre"
        style={{ fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace" }}
      >
        {lines.map((line, i) => {
          const isHighlighted = i === highlightLine;
          return (
            <div
              key={i}
              className="flex gap-3"
              style={{
                backgroundColor: isHighlighted ? "rgba(255, 107, 107, 0.08)" : "transparent",
              }}
            >
              <span
                className="select-none text-right shrink-0 w-7"
                style={{
                  color: isHighlighted ? "#FF6B6B" : "var(--app-text-tertiary)",
                }}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-text-secondary">{line || " "}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
