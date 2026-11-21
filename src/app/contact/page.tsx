import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  MessageCircle,
  Github,
  Mail,
  Clock,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { ContactForm } from "./ContactForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { buildPageMetadata } from "@/lib/seo";
import { SOCIAL_DISCORD } from "@/constants/social";
import { GITHUB_ORG_URL } from "@/constants/github";

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

const nextSteps = [
  {
    step: "1",
    title: "Discovery & requirements",
    description:
      "We review your marketplace workflow, escrow lifecycle, and volume expectations within 24 hours.",
    icon: Clock,
  },
  {
    step: "2",
    title: "Technical consultation",
    description:
      "A solutions engineer walks through contract architecture, API endpoints, and SDK integration.",
    icon: Cpu,
  },
  {
    step: "3",
    title: "Sandbox & onboarding",
    description:
      "Get direct sandbox credentials, SLA documentation, and a dedicated integration channel.",
    icon: ShieldCheck,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <Navbar />

      <main id="main-content" className="flex-grow pt-28 md:pt-36 pb-20">
        <section className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-theme-primary mb-3">
              Contact
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-content-primary tracking-tight mb-4">
              Contact Sales
            </h1>
            <p className="text-base md:text-lg text-content-secondary max-w-2xl mx-auto leading-relaxed">
              Share some details about your company and use case — we&apos;ll
              follow up to discuss enterprise integrations, SLAs, and pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left column: Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* Right column: Next steps, Technical questions, Contact address */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* What happens next */}
              <div className="rounded-3xl bg-bg-elevated shadow-neu-raised p-6 md:p-8">
                <h2 className="text-xl font-bold text-content-primary mb-6">
                  What happens next
                </h2>
                <div className="flex flex-col gap-6">
                  {nextSteps.map((s) => (
                    <div key={s.step} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-bg-sunken shadow-neu-sunken-subtle flex items-center justify-center text-xs font-bold text-theme-primary shrink-0 mt-0.5">
                        {s.step}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-content-primary mb-1">
                          {s.title}
                        </h3>
                        <p className="text-sm text-content-secondary leading-relaxed">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical question? */}
              <div className="rounded-3xl bg-bg-elevated shadow-neu-raised p-6 md:p-8">
                <h2 className="text-lg font-bold text-content-primary mb-2">
                  Technical question?
                </h2>
                <p className="text-sm text-content-secondary mb-4 leading-relaxed">
                  Have developer questions or exploring SDK capabilities? Check
                  out our developer resources:
                </p>
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/docs"
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-base shadow-neu-raised-sm hover:shadow-neu-raised-hover transition-all text-sm font-medium text-content-primary group min-h-11"
                  >
                    <BookOpen size={18} className="text-theme-primary shrink-0" />
                    <span>Documentation &amp; Guides</span>
                    <ArrowRight
                      size={14}
                      className="ml-auto text-content-secondary group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                  <a
                    href={SOCIAL_DISCORD}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-base shadow-neu-raised-sm hover:shadow-neu-raised-hover transition-all text-sm font-medium text-content-primary group min-h-11"
                  >
                    <MessageCircle size={18} className="text-theme-primary shrink-0" />
                    <span>Join Discord Community</span>
                    <ArrowRight
                      size={14}
                      className="ml-auto text-content-secondary group-hover:translate-x-0.5 transition-transform"
                    />
                  </a>
                  <a
                    href={GITHUB_ORG_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-base shadow-neu-raised-sm hover:shadow-neu-raised-hover transition-all text-sm font-medium text-content-primary group min-h-11"
                  >
                    <Github size={18} className="text-theme-primary shrink-0" />
                    <span>GitHub Organization</span>
                    <ArrowRight
                      size={14}
                      className="ml-auto text-content-secondary group-hover:translate-x-0.5 transition-transform"
                    />
                  </a>
                </div>
              </div>

              {/* Contact address */}
              <div className="rounded-3xl bg-bg-elevated shadow-neu-raised p-6 md:p-8">
                <h2 className="text-base font-bold text-content-primary mb-2">
                  Contact Address
                </h2>
                <p className="text-sm text-content-secondary mb-4 leading-relaxed">
                  Reach out directly to our enterprise solutions and partnership
                  team:
                </p>
                <a
                  href="mailto:contact@offer-hub.tech"
                  className="inline-flex items-center gap-2.5 text-sm font-semibold text-theme-primary hover:underline min-h-11"
                >
                  <Mail size={18} />
                  <span>contact@offer-hub.tech</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
