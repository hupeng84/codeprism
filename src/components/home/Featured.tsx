import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

interface FeaturedItem {
  icon: React.ReactNode;
  title: string;
  titleEn?: string;
  desc: string;
  badge: string;
  badgeClass: string;
  tagKey: string;
  href: string;
  duration: string;
}

function BubbleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <circle cx="12" cy="16" r="3" />
    </svg>
  );
}

function ObserverIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
      <path d="M12 2a7 7 0 0 1 7 7h-7V2Z" />
      <path d="M12 12 8 16" />
    </svg>
  );
}

function TreeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-6" />
      <path d="M12 16l-4-4h8l-4 4Z" />
      <path d="M12 12l-4-4h8l-4 4Z" />
    </svg>
  );
}

function QuickSortIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M6 6v12" />
      <path d="M10 6v8" />
      <path d="M14 6v12" />
      <path d="M18 6v4" />
    </svg>
  );
}

function HeapSortIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l-8 8h5v8h6v-8h5l-8-8Z" />
    </svg>
  );
}

function AStarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function Featured() {
  const t = useTranslations();
  const locale = useLocale();

  const featured: FeaturedItem[] = [
    { icon: <BubbleIcon />, title: t("featured.items.bubbleSort.title"), desc: t("featured.items.bubbleSort.desc"), badge: t("featured.badge.beginner"), badgeClass: "bg-accent-teal-soft text-accent-teal", tagKey: "sorting", href: `/${locale}/visualizer/algorithm/bubble-sort`, duration: "5 min" },
    { icon: <ObserverIcon />, title: t("featured.items.observer.title"), desc: t("featured.items.observer.desc"), badge: t("featured.badge.intermediate"), badgeClass: "bg-accent-gold-soft text-accent-gold", tagKey: "behavioral", href: `/${locale}/visualizer/pattern/observer`, duration: "8 min" },
    { icon: <TreeIcon />, title: t("featured.items.bst.title"), desc: t("featured.items.bst.desc"), badge: t("featured.badge.beginner"), badgeClass: "bg-accent-teal-soft text-accent-teal", tagKey: "tree", href: `/${locale}/visualizer/structure/bst`, duration: "6 min" },
    { icon: <QuickSortIcon />, title: t("featured.items.quickSort.title"), desc: t("featured.items.quickSort.desc"), badge: t("featured.badge.intermediate"), badgeClass: "bg-accent-gold-soft text-accent-gold", tagKey: "sorting", href: `/${locale}/visualizer/algorithm/quick-sort`, duration: "10 min" },
    { icon: <HeapSortIcon />, title: t("featured.items.heapSort.title"), desc: t("featured.items.heapSort.desc"), badge: t("featured.badge.advanced"), badgeClass: "bg-accent-coral-soft text-accent-coral", tagKey: "sorting", href: `/${locale}/visualizer/algorithm/heap-sort`, duration: "15 min" },
    { icon: <AStarIcon />, title: t("featured.items.astar.title"), desc: t("featured.items.astar.desc"), badge: t("featured.badge.advanced"), badgeClass: "bg-accent-coral-soft text-accent-coral", tagKey: "graph", href: `/${locale}/visualizer/graph/a-star`, duration: "20 min" },
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-1">{t("featured.title")}</h2>
            <p className="text-text-secondary">{t("featured.subtitle")}</p>
          </div>
          <Link href={`/${locale}/patterns`} className="text-xs font-medium text-text-secondary px-4 py-2 border border-border rounded-md no-underline hover:text-text-primary hover:border-border-hover transition-colors">
            {t("featured.viewAll")}
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((item) => (
            <Link key={item.title} href={item.href} className="featured-card block bg-bg-card border border-border rounded-xl p-6 no-underline">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent-coral-soft flex items-center justify-center text-text-primary shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-text-primary leading-tight">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.badgeClass}`}>{item.badge}</span>
                    <span className="text-xs text-text-tertiary">{item.duration}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">{item.desc}</p>
              <div className="text-xs text-text-tertiary">
                {t(`featured.tags.${item.tagKey}`)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}