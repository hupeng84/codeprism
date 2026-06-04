"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StructuresError({ error, reset }: ErrorProps) {
  const t = useTranslations();
  useEffect(() => {
    console.error("[Structures Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center max-w-md px-6 text-center">
        <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-[rgba(255,107,107,0.15)]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">{t("error.algoLoad")}</h2>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          {t("error.algoLoadDesc")}
        </p>
        <div className="flex items-center gap-3">
          <Link href="/" className="px-5 py-2.5 text-sm font-medium text-text-secondary bg-bg-card hover:bg-bg-card-hover border border-border rounded-lg transition-colors">
            {t("error.backHome")}
          </Link>
          <button onClick={reset} className="px-5 py-2.5 text-sm font-medium text-white bg-[#FF6B6B] hover:bg-[#FF5252] rounded-lg transition-colors">
            {t("error.retry")}
          </button>
        </div>
      </div>
    </div>
  );
}
