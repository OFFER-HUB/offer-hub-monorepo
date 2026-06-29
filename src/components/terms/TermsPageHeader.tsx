export function TermsPageHeader() {
  return (
    <header className="text-center mb-20 animate-fadeInUp">
      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-theme-primary mb-4">Legal Framework</p>
      <h1 className="text-4xl md:text-6xl font-black text-content-primary tracking-tighter leading-none mb-6">
        Platform <span className="text-theme-primary">Terms</span>
      </h1>
      <p className="text-lg text-content-secondary font-medium max-w-2xl mx-auto leading-relaxed">
        These terms outline the agreement between you and OFFER-HUB.
        By using our tools, you agree to these principles of operation.
      </p>
      <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-elevated shadow-raised-sm text-xs font-bold text-content-secondary">
        Last updated: <span className="text-theme-primary">April 29, 2026</span>
      </div>
    </header>
  );
}
