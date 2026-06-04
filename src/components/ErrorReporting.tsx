"use client";

import { useEffect } from "react";
import { installGlobalErrorHandlers } from "@/lib/error-reporter";

/**
 * ErrorReporting — mounts `window.onerror` and `unhandledrejection`
 * listeners for the lifetime of the page. Place near the root of the
 * app (e.g. inside ClientShell) so errors are captured as early as
 * possible.
 *
 * The listeners are removed on unmount, but in practice this component
 * lives for the entire session, so they stay active.
 */
export function ErrorReporting() {
  useEffect(() => {
    return installGlobalErrorHandlers();
  }, []);
  return null;
}
