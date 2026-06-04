"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

/**
 * Floating "back to top" button. Rendered once globally by ClientShell.
 * Hidden until the page has been scrolled past `SCROLL_THRESHOLD` so it
 * doesn't appear on short pages or the locked-viewport visualizer.
 */
const SCROLL_THRESHOLD = 400;

export function BackToTop() {
  const t = useTranslations();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  // Re-sync on every route change — Next.js scrolls to top on navigation,
  // but doesn't always fire a scroll event the listener can catch.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("backToTop")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full border bg-bg-card/90 backdrop-blur-md shadow-lg flex items-center justify-center transition-all duration-200 hover:border-accent-coral hover:text-accent-coral ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
      style={{
        borderColor: "var(--app-border)",
        color: "var(--app-text-primary)",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
