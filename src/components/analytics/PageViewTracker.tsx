"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { track } from "@/lib/analytics";

/**
 * PageViewTracker — fires a `page_view` event on every route change.
 * Mount once near the root (e.g. in ClientShell).
 *
 * The event is dropped automatically by `track()` if consent is not granted
 * or DNT is enabled, so this is safe to render unconditionally.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    track({ type: "page_view", path: pathname, locale });
  }, [pathname, locale]);

  return null;
}
