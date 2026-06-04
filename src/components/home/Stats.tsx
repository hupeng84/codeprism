"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  sublabel: string;
}

function useCountUp(target: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const startValue = 0;

      function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (target - startValue) * easeOut);

        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [started, target, duration, delay]);

  return { count, ref };
}

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const { count, ref } = useCountUp(stat.value, 1500, index * 150);

  return (
    <div ref={ref} className="stat-card p-6 text-center">
      <div className="count-up-number" style={{ animationDelay: `${index * 150}ms` }}>
        <div className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-2">
          <span className="bg-gradient-to-r from-accent-coral to-accent-gold bg-clip-text text-transparent">
            {count}
          </span>
          <span className="text-3xl md:text-4xl text-accent-coral">{stat.suffix}</span>
        </div>
        <div className="font-heading text-lg font-semibold text-text-primary mb-1">{stat.label}</div>
        <div className="text-sm text-text-tertiary">{stat.sublabel}</div>
      </div>
    </div>
  );
}

export function Stats() {
  const t = useTranslations();

  const stats: StatItem[] = [
    {
      value: 59,
      suffix: "+",
      label: t("stats.algorithms.label"),
      sublabel: t("stats.algorithms.sublabel"),
    },
    {
      value: 23,
      suffix: "",
      label: t("stats.patterns.label"),
      sublabel: t("stats.patterns.sublabel"),
    },
    {
      value: 16,
      suffix: "",
      label: t("stats.structures.label"),
      sublabel: t("stats.structures.sublabel"),
    },
    {
      value: 10,
      suffix: "+",
      label: t("stats.visualizers.label"),
      sublabel: t("stats.visualizers.sublabel"),
    },
  ];

  return (
    <section className="stats-section py-16 relative">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center mb-10">
          <p className="text-text-secondary text-base">{t("stats.tagline")}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}