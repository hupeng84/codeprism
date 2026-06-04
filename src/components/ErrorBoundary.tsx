"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { useTranslations } from "next-intl";
import { reportError } from "@/lib/error-reporter";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component.
 * Catches JavaScript errors anywhere in the child component tree,
 * reports them via the error-reporter (Sentry-compatible), and displays
 * a fallback UI instead of the crashed component.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to the configured error transport (Sentry by default).
    // No-op if consent is denied or DNT is set.
    reportError(error, {
      url: typeof window !== "undefined" ? window.location.href : undefined,
      tags: { source: "react-error-boundary" },
      extra: { componentStack: errorInfo.componentStack },
    });
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorBoundaryFallback error={this.state.error} onReset={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

function ErrorBoundaryFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const t = useTranslations();
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-bg-card rounded-xl border border-border">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {t("error.componentLoad")}
      </h3>
      <p className="text-sm text-text-secondary mb-4 text-center max-w-md">
        {error?.message || t("error.unknownError")}
      </p>
      <button
        onClick={onReset}
        className="px-4 py-2 bg-accent-coral text-white rounded-lg text-sm font-medium hover:bg-accent-coral/80 transition-colors"
      >
        {t("error.retry")}
      </button>
    </div>
  );
}
