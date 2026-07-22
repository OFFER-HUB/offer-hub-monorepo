import type { Metadata } from "next";
import ContactForm from "./ContactForm.client";
import { buildPageMetadata } from "@/lib/seo";

// Title was "Contact Sales | OFFER-HUB", which the root layout's "%s | OFFER-HUB"
// template rendered as "Contact Sales | OFFER-HUB | OFFER-HUB".
export const metadata: Metadata = buildPageMetadata({
  title: "Contact Sales",
  description:
    "Contact OFFER-HUB sales for enterprise inquiries — tell us about your company, needs, and we'll reach out to discuss enterprise integrations and support.",
  keywords: [
    "contact",
    "sales",
    "enterprise",
    "support",
    "integrations",
    "OFFER-HUB",
  ],
  path: "/contact",
  ogImageAlt: "Contact OFFER-HUB Sales — enterprise integrations and support",
});

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-theme-primary mb-4">Contact</p>
            <h1 className="text-4xl font-black text-content-primary tracking-tight mb-4">Contact Sales</h1>
            <p className="text-lg text-content-secondary">Share some details about your company and use case — we&apos;ll follow up to discuss enterprise integrations, SLAs, and pricing.</p>
          </div>

          <ContactForm />
        </section>
      </main>
    </div>
  );
}
