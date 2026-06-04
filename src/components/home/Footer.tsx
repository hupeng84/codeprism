import Link from "next/link";
import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/home/LogoMark";

/** Canonical project repo. All footer/header/social links go here. */
const REPO_URL = "https://github.com/hupeng84/codeprism";
/** Direct "new issue" form — used for the Feedback link in the footer. */
const NEW_ISSUE_URL = `${REPO_URL}/issues/new`;

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-.93-.015-1.74-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

function FooterLink({ label, href }: { label: string; href: string }) {
  const t = useTranslations();
  if (href === REPO_URL || href === NEW_ISSUE_URL) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block text-sm text-text-secondary py-1 no-underline hover:text-text-primary transition-colors">
        {label}
      </a>
    );
  }
  if (label === t("footer.shortcuts")) {
    return (
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
        className="block text-sm text-text-secondary py-1 no-underline hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none text-left w-full"
      >
        {label}
      </button>
    );
  }
  return (
    <Link href={href} className="block text-sm text-text-secondary py-1 no-underline hover:text-text-primary transition-colors">
      {label}
    </Link>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
      aria-label={label}
    >
      {icon}
    </a>
  );
}

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <LogoMark />
              <span className="font-heading text-lg font-semibold">Code<span className="text-accent-coral font-bold">Prism</span></span>
            </div>
            <p className="text-sm text-text-tertiary leading-relaxed max-w-[260px] mb-4">{t("footer.desc")}</p>
            {/* Social links */}
            <SocialLink href={REPO_URL} icon={<GitHubIcon />} label="GitHub" />
          </div>
            {[
              { title: t("footer.content"), links: [{ label: t("footer.patterns"), href: "/patterns" }, { label: t("footer.structures"), href: "/structures" }, { label: t("footer.algorithms"), href: "/algorithms" }, { label: t("footer.complexity"), href: "/reference" }] },
              { title: t("footer.features"), links: [{ label: t("footer.compareMode"), href: "/compare" }, { label: t("footer.sandbox"), href: "/algorithms" }, { label: t("footer.progress"), href: "/patterns" }, { label: t("footer.shortcuts"), href: "#" }] },
               { title: t("footer.about"), links: [{ label: t("footer.aboutProject"), href: "/" }, { label: t("reference.footer.github"), href: REPO_URL }, { label: t("footer.feedback"), href: NEW_ISSUE_URL }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-4">{col.title}</h4>
                {col.links.map((link) => (
                  <FooterLink key={link.label} label={link.label} href={link.href} />
                ))}
              </div>
            ))}
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-tertiary">
          <span>© 2026 CodePrism. PolyForm Noncommercial License.</span>
          <span>{t("reference.footer.builtWith")}</span>
        </div>
      </div>
    </footer>
  );
}