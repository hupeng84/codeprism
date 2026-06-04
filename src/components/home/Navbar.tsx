"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useTranslations, useLocale } from "next-intl";
import { LogoMark } from "@/components/home/LogoMark";

/** Canonical project repo. Kept in sync with Footer.tsx. */
const REPO_URL = "https://github.com/hupeng84/codeprism";

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-.93-.015-1.74-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations();
  const locale = useLocale();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: t("nav.home"), href: `/${locale}` },
    { label: t("nav.patterns"), href: `/${locale}/patterns` },
    { label: t("nav.structures"), href: `/${locale}/structures` },
    { label: t("nav.algorithms"), href: `/${locale}/algorithms` },
    { label: t("nav.compare"), href: `/${locale}/compare` },
    { label: t("nav.reference"), href: `/${locale}/reference` },
    { label: t("nav.achievements"), href: `/${locale}/achievements` },
  ];

  function isActive(href: string) {
    // Home (/${locale}) is only active on the exact home path; other links
    // also match their sub-paths (e.g. /en/visualizer/... → no nav match).
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  function switchLocale() {
    const newLocale = locale === "zh" ? "en" : "zh";
    // Replace the locale segment in the current path
    const pathWithoutLocale = pathname.replace(/^\/(zh|en)/, "") || "/";
    router.push(`/${newLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`);
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-250 ${
        scrolled
          ? "bg-bg-primary/85 backdrop-blur-xl border-b border-border/50 py-3"
          : "py-4"
      }`}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
    >
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        {/* Hamburger menu — mobile only */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-sidebar-nav"))}
          className="md:hidden w-9 h-9 flex items-center justify-center border border-border rounded-md bg-transparent text-text-secondary cursor-pointer hover:border-border-hover hover:text-text-primary transition-colors"
          aria-label={t("reference.aria.toggleNav")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18" />
            <path d="M3 6h18" />
            <path d="M3 18h18" />
          </svg>
        </button>

        {/* Logo — link to home */}
        <Link href={`/${locale}`} className="flex items-center gap-2.5 no-underline">
          <LogoMark />
          <span className="font-heading text-[22px] font-semibold text-text-primary tracking-tight">
            Code<span className="font-bold bg-gradient-to-r from-accent-coral to-accent-gold bg-clip-text text-transparent">Prism</span>
          </span>
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
          {navLinks.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium no-underline transition-colors duration-150 ${
                    active
                      ? "text-accent-coral bg-accent-coral-soft"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-glass-light"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-bg-input border border-border rounded-md text-text-secondary text-xs cursor-pointer hover:border-border-hover hover:bg-bg-card transition-colors"
          >
            🔍 <span>{t("nav.search")}</span>
            <kbd className="px-1.5 py-0.5 bg-bg-glass-light border border-border rounded text-[11px] font-code text-text-tertiary">⌘K</kbd>
          </div>
          {/* Language switcher */}
          <button
            onClick={switchLocale}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-md bg-transparent text-text-secondary cursor-pointer hover:border-border-hover hover:text-text-primary transition-colors text-xs font-medium"
            aria-label={`Switch to ${t("lang.switch")}`}
            title={t("lang.switch")}
          >
            {locale === "zh" ? "EN" : "中"}
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center border border-border rounded-md bg-transparent text-text-secondary cursor-pointer hover:border-border-hover hover:text-text-primary transition-colors"
            aria-label={theme === "dark" ? t("reference.aria.switchTheme", {theme: "light"}) : t("reference.aria.switchTheme", {theme: "dark"})}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 flex items-center justify-center border border-border rounded-md bg-transparent text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
            aria-label={t("reference.footer.github")}
            title={t("reference.footer.github")}
          >
            <GitHubIcon />
          </a>
        </div>
      </div>
    </nav>
  );
}
