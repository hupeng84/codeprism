"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";

/**
 * PwaInstallPrompt — shows a custom "Install CodePrism" toast when the
 * browser fires the `beforeinstallprompt` event.
 *
 * Why custom instead of the browser's default mini-bar?
 *   - The default bar appears at an unpredictable time and place
 *   - We can theme it to match the app, and suppress it for users who
 *     have already dismissed it (7-day cooldown)
 *   - On iOS Safari (no `beforeinstallprompt` support), we show a
 *     fallback explaining how to use the Share → "Add to Home Screen" flow
 *
 * Flow:
 *   1. Browser fires `beforeinstallprompt` → we capture the event
 *   2. After a small delay (so the page can settle), the toast appears
 *   3. User clicks "Install" → we call `event.prompt()` and await userChoice
 *   4. `appinstalled` fires → toast hides permanently
 *   5. User clicks "×" → we record a 7-day dismissal in localStorage
 */
export function PwaInstallPrompt() {
  const t = useTranslations();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed? Bail.
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // User dismissed in the last 7 days? Bail.
    const DISMISS_KEY = "codeprism-install-dismissed";
    const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
    try {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_MS) {
        return;
      }
    } catch {
      // localStorage blocked — fall through and show the prompt.
    }

    // Detect iOS Safari (the only major platform without beforeinstallprompt).
    const userAgent = navigator.userAgent;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(userAgent) && !("MSStream" in window);
    setIsIOS(isIOSDevice);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Defer showing so the page can settle. Users on the very first
      // visit are not asked to install immediately.
      scheduleShow();
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setShow(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    // For iOS, the beforeinstallprompt never fires. Show the fallback
    // instructions so the user knows how to install.
    if (isIOSDevice) {
      scheduleShow();
    }

    return () => {
      if (showTimerRef.current !== null) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  function scheduleShow() {
    if (showTimerRef.current !== null) {
      clearTimeout(showTimerRef.current);
    }
    showTimerRef.current = setTimeout(() => {
      setShow(true);
      showTimerRef.current = null;
    }, 5000);
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        track({ type: "pwa_installed" });
      }
    } catch {
      // Some browsers throw if the prompt is invoked too late. Ignore.
    } finally {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    track({ type: "pwa_install_dismissed" });
    try {
      localStorage.setItem("codeprism-install-dismissed", String(Date.now()));
    } catch {
      // localStorage blocked — we just won't show the prompt this session.
    }
  };

  // Track the deferred-show timer so we can cancel it on unmount.
  // Without this, fast route changes (e.g. home → visualizer) fire
  // setState on an unmounted component after navigation.
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!show || installed) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-body"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100vw-2rem)] pointer-events-auto print-hide"
      style={{
        animation: "pwa-install-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes pwa-install-slide-up {
          from { transform: translate(-50%, 120%); opacity: 0; }
          to   { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "var(--app-bg-card)",
          border: "1px solid var(--app-accent)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px var(--app-accent)22",
        }}
      >
        <img
          src="/icon-192.svg"
          alt=""
          width={40}
          height={40}
          className="w-10 h-10 rounded-lg shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div
            id="pwa-install-title"
            className="text-sm font-semibold text-text-primary"
          >
            {isIOS
              ? t("pwa.install.iosTitle")
              : t("pwa.install.title")}
          </div>
          <div
            id="pwa-install-body"
            className="text-xs text-text-tertiary mt-0.5"
          >
            {isIOS ? t("pwa.install.iosBody") : t("pwa.install.body")}
          </div>
        </div>
        {!isIOS && (
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-md text-xs font-semibold shrink-0 transition-colors"
            style={{
              background: "var(--app-accent)",
              color: "var(--app-bg-base)",
            }}
            aria-label={t("pwa.install.button")}
          >
            {t("pwa.install.button")}
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 shrink-0"
          aria-label={t("pwa.install.dismiss")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Subset of the BeforeInstallPromptEvent spec that we actually use.
 * See https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}
