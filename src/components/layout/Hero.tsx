"use client";

import { ArrowRight, Shield, Zap, Lock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Non-Custodial Escrow",
    description: "Funds secured by smart contracts",
  },
  {
    icon: Zap,
    title: "Instant Settlements",
    description: "Fast transactions on Stellar",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-grade encryption",
  },
];

export function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Self-hosted Payments Orchestrator
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
            Secure Escrow Payments for
            <span className="text-gradient"> Modern Marketplaces</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            OFFER-HUB empowers marketplaces with secure, non-custodial escrow payments. 
            No complex infrastructure needed. Get started in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="/register"
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl text-base font-medium transition-all duration-400 ease-out shadow-raised hover:shadow-raised-hover hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Start Building Free
              <ArrowRight size={18} />
            </a>
            <a
              href="#docs"
              className="w-full sm:w-auto bg-background text-text-primary px-8 py-4 rounded-xl text-base font-medium transition-all duration-400 ease-out shadow-raised hover:shadow-raised-hover hover:-translate-y-0.5 border border-gray-200"
            >
              View Documentation
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-background rounded-2xl p-6 shadow-raised hover:shadow-raised-hover transition-all duration-400 ease-out hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "99.9%", label: "Uptime SLA" },
            { value: "< 2s", label: "Avg. Transaction" },
            { value: "100+", label: "Marketplaces" },
            { value: "$10M+", label: "Processed Monthly" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold text-text-primary mb-1">
                {stat.value}
              </div>
              <div className="text-text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
