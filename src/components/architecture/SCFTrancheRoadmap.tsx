import { ArchitectureSection } from "@/components/shared/ArchitectureSection";
import { ZoomableDiagram } from "@/components/shared/ZoomableDiagram";
import {
  Table,
  TABLE_CELL_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/docs/ParamTable";
import { SCF_GANTT_CHART } from "./scf-tranche-roadmap.charts";

export function SCFTrancheRoadmap() {
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

      <Table
        label="SCF Build #44 tranche milestones"
        caption="SCF Build #44 tranche milestones"
        className="mx-auto max-w-4xl"
      >
        <thead>
          <tr>
            {["Milestone", "Date", "Technical Cost", "SCF Payout", "%"].map(
              (heading) => (
                <th key={heading} scope="col" className={TABLE_HEAD_CLASS}>
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {[
            ["T0 — Upfront", "On award", "—", "$8,000", "10%"],
            ["T1 — MVP: SWK Connection & Auth", "Sept 1, 2026", "$16,000", "$16,000", "22%"],
            ["T2 — Testnet: Core Integrations", "Oct 20, 2026", "$19,500", "$19,500", "26%"],
            ["T3 — Mainnet Launch & OS Adapters", "Dec 5, 2026", "$30,500", "$30,500", "41%"],
          ].map(([milestone, date, cost, payout, percent]) => (
            <tr key={milestone} className={TABLE_ROW_CLASS}>
              <td className={`${TABLE_CELL_CLASS} font-medium text-content-primary`}>{milestone}</td>
              <td className={TABLE_CELL_CLASS}>{date}</td>
              <td className={TABLE_CELL_CLASS}>{cost}</td>
              <td className={TABLE_CELL_CLASS}>{payout}</td>
              <td className={TABLE_CELL_CLASS}>{percent}</td>
            </tr>
          ))}
          <tr className={TABLE_ROW_CLASS}>
            {["Total", "", "$74,000", "$74,000", "100%"].map((value, index) => (
              <td key={index} className={`${TABLE_CELL_CLASS} font-bold text-theme-primary`}>
                {value}
              </td>
            ))}
          </tr>
        </tbody>
      </Table>
    </ArchitectureSection>
  );
}
