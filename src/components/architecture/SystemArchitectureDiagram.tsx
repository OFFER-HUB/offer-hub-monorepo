import { ArchitectureSection } from "@/components/shared/ArchitectureSection";
import { ZoomableDiagram } from "@/components/shared/ZoomableDiagram";
import { SYSTEM_ARCHITECTURE_CHART } from "./system-architecture.charts";

export function SystemArchitectureDiagram() {
  return (
    <ArchitectureSection
      id="system"
      sectionClassName="px-6 py-24 bg-transparent"
      panelClassName="rounded-[2.5rem] bg-bg-elevated shadow-neu-raised-l2 p-8 md:p-12"
      headerClassName="flex flex-col items-center text-center mb-10"
      descriptionClassName="text-content-secondary max-w-2xl text-lg"
      infoClassName="rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-6 flex gap-3 items-start"
      eyebrowClassName="inline-block rounded-full bg-bg-base shadow-neu-sunken px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary mb-6"
      eyebrow="Architecture Overview"
      heading="OfferHub System Architecture"
      description="A comprehensive view of the OfferHub platform, showing the flow between our modern frontend, NestJS orchestrator, and external integrations."
      infoText="This flowchart maps every layer of the OfferHub stack — from the browser and Stellar Wallets Kit on the client side, through the NestJS orchestration API and PostgreSQL/Redis data layer, down to Soroban smart contracts on Stellar and the BlindPay off-ramp provider. Arrows show the protocol or method used at each boundary. Teal nodes are the two SCF Integration Track building blocks."
    >
      <ZoomableDiagram chart={SYSTEM_ARCHITECTURE_CHART} title="System Architecture" className="w-full min-w-[600px]" />

      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-theme-primary shadow-neu-raised-sm"></span>
          <span className="text-content-secondary">SCF Integration / Client</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-theme-secondary shadow-neu-raised-sm"></span>
          <span className="text-content-secondary">Internal API</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-bg-base border border-theme-border shadow-neu-raised-sm"></span>
          <span className="text-content-secondary">Persistence / Chain</span>
        </div>
      </div>
    </ArchitectureSection>
  );
}
