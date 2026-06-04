import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/config.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@codeprism/core", "@codeprism/ui", "@codeprism/content"],
  // ── Production hardening ────────────────────────────────────────────
  // SWC is always used for minification in Next.js 13+; no opt-in needed.
  // What we do add:
  //   • removeConsole — strip `console.log` / `console.info` / etc. from
  //     the production bundle. We keep `error` + `warn` so users can
  //     copy console output when filing bug reports.
  //   • productionBrowserSourceMaps: false (explicit) — keep `.map` files
  //     out of the deployed bundle so original source never ships.
  //   • Note: Next.js has no `removeDebugger` compiler option. `debugger`
  //     statements are rare in this codebase and harmless when shipped
  //     (only fire when DevTools is open and the user is stepping).
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },
  productionBrowserSourceMaps: false,
  experimental: {
    // Improve tree-shaking for barrel-heavy libs used across many pages.
    // next-intl and lucide-react re-export lots of symbols; without this
    // Next bundles more than is actually referenced per route.
    optimizePackageImports: ["next-intl", "lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // Notes on the relaxation:
            //   • 'unsafe-eval' — Monaco Editor creates Web Workers via
            //     `new Function(...)`. Inlining a real hash/nonce would break
            //     it; we accept this for now.
            //   • 'unsafe-inline' in style-src — Next.js injects inline
            //     styles for hydration-mismatch warnings. Same trade-off.
            //   • 'unsafe-inline' in script-src — only matters in dev; prod
            //     bundles are external.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
              "worker-src 'self' blob:",
              "frame-src 'none'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);