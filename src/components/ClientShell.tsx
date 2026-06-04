"use client";

import { type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/home/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { LazyCommandPalette } from "@/components/lazy-command-palette";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { ErrorReporting } from "@/components/ErrorReporting";
import { BackToTop } from "@/components/BackToTop";
import { useProgressSync } from "@/lib/progress-sync";

export function ClientShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  // Mirror progress store across tabs via BroadcastChannel. No-op on
  // browsers that lack the API (Safari < 15.4, IE) — the zustand storage
  // event fallback takes over.
  useProgressSync();
  return (
    <ThemeProvider>
      <Navbar />
      <ErrorBoundary
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">{t("reference.errors.pageLoad")}</h2>
              <p className="text-sm text-text-secondary mb-4">{t("reference.errors.refreshHint")}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-accent-coral text-white rounded-lg text-sm font-medium hover:bg-accent-coral/80 transition-colors"
              >
                {t("reference.errors.refresh")}
              </button>
            </div>
          </div>
        }
      >
        <PageTransition>{children}</PageTransition>
      </ErrorBoundary>
      <LazyCommandPalette />
      <PwaInstallPrompt />
      <PageViewTracker />
      <ErrorReporting />
      <BackToTop />
    </ThemeProvider>
  );
}
