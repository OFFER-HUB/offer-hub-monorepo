export default function CTASection() {
  return (
    <section className="py-28 bg-transparent">
      <div className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-10">
        <div className="flex flex-col gap-4 animate-fadeInUp">
          <p
            className="text-xs font-medium uppercase tracking-[0.4em]"
            style={{ color: "#149A9B" }}
          >
            Get started today
          </p>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
            style={{ color: "#19213D" }}
          >
            The payments layer your marketplace deserves
          </h2>
          <p className="text-lg font-light leading-relaxed" style={{ color: "#6D758F" }}>
            Self-hosted, non-custodial, open source. Own your infrastructure from day one.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <a
            href="/contact"
            className="px-8 py-3.5 rounded-xl text-sm font-semibold btn-neumorphic-primary"
          >
            Book a demo
          </a>
          <a
            href="/register"
            className="px-8 py-3.5 rounded-xl text-sm font-semibold btn-neumorphic-secondary text-[#149A9B]"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </section>
  );
}
