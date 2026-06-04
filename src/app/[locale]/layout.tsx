import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import "../globals.css";
import { ClientShell } from "@/components/ClientShell";
import { AchievementToast } from "@/components/visualizer/AchievementToast";
import { BenchmarkPanel } from "@/components/dev/BenchmarkPanel";
import { SwUpdateToast } from "@/components/dev/SwUpdateToast";

export const metadata: Metadata = {
  title: "CodePrism — Interactive Visual Tutorials",
  description: "Visualize Design Patterns, Data Structures & Algorithms through step-by-step animations",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CodePrism",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0E1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className="antialiased"
      // `data-theme` is intentionally NOT rendered server-side: the
      // inline script below sets it from localStorage before React
      // hydrates, so the DOM value may differ from a static "dark"
      // default. `suppressHydrationWarning` tells React to trust the
      // post-script DOM and not bail out of hydration. Without this,
      // a user with `codeprism-theme=light` in localStorage triggers
      // a root-level mismatch and the entire subtree (including
      // MermaidUMLCanvas) silently fails to mount.
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('codeprism-theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <ClientShell>{children}</ClientShell>
          {/* Toasts must live INSIDE the provider — they call
              useTranslations() and the context isn't available above. */}
          <AchievementToast />
          <SwUpdateToast />
          <BenchmarkPanel />
        </NextIntlClientProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){if(location.hostname==='localhost'||location.hostname==='127.0.0.1'){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(s){s.unregister()})})}else{window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}}`,
          }}
        />
      </body>
    </html>
  );
}
