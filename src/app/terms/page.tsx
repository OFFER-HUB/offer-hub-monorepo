"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText, Shield, Scale, HelpCircle } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F1F3F7]">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-20 animate-fadeInUp">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#149A9B] mb-4">Legal Framework</p>
            <h1 className="text-4xl md:text-6xl font-black text-[#19213D] tracking-tighter leading-none mb-6">
              Platform <span className="text-[#149A9B]">Terms</span>
            </h1>
            <p className="text-lg text-[#6D758F] font-medium max-w-2xl mx-auto leading-relaxed">
              These terms outline the agreement between you and OFFER-HUB.
              By using our tools, you agree to these principles of operation.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F1F3F7] shadow-raised-sm text-xs font-bold text-[#6D758F]">
              Last updated: <span className="text-[#149A9B]">February 25, 2026</span>
            </div>
          </header>

          <div className="space-y-12">
            {[
              {
                icon: FileText,
                id: "scope",
                title: "1. Scope of Service",
                content: "OFFER-HUB is a marketplace that connects independent professionals, teams, and businesses to discover, manage, and complete work using blockchain-backed agreements and payments. We provide tools for discovery, messaging, contract management, and transaction tracking, but we do not directly participate in or control the engagements between users.",
                bullets: [
                  "We do not employ, manage, or supervise freelancers or clients using the platform.",
                  "We do not guarantee the quality, timing, legality, or outcome of any project or payment.",
                  "Any estimates or analytics provided in the product are informational and not professional advice."
                ]
              },
              {
                icon: Shield,
                id: "responsibilities",
                title: "2. User Responsibilities",
                content: "To keep OFFER-HUB safe and reliable for everyone, you agree to use the platform responsibly and in compliance with all applicable laws and regulations.",
                bullets: [
                  "Provide accurate, up-to-date information in your account and profiles.",
                  "Maintain the confidentiality of your login credentials and notify us of unauthorized access.",
                  "Use OFFER-HUB only for lawful purposes, avoiding fraud, harassment, or money laundering.",
                  "Respect the rights of other users, including privacy and intellectual property.",
                  "Take full responsibility for agreements you form through the platform."
                ]
              },
              {
                icon: Scale,
                id: "ip",
                title: "3. Intellectual Property",
                content: "The OFFER-HUB platform, including its design, software, branding, and underlying technology, is owned by us or our licensors and is protected by copyright, trademark, and other intellectual property laws.",
                bullets: [
                  "You retain ownership of any content or deliverables you upload or create.",
                  "You grant us a limited, worldwide license to host/process content solely for service operation.",
                  "You may not copy, reverse engineer, or create derivative works of the platform.",
                  "All OFFER-HUB marks are our trademarks and require consent for use."
                ]
              },
              {
                icon: HelpCircle,
                id: "contact",
                title: "4. Contact & Questions",
                content: "If you have any questions about these Terms of Service, or if you need to report a concern related to the platform, you can reach us at:",
                emails: [
                  { label: "General support", address: "support@offerhub.io" },
                  { label: "Legal or compliance", address: "legal@offerhub.io" }
                ]
              }
            ].map((section) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.id}
                  className="p-8 md:p-12 rounded-[2.5rem] bg-[#F1F3F7] shadow-raised"
                >
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F1F3F7] shadow-sunken-subtle text-[#149A9B]">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-[#19213D] tracking-tight">{section.title}</h2>
                  </div>

                  <p className="text-base font-medium leading-relaxed text-[#6D758F] mb-6">
                    {section.content}
                  </p>

                  {section.bullets && (
                    <ul className="space-y-4">
                      {section.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-4 text-sm font-medium text-[#19213D]">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#149A9B] shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.emails && (section.emails.map((email, i) => (
                    <a
                      key={i}
                      href={`mailto:${email.address}`}
                      className="inline-flex flex-col gap-0.5 mt-4 mr-4 p-5 rounded-2xl bg-[#F1F3F7] shadow-sunken-subtle hover:shadow-sunken transition-all group"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#6D758F]">{email.label}</span>
                      <span className="text-sm font-bold text-[#149A9B] group-hover:text-[#19213D] transition-colors">{email.address}</span>
                    </a>
                  )))}
                </section>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
