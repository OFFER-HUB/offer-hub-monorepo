import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-28 bg-transparent">
      <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-10">
        <div className="flex flex-col gap-4 animate-fadeInUp">
          <p
            className="text-[11px] font-black uppercase tracking-[0.4em] text-theme-primary"
          >
            Get started today
          </p>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-content-primary"
          >
            The payments layer your marketplace deserves
          </h2>
          <p className="text-lg font-medium leading-relaxed text-content-secondary">
            Self-hosted, non-custodial, open source. Own your infrastructure from day one.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <Link
            href="/contact"
            className="px-8 py-3.5 rounded-xl text-sm font-semibold btn-neumorphic-primary"
          >
            Book a demo
          </Link>
          <Link
            href="/#waitlist-form"
            className="px-8 py-3.5 rounded-xl text-sm font-semibold btn-neumorphic-secondary text-theme-primary"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </section>
  );
}
