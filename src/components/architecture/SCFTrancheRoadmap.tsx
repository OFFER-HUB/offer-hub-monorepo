import ArchitectureSection from "@/components/shared/ArchitectureSection";
import ZoomableDiagram from "@/components/shared/ZoomableDiagram";
import { SCF_GANTT_CHART } from "./scf-tranche-roadmap.charts";

export default function SCFTrancheRoadmap() {
  return (
    <ArchitectureSection
      id="roadmap"
      sectionClassName="px-6 py-24 bg-bg-base"
      eyebrowClassName="inline-block rounded-full bg-bg-elevated shadow-neu-raised-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary mb-6"
      eyebrow="Delivery Schedule"
      heading="SCF Build #44 Roadmap"
      description="Detailed timeline for the execution of our $74,000 SCF Build Award milestones."
      infoText="Three tranches, each tied to verifiable on-chain or functional deliverables. Tranche 1 ships the wallet connection layer. Tranche 2 completes both SCF integrations on testnet. Tranche 3 migrates to Stellar RPC, launches on mainnet, records 10 live transactions as proof, and open-sources the integration adapters."
    >
      <div className="rounded-[2.5rem] bg-bg-elevated shadow-neu-raised-l2 p-6 md:p-10 mb-12">
        <ZoomableDiagram
          chart={SCF_GANTT_CHART}
          title="SCF Build #44 Roadmap"
          className="w-full min-w-[800px]"
        />
      </div>

      <div className="rounded-[2rem] bg-bg-base shadow-neu-sunken overflow-hidden max-w-4xl mx-auto border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-sunken text-content-muted text-xs uppercase tracking-widest">
                <th className="py-4 px-6 font-semibold">Milestone</th>
                <th className="py-4 px-6 font-semibold">Date</th>
                <th className="py-4 px-6 font-semibold">Technical Cost</th>
                <th className="py-4 px-6 font-semibold">SCF Payout</th>
                <th className="py-4 px-6 font-semibold">%</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-[var(--color-border)]">
                <td className="py-4 px-6 font-medium text-content-primary">T0 — Upfront</td>
                <td className="py-4 px-6 text-content-secondary">On award</td>
                <td className="py-4 px-6 text-content-secondary">—</td>
                <td className="py-4 px-6 text-content-secondary">$8,000</td>
                <td className="py-4 px-6 text-content-secondary">10%</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="py-4 px-6 font-medium text-content-primary">T1 — MVP: SWK Connection & Auth</td>
                <td className="py-4 px-6 text-content-secondary">Sept 1, 2026</td>
                <td className="py-4 px-6 text-content-secondary">$16,000</td>
                <td className="py-4 px-6 text-content-secondary">$16,000</td>
                <td className="py-4 px-6 text-content-secondary">22%</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="py-4 px-6 font-medium text-content-primary">T2 — Testnet: Core Integrations</td>
                <td className="py-4 px-6 text-content-secondary">Oct 20, 2026</td>
                <td className="py-4 px-6 text-content-secondary">$19,500</td>
                <td className="py-4 px-6 text-content-secondary">$19,500</td>
                <td className="py-4 px-6 text-content-secondary">26%</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]">
                <td className="py-4 px-6 font-medium text-content-primary">T3 — Mainnet Launch & OS Adapters</td>
                <td className="py-4 px-6 text-content-secondary">Dec 5, 2026</td>
                <td className="py-4 px-6 text-content-secondary">$30,500</td>
                <td className="py-4 px-6 text-content-secondary">$30,500</td>
                <td className="py-4 px-6 text-content-secondary">41%</td>
              </tr>
              <tr className="font-bold">
                <td className="py-4 px-6 text-theme-primary">Total</td>
                <td className="py-4 px-6 text-theme-primary"></td>
                <td className="py-4 px-6 text-theme-primary">$74,000</td>
                <td className="py-4 px-6 text-theme-primary">$74,000</td>
                <td className="py-4 px-6 text-theme-primary">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ArchitectureSection>
  );
}
