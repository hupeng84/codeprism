"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { track } from "@/lib/analytics";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  /** True if the user has explicitly set a theme; false if auto-detected. */
  isExplicit: boolean;
  /** Reset the explicit choice so the theme follows the OS again. */
  resetToAuto: () => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

const STORAGE_KEY = "codeprism-theme";
const EXPLICIT_KEY = "codeprism-theme-explicit";

/** Read the OS-level preferred color scheme; defaults to "dark". */
function detectOsTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Server render: assume dark. The client useEffect will correct it.
  const [theme, setTheme] = useState<Theme>("dark");
  const [isExplicit, setIsExplicit] = useState(false);

  // On mount: read explicit choice (if any) OR auto-detect from OS.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const explicit = localStorage.getItem(EXPLICIT_KEY) === "1";
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      setIsExplicit(explicit);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      const detected = detectOsTheme();
      setTheme(detected);
      setIsExplicit(false);
      document.documentElement.setAttribute("data-theme", detected);
    }
  }, []);

  // When the user has NOT explicitly chosen a theme, follow the OS-level
  // changes in real-time. (When explicit, the user's choice is sticky.)
  useEffect(() => {
    if (isExplicit) return;
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => {
      const next: Theme = e.matches ? "light" : "dark";
      setTheme(next);
      document.documentElement.setAttribute("data-theme", next);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [isExplicit]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      localStorage.setItem(EXPLICIT_KEY, "1");
      setIsExplicit(true);
      document.documentElement.setAttribute("data-theme", next);
      track({ type: "theme_changed", theme: next });
      return next;
    });
  }, []);

  const resetToAuto = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EXPLICIT_KEY);
    setIsExplicit(false);
    const detected = detectOsTheme();
    setTheme(detected);
    document.documentElement.setAttribute("data-theme", detected);
    track({ type: "theme_changed", theme: "auto" });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isExplicit, resetToAuto, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
