"use client";

import { useTranslations } from "next-intl";

export default function LoadingVisualizer() {
  const t = useTranslations();
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg-primary">
      <div className="relative">
        {/* Spinner */}
        <div
          className="w-12 h-12 rounded-full border-[3px] border-border border-t-[#FF6B6B] animate-spin"
          style={{
            animationDuration: "0.8s",
          }}
        />
      </div>
      {/* Loading text */}
      <p className="mt-4 text-sm text-text-secondary font-medium">
        {t("reference.loading.text")}
      </p>
    </div>
  );
}
