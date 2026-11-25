export function IntegrationsMap() {
  const swkWallets = ["Freighter", "Lobstr", "xBull"];
  const corridors = ["MX/SPEI", "BR/Pix", "CO/PSE", "AR/Transfer 3.0", "PE", "CL", "CR"];

  return (
    <div className="rounded-3xl bg-bg-elevated shadow-neu-raised p-6 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="inline-block rounded-full bg-bg-base shadow-neu-sunken px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-theme-primary w-fit">
          Ecosystem Integrations
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-content-primary">
          Hub and Spoke Architecture
        </h2>
        <p className="text-xs md:text-sm text-content-secondary leading-relaxed">
          OFFER-HUB acts as the orchestrator, integrating best-in-class solutions for wallet management, escrow, and global fiat off-ramps.
        </p>
      </div>

      {/* Stacked hub & spokes layout (fits both desktop side column and mobile 390px) */}
      <div className="flex flex-col gap-4">
        {/* Center Hub: OFFER-HUB */}
        <div className="rounded-2xl bg-bg-base shadow-neu-raised-sm p-5 flex flex-col items-center text-center border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]">
          <div className="w-3.5 h-3.5 rounded-full bg-theme-primary animate-pulse mb-2 shadow-neu-raised-sm" />
          <h3 className="text-base font-bold text-content-primary">OFFER-HUB</h3>
          <p className="text-xs text-theme-primary font-medium mt-0.5 mb-2">NestJS Orchestrator</p>
          <div className="rounded-xl bg-bg-sunken shadow-neu-sunken-subtle p-2.5 w-full">
            <p className="text-xs text-content-secondary">
              Routes USDC based on freelancer country and payout preferences
            </p>
          </div>
        </div>

        {/* Spoke 1: SWK */}
        <div className="rounded-2xl bg-bg-base shadow-neu-raised-sm p-5 border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-content-primary">Stellar Wallets Kit</h3>
            <span className="text-xs font-bold uppercase tracking-wider bg-bg-sunken shadow-neu-sunken px-2 py-0.5 rounded-full text-theme-primary">
              SCF Integration #1
            </span>
          </div>
          <p className="text-xs text-content-secondary">
            Non-custodial client-side signing for Soroban smart contracts
          </p>

          <div className="flex flex-wrap gap-1.5">
            {swkWallets.map((w) => (
              <span
                key={w}
                className="text-xs bg-bg-elevated shadow-neu-raised-sm px-2.5 py-0.5 rounded-full text-content-primary font-medium"
              >
                {w}
              </span>
            ))}
          </div>

          <div className="rounded-xl bg-bg-sunken shadow-neu-sunken-subtle p-3">
            <ul className="text-xs font-mono text-content-secondary space-y-1">
              <li>• create_escrow</li>
              <li>• release_escrow</li>
              <li>• refund_escrow</li>
              <li>• resolve_dispute</li>
            </ul>
          </div>
        </div>

        {/* Spoke 2: BlindPay */}
        <div className="rounded-2xl bg-bg-base shadow-neu-raised-sm p-5 border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-content-primary">BlindPay</h3>
            <span className="text-xs font-bold uppercase tracking-wider bg-bg-sunken shadow-neu-sunken px-2 py-0.5 rounded-full text-theme-primary">
              SCF Integration #2
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-bg-sunken shadow-neu-sunken-subtle px-2 py-0.5 rounded-full text-content-muted">
              FinCEN MSB
            </span>
            <span className="text-xs bg-bg-sunken shadow-neu-sunken-subtle px-2 py-0.5 rounded-full text-content-muted">
              YC-backed
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-1">
            {corridors.map((c) => (
              <div
                key={c}
                className="text-xs font-medium text-center bg-bg-elevated shadow-neu-raised-sm rounded-xl py-1.5 text-content-primary px-1"
              >
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="rounded-2xl bg-bg-base shadow-neu-raised-sm border border-[color-mix(in_srgb,var(--color-border)_40%,transparent)] px-4 py-3 flex items-center justify-center gap-3 text-xs font-medium text-content-secondary">
        <span>2 SCF Integrations</span>
        <span className="text-content-muted">•</span>
        <span className="text-theme-primary font-bold">7 BlindPay Corridors</span>
      </div>
    </div>
  );
}
