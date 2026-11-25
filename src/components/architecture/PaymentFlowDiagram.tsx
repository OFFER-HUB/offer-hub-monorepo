import { ArchitectureSection } from "@/components/shared/ArchitectureSection";
import { ZoomableDiagram } from "@/components/shared/ZoomableDiagram";
import { PAYMENT_SEQUENCE_CHART, PAYMENT_STATE_CHART } from "./payment-flow.charts";

export function PaymentFlowDiagram() {
  return (
    <ArchitectureSection
      id="flow"
      sectionClassName="px-0 sm:px-6 py-8 sm:py-12 bg-transparent"
      headerClassName="flex flex-col items-center text-center mb-8"
      descriptionClassName="text-content-secondary max-w-2xl text-base md:text-lg"
      infoClassName="rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-6 flex gap-3 items-start max-w-full"
      eyebrowClassName="inline-block rounded-full bg-bg-elevated shadow-neu-raised-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-theme-primary mb-6"
      eyebrow="Payment Flow Lifecycle"
      heading="Escrow Lifecycle & Payouts"
      description="A secure, non-custodial workflow powered by Soroban smart contracts and executed via Stellar Wallets Kit."
      infoText={
        <>
          The sequence diagram traces a complete escrow lifecycle: from order creation to fiat settlement. All Soroban transactions (fund_escrow and release_escrow) are signed client-side by the user&apos;s wallet via Stellar Wallets Kit — no private keys ever touch the server. The state diagram on the right shows every valid order state, including the dispute resolution path.
        </>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-bg-elevated shadow-neu-raised p-6 md:p-8 flex flex-col h-full max-w-full overflow-hidden">
          <h3 className="text-lg md:text-xl font-bold text-content-primary mb-6 ml-2">Transaction Flow</h3>
          <div className="w-full max-w-full overflow-x-auto">
            <ZoomableDiagram
              chart={PAYMENT_SEQUENCE_CHART}
              title="Transaction Flow"
              className="w-full min-w-0"
            />
          </div>
        </div>

        <div className="rounded-3xl bg-bg-elevated shadow-neu-raised p-6 md:p-8 flex flex-col h-full max-w-full overflow-hidden">
          <h3 className="text-lg md:text-xl font-bold text-content-primary mb-6 ml-2">Escrow State Machine</h3>
          <div className="w-full max-w-full overflow-x-auto">
            <ZoomableDiagram
              chart={PAYMENT_STATE_CHART}
              title="Escrow State Machine"
              className="w-full min-w-0"
            />
          </div>
        </div>
      </div>
    </ArchitectureSection>
  );
}
