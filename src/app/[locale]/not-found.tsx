"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations();
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-bg-primary gap-6">
      <div className="text-6xl font-bold text-text-tertiary select-none">404</div>
      <h1 className="text-xl font-semibold text-text-primary">{t("error.notFound")}</h1>
      <p className="text-sm text-text-tertiary max-w-md text-center">
        {t("error.notFoundDesc")}
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {t("error.backHome")}
      </Link>
    </div>
  );
}
