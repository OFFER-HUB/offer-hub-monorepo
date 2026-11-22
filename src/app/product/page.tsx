import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { ProductPageClient } from "@/components/product/ProductPageClient";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Product Architecture & Roadmap",
  description:
    "Explore the OFFER-HUB product: system architecture, non-custodial escrow on Stellar, NestJS payment orchestrator, marketplace templates, and unified delivery roadmap.",
  keywords: [
    "product",
    "architecture",
    "orchestrator",
    "stellar",
    "soroban",
    "escrow",
    "marketplace",
    "roadmap",
    "OFFER-HUB",
    "USDC",
    "LATAM",
  ],
  path: "/product",
  ogImageAlt: "OFFER-HUB Product — Architecture, Orchestrator, Templates & Roadmap",
});

export default function ProductPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <LoadingBar />
      <Navbar />

      <main className="flex-grow">
        <ProductPageClient />
      </main>

      <Footer />
    </div>
  );
}
