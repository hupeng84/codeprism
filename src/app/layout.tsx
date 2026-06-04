import { type ReactNode } from "react";
import "./globals.css";

// Root layout is minimal - locale routing handled by middleware
// All pages are under [locale] route
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}