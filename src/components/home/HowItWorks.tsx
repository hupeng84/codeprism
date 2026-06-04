"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`step-card relative flex flex-col items-center text-center transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Step number badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-accent-coral to-accent-gold flex items-center justify-center text-sm font-bold text-white z-10">
        {index + 1}
      </div>

      {/* Icon circle */}
      <div className="w-20 h-20 rounded-full bg-bg-card border border-border flex items-center justify-center mb-6 transition-transform duration-300 hover:scale-110 hover:border-accent-coral">
        <div className="text-3xl">{step.icon}</div>
      </div>

      {/* Content */}
      <h3 className="font-heading text-xl font-bold mb-2 text-text-primary">{step.title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed max-w-[240px]">{step.desc}</p>

      {/* Connector line - only show on desktop and between steps */}
      {index < 2 && (
        <div
          className={`hidden md:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 step-connector-animated`}
          style={{
            animationDelay: `${(index + 1) * 200}ms`,
            background: "linear-gradient(90deg, var(--color-accent-coral), var(--color-accent-gold))",
          }}
        />
      )}
    </div>
  );
}

export function HowItWorks() {
  const t = useTranslations();

  const steps: Step[] = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      title: t("howItWorks.steps.visualize.title"),
      desc: t("howItWorks.steps.visualize.desc"),
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      ),
      title: t("howItWorks.steps.interact.title"),
      desc: t("howItWorks.steps.interact.desc"),
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
          <path d="M12 2a7 7 0 0 1 7 7h-7V2Z" />
          <path d="M12 12 8 16" />
          <path d="M12 12 16 16" />
        </svg>
      ),
      title: t("howItWorks.steps.understand.title"),
      desc: t("howItWorks.steps.understand.desc"),
    },
  ];

  return (
    <section className="how-it-works-section py-20">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3 text-text-primary">
            {t("howItWorks.title")}
          </h2>
          <p className="text-text-secondary text-base max-w-[480px] mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}