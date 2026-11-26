import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Analytics } from "@/components/Analytics";
import { ClientBackground } from "@/components/layout/ClientBackground";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { SITE_URL_FALLBACK, SITE_NAME } from "@/constants/site";
import { THEME_STORAGE_KEY } from "@/constants/storage";
import { Button } from "@/components/ui/Button";

const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var theme = stored === "light" || stored === "dark" ? stored : null;
    if (!theme) {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();`;

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e9898" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments without building complex payment infrastructure.",

  // ── Canonical base URL ────────────────────────────────────────────────────
  // Required so Next.js can resolve all relative image/icon URLs in metadata
  // to absolute URLs, and so that alternates.canonical emits the correct href.
  // Eliminates the "metadataBase property in metadata export is not set" build
  // warning and prevents search engines from indexing duplicate versions of the
  // site (e.g. www subdomain, Vercel preview URLs).
  metadataBase: new URL(SITE_URL_FALLBACK),

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
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark-32x32.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-dark-16x16.png",
        sizes: "16x16",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // ── PWA manifest ──────────────────────────────────────────────────────────
  manifest: "/site.webmanifest",

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    title: "OFFER-HUB | The Future of On-Chain Bounties",
    description:
      "OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments without building complex payment infrastructure.",
    url: SITE_URL_FALLBACK,
    siteName: SITE_NAME,
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
    // suppressHydrationWarning is required because the blocking theme script below
    // mutates documentElement's class before React hydrates, which React would
    // otherwise flag as a class-attribute mismatch on <html>.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased relative min-h-screen">
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
        <Button
          href="#main-content"
          size="lg"
          className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-[9999]"
        >
          Skip to main content
        </Button>
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Analytics />
          <ClientBackground />
          <div id="main-content" className="w-full max-w-full min-w-0 overflow-x-clip">
            {children}
          </div>
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
