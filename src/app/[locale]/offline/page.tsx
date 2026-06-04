"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * PWA offline fallback. Rendered when the service worker cannot reach
 * the network and no cached page is available for the requested URL.
 * The static `public/offline.html` is kept as a hard fallback in case
 * the SW fails to bootstrap entirely.
 */
export default function OfflinePage() {
  const t = useTranslations();
  const [online, setOnline] = useState(false);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : false);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const handleRetry = () => {
    if (typeof navigator !== "undefined" && navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg-primary px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl"
        style={{
          background: "var(--app-bg-card)",
          border: "1px solid var(--app-border)",
        }}
        aria-hidden="true"
      >
        📡
      </div>
      <h1 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 text-center">
        {t("offline.title")}
      </h1>
      <p className="text-sm text-text-secondary max-w-md text-center leading-relaxed mb-2">
        {t("offline.desc")}
      </p>
      {online ? (
        <p className="text-xs text-accent-teal mb-6 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-teal" />
          {t("offline.connectionRestored")}
        </p>
      ) : (
        <p className="text-xs text-text-tertiary mb-6 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-text-tertiary" />
          {t("offline.status")}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleRetry}
          disabled={!online}
          className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("offline.retry")}
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg text-text-secondary hover:text-text-primary border border-border hover:border-border-hover text-sm font-medium transition-colors"
        >
          {t("offline.backHome")}
        </Link>
      </div>

      {/* Tips for offline use */}
      <div className="mt-10 max-w-md w-full">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-2 text-center">
          {t("offline.tipsTitle")}
        </div>
        <ul className="text-xs text-text-tertiary space-y-1.5 text-center">
          <li>{t("offline.tip1")}</li>
          <li>{t("offline.tip2")}</li>
        </ul>
      </div>
    </div>
  );
}
