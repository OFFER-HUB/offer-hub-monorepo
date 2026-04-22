import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import Analytics from "@/components/Analytics";
import { ClientBackground } from "@/components/layout/ClientBackground";
import { NavigationProgress } from "@/components/ui/NavigationProgress";
import { FloatingCTA } from "@/components/ui/FloatingCTA";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://offer-hub.tech"),
  title: {
    default: "OFFER-HUB — Secure Non-Custodial Escrow for Marketplaces",
    template: "%s | OFFER-HUB",
  },
  description:
    "OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments powered by Stellar smart contracts — without building complex payment infrastructure.",
  keywords: [
    "escrow",
    "marketplace",
    "Stellar",
    "smart contracts",
    "freelance",
    "payments",
    "blockchain",
    "non-custodial",
    "open source",
  ],
  authors: [{ name: "OFFER-HUB", url: "https://offer-hub.tech" }],
  creator: "OFFER-HUB",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://offer-hub.tech",
    siteName: "OFFER-HUB",
    title: "OFFER-HUB — Secure Non-Custodial Escrow for Marketplaces",
    description:
      "Build trustless commerce with non-custodial escrow powered by Stellar smart contracts. Open-source, self-hostable, enterprise-ready.",
    images: [
      {
        url: "/OFFER-HUB-logo.png",
        width: 512,
        height: 512,
        alt: "OFFER-HUB Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "OFFER-HUB — Secure Non-Custodial Escrow for Marketplaces",
    description:
      "Build trustless commerce with non-custodial escrow powered by Stellar smart contracts.",
    images: ["/OFFER-HUB-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className={`${inter.className} antialiased relative min-h-screen`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Analytics />
          <ClientBackground />
          {children}
          <FloatingCTA />
        </ThemeProvider>
      </body>
    </html>
  );
}
