import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
// @ts-ignore: CSS side-effect import declarations are handled by Next.js
import "./globals.css";
import Analytics from "@/components/Analytics";
import { ClientBackground } from "@/components/layout/ClientBackground";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { FloatingCTA } from "@/components/ui/FloatingCTA";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import CookieConsentBanner from "@/components/CookieConsentBanner";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e9898" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "OFFER-HUB",
    template: "%s | OFFER-HUB",
  },
  description:
    "OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments without building complex payment infrastructure.",

  // ── Canonical base URL ────────────────────────────────────────────────────
  // Required so Next.js can resolve all relative image/icon URLs in metadata
  // to absolute URLs, and so that alternates.canonical emits the correct href.
  // Eliminates the "metadataBase property in metadata export is not set" build
  // warning and prevents search engines from indexing duplicate versions of the
  // site (e.g. www subdomain, Vercel preview URLs).
  metadataBase: new URL("https://offer-hub.tech"),

  // ── Canonical URL ─────────────────────────────────────────────────────────
  // Next.js resolves '/' against metadataBase and injects
  //   <link rel="canonical" href="https://offer-hub.tech/" />
  // on every page that inherits this root layout metadata, consolidating link
  // equity and preventing duplicate-content penalties from alternate hostnames.
  alternates: {
    canonical: "/",
  },

  // ── Favicon & icon variants ──────────────────────────────────────────────
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },

  // ── PWA manifest ──────────────────────────────────────────────────────────
  manifest: "/site.webmanifest",

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    title: "OFFER-HUB | The Future of On-Chain Bounties",
    description:
      "OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments without building complex payment infrastructure.",
    url: "https://offer-hub.tech",
    siteName: "OFFER-HUB",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "OFFER-HUB - Secure, non-custodial escrow for your marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // ── Twitter / X card ─────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "OFFER-HUB | The Future of On-Chain Bounties",
    description:
      "OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments without building complex payment infrastructure.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased relative min-h-screen`}>
        <noscript>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              background: "#1a1a2e",
              color: "#f1f3f7",
              textAlign: "center",
              padding: "12px",
              fontFamily: "sans-serif",
              fontSize: "14px",
              zIndex: 9999,
            }}
          >
            This site requires JavaScript to function. Please enable JavaScript in your browser settings.
          </div>
        </noscript>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6  focus:z-[9999] px-8 py-10 rounded-full text-sm font-semibold btn-neumorphic-primary outline-none transition-none"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Analytics />
          <ClientBackground />
          <div id="main-content">
            {children}
          </div>
          <FloatingCTA />
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}