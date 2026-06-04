"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.remove("animate-fadeInPage");
    // Force reflow so the browser picks up the class removal
    void el.offsetWidth;
    el.classList.add("animate-fadeInPage");
  }, [pathname]);

  return <div ref={ref} className="animate-fadeInPage">{children}</div>;
}
