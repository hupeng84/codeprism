"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";

/**
 * SwUpdateToast — prompts the user to reload when a new service worker is
 * installed and waiting. The new SW does NOT call `skipWaiting()` on install
 * (see `public/sw.js` v4), so it sits in the `installed` state until the user
 * accepts. This prevents surprise mid-session reloads while the user is
 * mid-scenario or filling out a form.
 *
 * Flow:
 *   1. Browser detects new sw.js → installs it → state becomes `installed`
 *   2. We detect this and show the toast with the waiting worker
 *   3. User clicks "Update" → we postMessage("SKIP_WAITING") to the SW
 *   4. SW skips waiting → activates → claims clients
 *   5. `controllerchange` fires on this page → we reload to get fresh assets
 *
 * No-ops in development because the SW is unregistered there by the inline
 * registration script in `[locale]/layout.tsx`.
 */
export function SwUpdateToast() {
  const t = useTranslations();
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Dev mode unregisters the SW, so no point showing a toast there.
    if (process.env.NODE_ENV !== "production") return;

    // Re-show on controllerchange → reload
    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const captureIfWaiting = (reg: ServiceWorkerRegistration) => {
      // Already-installed waiting worker (e.g. user closed last tab with one pending)
      if (reg.waiting && reg.active && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
        setShow(true);
        return;
      }
      // Worker currently installing
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (
          installing.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          setWaitingWorker(installing);
          setShow(true);
        }
      });
    };

    // Check current registration on mount
    void navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) captureIfWaiting(reg);
    });

    return () => {
      // Guard: navigator.serviceWorker may have been removed between mount
      // and unmount (e.g. by a test cleanup or a SW reset in another tab).
      navigator.serviceWorker?.removeEventListener(
        "controllerchange",
        onControllerChange
      );
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage("SKIP_WAITING");
      track({ type: "sw_updated" });
    }
    setShow(false);
    // controllerchange listener will trigger window.location.reload()
  };

  const handleDismiss = () => {
    setShow(false);
    // The waiting worker stays installed. Next page load or manual reload
    // will pick it up. User can also re-trigger by reloading manually.
  };

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 max-w-sm pointer-events-auto print-hide"
      style={{
        animation: "sw-update-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <style>{`
        @keyframes sw-update-slide-in {
          from { transform: translateX(-120%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
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
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
          style={{
            background: "var(--app-accent)22",
            border: "1px solid var(--app-accent)55",
          }}
          aria-hidden="true"
        >
          {/* Refresh icon — uses currentColor so it inherits text colour */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--app-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 4v5h-5" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-text-primary">
            {t("swUpdate.title")}
          </div>
          <div className="text-xs text-text-tertiary">
            {t("swUpdate.body")}
          </div>
        </div>
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 rounded-md text-xs font-semibold shrink-0 transition-colors"
          style={{
            background: "var(--app-accent)",
            color: "var(--app-bg-base)",
          }}
          aria-label={t("swUpdate.update")}
        >
          {t("swUpdate.update")}
        </button>
        <button
          onClick={handleDismiss}
          className="text-text-tertiary hover:text-text-primary transition-colors p-1 shrink-0"
          aria-label={t("swUpdate.dismiss")}
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
