import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";
import { buildPageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/shared/PageHeader";

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
          <PageHeader
            align="center"
            className="mb-12"
            eyebrow="Contact"
            title="Contact Sales"
            lead="Share some details about your company and use case — we'll follow up to discuss enterprise integrations, SLAs, and pricing."
          />

          <ContactForm />
        </section>
      </main>
    </div>
  );
}
