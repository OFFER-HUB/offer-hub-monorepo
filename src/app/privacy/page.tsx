"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import {
  Mail,
  Cookie,
  ShieldCheck,
  Link2,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Data Collection Policy",
    description:
      "We collect information you voluntarily provide when creating an account, setting up your marketplace, or contacting support — including your name, email address, business details, and payment information. We also automatically collect technical data such as IP addresses, browser type, device identifiers, and interaction logs to ensure the stability, security, and performance of Offer Hub.",
    large: false,
    iconColor: "#149A9B",
  },
  {
    icon: Cookie,
    title: "Cookies",
    description:
      "We use essential cookies to keep you logged in and maintain your session. With your consent, we may use analytics cookies to understand how users navigate the platform. These are never used for advertising. You can manage your preferences at any time via your browser settings or our cookie preference center.",
    large: false,
    iconColor: "#149A9B",
  },
  {
    icon: Link2,
    title: "Third-Party Services",
    description:
      "Offer Hub integrates with carefully selected third-party services. Payment processing is handled by PCI-compliant providers — we never store raw card data. Infrastructure providers may process your data under strict agreements aligned with GDPR. We do not sell your data to third parties, nor share it with advertisers.",
    large: false,
    iconColor: "#149A9B",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-24">

        {/* Heading */}
        <div className="text-center mb-20 md:mb-28 animate-fadeInUp">
          <p
            className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 text-[#149A9B]">
            Data Governance
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-[#19213D] leading-none mb-6"
          >
            Privacy & <span className="text-[#149A9B]">Transparency</span>
          </h1>
          <p
            className="mt-4 text-lg sm:text-xl font-medium max-w-2xl mx-auto px-2 text-[#6D758F] leading-relaxed"
          >
            We believe in full transparency about how we handle your data.
            Privacy is a feature, not an afterthought.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F1F3F7] shadow-raised-sm text-xs font-bold text-[#6D758F]">
            Last updated: <span className="text-[#149A9B]">February 25, 2026</span>
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`${feature.large ? "sm:col-span-2 md:col-span-2" : ""
                  } p-10 rounded-[2.5rem] shadow-raised flex flex-col gap-6 group hover:shadow-raised-hover transition-all duration-500`}
                style={{ background: "#F1F3F7" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl shadow-sunken-subtle flex items-center justify-center shrink-0 bg-[#F1F3F7] group-hover:shadow-sunken transition-all duration-300"
                >
                  <Icon size={24} style={{ color: "#149A9B" }} />
                </div>
                <div>
                  <h3
                    className={`font-black tracking-tight mb-4 ${feature.large ? "text-2xl" : "text-xl"} text-[#19213D]`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`font-medium leading-relaxed ${feature.large ? "text-base" : "text-sm"} text-[#6D758F]`}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact card */}
        <div
          className="p-8 sm:p-12 md:p-14 rounded-[3rem] shadow-raised flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-14 mt-16 bg-[#F1F3F7]"
        >
          {/* Left: copy */}
          <div className="flex flex-col gap-6 md:max-w-md">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sunken-subtle bg-[#F1F3F7]"
            >
              <Mail size={24} className="text-[#149A9B]" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#19213D] tracking-tight mb-4">Get in Touch</h2>
              <p
                className="font-medium leading-relaxed text-base text-[#6D758F]"
              >
                Questions about this policy or how we handle your data? Our privacy
                team is here to help. We aim to respond to all inquiries within 2
                business days.
              </p>
            </div>
          </div>

          {/* Right: contacts */}
          <div className="flex flex-col gap-5 w-full md:w-auto md:shrink-0 md:min-w-[280px]">
            {[
              { label: "Privacy inquiries", email: "privacy@offerhub.io" },
              { label: "General support", email: "support@offerhub.io" },
            ].map(({ label, email }) => (
              <a
                key={email}
                href={`mailto:${email}`}
                className="flex flex-col gap-1 rounded-2xl px-6 py-5 transition-all duration-300 shadow-sunken-subtle bg-[#F1F3F7] hover:shadow-sunken group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6D758F]">
                  {label}
                </span>
                <span className="text-base font-bold text-[#149A9B] group-hover:text-[#19213D] transition-colors">
                  {email}
                </span>
              </a>
            ))}

            <div
              className="rounded-2xl px-6 py-5 shadow-raised-sm bg-[#F1F3F7]"
            >
              <p className="text-xs leading-relaxed font-medium text-[#6D758F]">
                Offer Hub Inc.
                <br />
                123 Market Street, Suite 400
                <br />
                San Francisco, CA 94105, USA
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
