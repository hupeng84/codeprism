"use client";

import Editor, { OnMount, loader } from "@monaco-editor/react";
import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "@/components/providers/ThemeProvider";

// Load Monaco Editor from the locally hosted copy under /public/monaco-editor/
// instead of CDN, to avoid CSP violations and unreliable external CDN access.
// NOTE: Must use absolute URL with origin — Monaco workers run in a blob: context
// where relative paths don't resolve against the page origin.
const monacoBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/monaco-editor/min/vs`
    : "/monaco-editor/min/vs";
loader.config({ paths: { vs: monacoBaseUrl } });

interface CodeEditorProps {
  code: string;
  language?: string;
  highlightLine?: number;
  readOnly?: boolean;
}

export function CodeEditor({
  code,
  language = "typescript",
  highlightLine = -1,
  readOnly = true,
}: CodeEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const decorationCollectionRef = useRef<ReturnType<Parameters<OnMount>[0]['createDecorationsCollection']> | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { theme } = useTheme();
  const t = useTranslations();

  // Preload Monaco and catch CDN failures gracefully
  useEffect(() => {
    let cancelled = false;
    loader.init().catch(() => {
      if (!cancelled) setLoadError(true);
    });
    return () => { cancelled = true; };
  }, []);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;

    // Clear previous decorations
    if (decorationCollectionRef.current) {
      decorationCollectionRef.current.clear();
    }

    // Add new decorations for highlighted line
    // Note: Frame type uses 0-based line numbers, Monaco uses 1-based
    if (highlightLine >= 0) {
      const lineNumber = highlightLine + 1; // Convert 0-based to 1-based
      decorationCollectionRef.current = editor.createDecorationsCollection([
        {
          range: {
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: "highlight-line",
            linesDecorationsClassName: "highlight-line-decoration",
          },
        },
      ]);

      // Reveal the highlighted line
      editor.revealLineInCenter(lineNumber);
    }
  }, [highlightLine]);

  if (loadError) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-tertiary text-sm p-6">
        <div className="mb-3">⚠️ {t("reference.codeEditor.initFailed")}</div>
        <pre className="text-xs bg-bg-glass-light rounded-lg p-4 overflow-auto max-w-full text-left leading-relaxed whitespace-pre-wrap font-mono">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <style jsx global>{`
        .highlight-line {
          background-color: rgba(255, 107, 107, 0.1) !important;
        }
        .highlight-line-decoration {
          background-color: #FF6B6B !important;
          width: 3px !important;
        }
      `}</style>
      <Editor
        height="100%"
        language={language}
        value={code}
        theme={theme === "dark" ? "vs-dark" : "vs"}
        onMount={handleEditorMount}
        loading={
          <div className="h-full flex items-center justify-center text-text-tertiary text-sm">
            {t("reference.codeEditor.loading")}
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 12,
          fontFamily: "JetBrains Mono, monospace",
          lineNumbers: "on",
          renderLineHighlight: "none",
          scrollBeyondLastLine: false,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          scrollbar: {
            vertical: "hidden",
            horizontal: "auto",
          },
          padding: {
            top: 12,
            bottom: 12,
          },
        }}
      />
    </div>
  );
}
