"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";
import { Mail, AlertCircle, CheckCircle, ExternalLink, Headphones, Eye, Hand, Brain, MessageSquare } from "lucide-react";

const features = [
     {
          icon: CheckCircle,
          title: "WCAG 2.1 Level AA Target",
          description:
               "We are committed to achieving Web Content Accessibility Guidelines 2.1 Level AA compliance — the industry standard for web accessibility. This standard ensures our platform is usable by individuals with vision, hearing, motor, and cognitive impairments.",
          iconColor: "#149A9B",
     },
     {
          icon: AlertCircle,
          title: "Known Limitations",
          description:
               "Some PDF documents, third-party integrations, and real-time data visualizations have limited accessibility support. We're actively working on remediation with scheduled improvements through Q3 2026.",
          iconColor: "#149A9B",
     },
     {
          icon: Mail,
          title: "Report Accessibility Issues",
          description:
               "Encountered an accessibility barrier? Email support@offerhub.io with details about the issue. We respond within 2 business days and work to resolve problems as quickly as possible.",
          iconColor: "#149A9B",
     },
];

const accessibilityFeatures = [
     {
          icon: Eye,
          title: "Vision Support",
          items: ["Screen reader compatibility (NVDA, JAWS, VoiceOver)", "High contrast mode support", "Alternative text for images", "Text sizing and zoom support"],
     },
     {
          icon: Hand,
          title: "Motor Control",
          items: ["Full keyboard navigation", "Focus indicators for keyboard users", "No time-limited interactions", "Large click targets"],
     },
     {
          icon: Headphones,
          title: "Hearing Support",
          items: ["Captions for video content", "Visual alerts for audio notifications", "No sound-only instructions", "Text transcripts available"],
     },
     {
          icon: Brain,
          title: "Cognitive Accessibility",
          items: ["Clear, simple language", "Consistent navigation patterns", "Logical heading structure", "Multiple ways to find information"],
     },
];

const contactMethods = [
     {
          method: "Email",
          description: "Primary method for detailed accessibility reports",
          value: "support@offerhub.io",
          href: "mailto:support@offerhub.io?subject=Accessibility%20Issue%20Report",
     },
     {
          method: "Telegram",
          description: "For users who cannot use email",
          value: "@offer_hub_contributors",
          href: "https://t.me/offer_hub_contributors",
          external: true,
     },
     {
          method: "Discord",
          description: "Community support in #support channel",
          value: "OFFER-HUB Community Server",
          href: "https://discord.gg/yH4vBNWwc",
          external: true,
     },
     {
          method: "GitHub Issues",
          description: "For technical accessibility problems",
          value: "Label with 'accessibility' tag",
          href: "https://github.com/OFFER-HUB/offer-hub-monorepo/issues",
          external: true,
     },
];

export default function AccessibilityPage() {
     return (
          <div className="min-h-screen flex flex-col">
               <LoadingBar />
               <Navbar />

               <main className="flex-grow pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-24">

                    {/* Heading */}
                    <div className="text-center mb-20 md:mb-28 animate-fadeInUp">
                         <p
                              className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 text-theme-primary">
                              Universal Design
                         </p>
                         <h1
                              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-content-primary leading-none mb-6"
                         >
                              Accessibility <span className="text-theme-primary">Statement</span>
                         </h1>
                         <p
                              className="mt-4 text-lg sm:text-xl font-medium max-w-2xl mx-auto px-2 text-content-secondary leading-relaxed"
                         >
                              OFFER-HUB is committed to ensuring digital accessibility for all users, including those with disabilities. We continuously work to meet WCAG 2.1 Level AA standards.
                         </p>
                         <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-elevated shadow-neu-raised-sm text-xs font-bold text-content-secondary">
                              Last updated: <span className="text-theme-primary">May 27, 2026</span>
                         </div>
                    </div>

                    {/* Key Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-20">
                         {features.map((feature) => {
                              const Icon = feature.icon;
                              return (
                                   <div
                                        key={feature.title}
                                        className="p-10 rounded-[2.5rem] bg-bg-elevated shadow-neu-raised flex flex-col gap-6 group hover:shadow-neu-raised-hover transition-all duration-500"
                                   >
                                        <div
                                             className="w-14 h-14 rounded-2xl shadow-neu-sunken-subtle flex items-center justify-center shrink-0 bg-bg-elevated group-hover:shadow-neu-sunken transition-all duration-300"
                                        >
                                             <Icon size={24} className="text-theme-primary" />
                                        </div>
                                        <div>
                                             <h3
                                                  className="text-xl font-black tracking-tight mb-4 text-content-primary"
                                             >
                                                  {feature.title}
                                             </h3>
                                             <p
                                                  className="text-sm font-medium leading-relaxed text-content-secondary"
                                             >
                                                  {feature.description}
                                             </p>
                                        </div>
                                   </div>
                              );
                         })}
                    </div>

                    {/* Accessibility Features */}
                    <div className="mt-24 mb-24 animate-fadeInUp">
                         <div className="flex flex-col gap-6 mb-12">
                              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-content-primary">
                                   Accessibility <span className="text-theme-primary">Features</span>
                              </h2>
                              <p className="text-lg font-medium text-content-secondary max-w-3xl leading-relaxed">
                                   We provide multiple accessibility features to ensure all users can interact with OFFER-HUB effectively.
                              </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {accessibilityFeatures.map((feature) => {
                                   const Icon = feature.icon;
                                   return (
                                        <div
                                             key={feature.title}
                                             className="p-8 rounded-[2rem] bg-bg-elevated shadow-neu-raised flex flex-col gap-4 border border-theme-primary/5 hover:shadow-neu-raised-hover transition-all duration-300"
                                        >
                                             <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-theme-primary/10">
                                                       <Icon size={20} className="text-theme-primary" />
                                                  </div>
                                                  <h3 className="text-lg font-black text-content-primary">{feature.title}</h3>
                                             </div>
                                             <ul className="space-y-2">
                                                  {feature.items.map((item) => (
                                                       <li key={item} className="text-sm font-medium text-content-secondary flex items-start gap-3">
                                                            <span className="text-theme-primary font-bold mt-1">✓</span>
                                                            {item}
                                                       </li>
                                                  ))}
                                             </ul>
                                        </div>
                                   );
                              })}
                         </div>
                    </div>

                    {/* Report Accessibility Issues */}
                    <div className="mt-24 mb-24 animate-fadeInUp">
                         <div className="flex flex-col gap-6 mb-12">
                              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-content-primary">
                                   Report an <span className="text-theme-primary">Issue</span>
                              </h2>
                              <p className="text-lg font-medium text-content-secondary max-w-3xl leading-relaxed">
                                   Have you encountered an accessibility barrier? We want to know! Please report it using any of the following methods. We respond within 2 business days and prioritize accessibility improvements.
                              </p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                              {contactMethods.map((contact) => (
                                   <a
                                        key={contact.method}
                                        href={contact.href}
                                        target={contact.external ? "_blank" : undefined}
                                        rel={contact.external ? "noopener noreferrer" : undefined}
                                        className="p-8 rounded-[2rem] bg-bg-elevated shadow-neu-raised hover:shadow-neu-raised-hover border border-theme-primary/5 transition-all duration-300 group"
                                   >
                                        <div className="flex items-start justify-between mb-4">
                                             <div>
                                                  <h3 className="text-lg font-black text-content-primary mb-1">{contact.method}</h3>
                                                  <p className="text-sm text-content-secondary font-medium">{contact.description}</p>
                                             </div>
                                             {contact.external && <ExternalLink size={16} className="text-theme-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </div>
                                        <p className="text-theme-primary font-bold text-sm">{contact.value}</p>
                                   </a>
                              ))}
                         </div>

                         <div className="p-8 rounded-[2rem] bg-theme-primary/5 border border-theme-primary/20 flex flex-col gap-4">
                              <div className="flex items-start gap-3">
                                   <MessageSquare size={20} className="text-theme-primary mt-1 flex-shrink-0" />
                                   <div>
                                        <h4 className="font-black text-content-primary mb-2">What to Include in Your Report</h4>
                                        <ul className="text-sm text-content-secondary space-y-2">
                                             <li>• Description of the accessibility barrier</li>
                                             <li>• The page or feature where you encountered the issue</li>
                                             <li>• Your browser and assistive technology (if applicable)</li>
                                             <li>• Steps to reproduce the issue</li>
                                             <li>• The specific WCAG criterion that appears to be violated (if known)</li>
                                        </ul>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Conformance Status */}
                    <div className="mt-24 mb-24 animate-fadeInUp">
                         <div className="flex flex-col gap-6 mb-12">
                              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-content-primary">
                                   Conformance <span className="text-theme-primary">Status</span>
                              </h2>
                         </div>

                         <div className="space-y-6">
                              <div className="p-10 rounded-[2.5rem] bg-bg-elevated shadow-neu-raised">
                                   <h3 className="text-xl font-black text-content-primary mb-4">Target Level: WCAG 2.1 Level AA</h3>
                                   <p className="text-base font-medium text-content-secondary mb-6 leading-relaxed">
                                        We are committed to achieving and maintaining compliance with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standard. This is the industry-recommended conformance level and covers accessibility for individuals with vision, hearing, motor, and cognitive impairments.
                                   </p>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-theme-primary/5 border border-theme-primary/20">
                                             <p className="text-xs font-bold text-theme-primary uppercase tracking-wider mb-1">Last Full Audit</p>
                                             <p className="text-lg font-black text-content-primary">April 2026</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-theme-primary/5 border border-theme-primary/20">
                                             <p className="text-xs font-bold text-theme-primary uppercase tracking-wider mb-1">Next Review</p>
                                             <p className="text-lg font-black text-content-primary">October 2026</p>
                                        </div>
                                   </div>
                              </div>

                              <div className="p-10 rounded-[2.5rem] bg-bg-elevated shadow-neu-raised">
                                   <h3 className="text-xl font-black text-content-primary mb-4">Known Limitations</h3>
                                   <div className="space-y-4">
                                        <div>
                                             <p className="font-bold text-content-primary mb-2">PDF Documents</p>
                                             <p className="text-sm text-content-secondary mb-2">Some older PDF documents may lack proper accessibility tags. Remediation: Q3 2026</p>
                                        </div>
                                        <div>
                                             <p className="font-bold text-content-primary mb-2">Third-Party Integrations</p>
                                             <p className="text-sm text-content-secondary mb-2">Payment processors and analytics tools may have limited accessibility support. We work with vendors to improve this.</p>
                                        </div>
                                        <div>
                                             <p className="font-bold text-content-primary mb-2">Real-Time Data Visualizations</p>
                                             <p className="text-sm text-content-secondary mb-2">Interactive charts on dashboards may need enhanced keyboard navigation. Remediation: Q2 2026</p>
                                        </div>
                                        <div>
                                             <p className="font-bold text-content-primary mb-2">Video Content</p>
                                             <p className="text-sm text-content-secondary mb-2">Archived videos may lack captions. All new videos include captions; existing ones updated progressively through Q3 2026.</p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Legal Compliance */}
                    <div className="mt-24 mb-24 animate-fadeInUp">
                         <div className="flex flex-col gap-6 mb-12">
                              <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-content-primary">
                                   Legal <span className="text-theme-primary">Compliance</span>
                              </h2>
                              <p className="text-lg font-medium text-content-secondary max-w-3xl leading-relaxed">
                                   OFFER-HUB complies with or works toward compliance with the following accessibility standards and regulations.
                              </p>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {[
                                   {
                                        standard: "WCAG 2.1 Level AA",
                                        description: "International web accessibility standard recommended by W3C",
                                   },
                                   {
                                        standard: "EU Web Accessibility Directive",
                                        description: "Applies to public sector bodies and certain private entities in the EU",
                                   },
                                   {
                                        standard: "Section 508 (Rehabilitation Act)",
                                        description: "Applies to US federal agencies and contractors",
                                   },
                                   {
                                        standard: "ADA (Americans with Disabilities Act)",
                                        description: "Applies to covered entities in the United States",
                                   },
                                   {
                                        standard: "AODA (Ontario Accessibility Law)",
                                        description: "Applies to organizations in Ontario, Canada",
                                   },
                                   {
                                        standard: "Industry Best Practices",
                                        description: "We follow accessibility guidance from organizations like IAAP and 18F",
                                   },
                              ].map((item) => (
                                   <div key={item.standard} className="p-6 rounded-[1.5rem] bg-bg-elevated shadow-neu-raised border border-theme-primary/5 hover:shadow-neu-raised-hover transition-all duration-300">
                                        <h4 className="font-black text-content-primary mb-2">{item.standard}</h4>
                                        <p className="text-sm text-content-secondary">{item.description}</p>
                                   </div>
                              ))}
                         </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-24 mb-8 p-10 sm:p-14 rounded-[2.5rem] bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 border border-theme-primary/20 text-center">
                         <h2 className="text-2xl sm:text-4xl font-black text-content-primary mb-4">Questions About Accessibility?</h2>
                         <p className="text-lg text-content-secondary font-medium mb-8 max-w-2xl mx-auto">
                              Our team is here to help. Contact us with any accessibility concerns or suggestions for improvement.
                         </p>
                         <a
                              href="mailto:support@offerhub.io?subject=Accessibility%20Question"
                              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-theme-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-theme-primary-hover transition-colors shadow-lg"
                         >
                              <Mail size={18} />
                              Email Support
                         </a>
                    </div>
               </main>

               <Footer />
          </div>
     );
}
