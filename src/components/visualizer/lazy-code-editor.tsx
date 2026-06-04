"use client";

/**
 * Lazy Monaco-based code editor. The real `CodeEditor` (and its ~3 MB
 * `monaco-editor` + `@monaco-editor/react` payload) is dynamically imported
 * with `ssr: false` so it never lands in the server-rendered HTML or the
 * initial client bundle of the visualizer page.
 *
 * While Monaco is loading, we render `CodeFallback` so the user sees the
 * code immediately (without syntax highlighting).
 */

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CodeFallback } from "./CodeFallback";

const CodeEditorDynamic = dynamic(
  () => import("./CodeEditor").then((m) => ({ default: m.CodeEditor })),
  {
    ssr: false,
    loading: () => null, // Suspense fallback is shown instead
  },
);

interface LazyCodeEditorProps {
  code: string;
  language?: string;
  highlightLine?: number;
  readOnly?: boolean;
}

export function LazyCodeEditor(props: LazyCodeEditorProps) {
  return (
    <Suspense
      fallback={
        <CodeFallback
          code={props.code}
          language={props.language}
          highlightLine={props.highlightLine}
        />
      }
    >
      <CodeEditorDynamic {...props} />
    </Suspense>
  );
}
