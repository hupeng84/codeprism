"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";

function useSortAnimation() {
  const [bars, setBars] = useState([40, 65, 30, 90, 55, 75, 45, 85]);
  const timeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const initialArr = [40, 65, 30, 90, 55, 75, 45, 85];
    const arr = [...initialArr];
    const n = arr.length;
    const totalSteps = (n * (n - 1)) / 2;
    const ids: ReturnType<typeof setTimeout>[] = [];

    function scheduleLoop() {
      let step = 0;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          }
          step++;
          // Capture current step value in closure
          const currentStep = step;
          const id = setTimeout(() => {
            setBars([...arr]);
            // Use captured step value for comparison
            if (currentStep >= totalSteps) {
              const idle = setTimeout(() => {
                setBars(initialArr);
                scheduleLoop();
              }, 2000);
              ids.push(idle);
            }
          }, currentStep * 120);
          ids.push(id);
        }
      }
      timeoutIds.current = ids;
    }

    const startId = setTimeout(scheduleLoop, 500);
    timeoutIds.current = [startId];

    return () => {
      timeoutIds.current.forEach(clearTimeout);
      timeoutIds.current = [];
    };
  }, []);
  return bars;
}

function SortDemo() {
  const bars = useSortAnimation();
  return (
    <div className="flex items-end gap-1.5 h-[120px]">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-[4px_4px_0_0] transition-all duration-500"
          style={{
            height: `${h}px`,
            background: i % 2 === 0
              ? "linear-gradient(135deg, #FF6B6B, #FF8E53)"
              : "linear-gradient(135deg, #4ECDC4, #44B3AB)",
            opacity: 0.7 + (h / 100) * 0.3,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section className="min-h-screen flex items-center relative overflow-hidden pt-20">
      <div className="absolute top-[-50%] right-[-20%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,107,107,0.08), transparent 70%)" }}
      />
      <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(78,205,196,0.06), transparent 70%)" }}
      />
      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-coral-soft border border-accent-coral/20 rounded-full text-sm font-medium text-accent-coral mb-6"
              style={{ animation: "fadeInUp 0.5s both var(--ease-out)" }}>
              {t("hero.badge")}
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
              style={{ animation: "fadeInUp 0.5s 0.1s both var(--ease-out)" }}>
              {t("hero.title.1")}
              <span className="block text-5xl md:text-7xl mt-2 bg-gradient-to-r from-accent-coral via-accent-gold to-accent-teal bg-clip-text text-transparent">
                {t("hero.title.2")}
              </span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed max-w-[480px] mb-8"
              style={{ animation: "fadeInUp 0.5s 0.2s both var(--ease-out)" }}>
              {t("hero.desc")}
            </p>
            <div className="flex gap-4 items-center"
              style={{ animation: "fadeInUp 0.5s 0.3s both var(--ease-out)" }}>
              <a href={`/${locale}/patterns`} className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-white bg-gradient-to-r from-accent-coral to-accent-gold shadow-lg shadow-accent-coral/25 no-underline hover:-translate-y-0.5 hover:shadow-xl transition-all">
                {t("hero.cta.start")}
              </a>
              <a href={`/${locale}/algorithms`} className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-text-primary bg-bg-card border border-border no-underline hover:border-border-hover hover:-translate-y-0.5 transition-all">
                {t("hero.cta.browse")}
              </a>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hidden lg:block z-10">
            <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <span className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                <span className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                <span className="w-2 h-2 rounded-full bg-[#27C93F]" />
                <span className="ml-auto text-xs text-text-tertiary font-code">sorting-vis.html</span>
              </div>
              <div className="p-6">
                <SortDemo />
                <div className="flex justify-center gap-4 mt-4">
                  {["🔍", "⚡", "🧩"].map((icon, i) => (
                    <div key={i} className="w-[50px] h-[50px] rounded-full border-2 border-border flex items-center justify-center text-xl hover:border-accent-coral hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer">
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-tertiary animate-bounce cursor-pointer text-xl">
        ⌄
      </div>
    </section>
  );
}
