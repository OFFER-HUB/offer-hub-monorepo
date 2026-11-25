import { ZoomableDiagram } from "@/components/shared/ZoomableDiagram";
import {
  Table,
  TABLE_CELL_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/docs/ParamTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SCF_GANTT_CHART } from "./scf-tranche-roadmap.charts";

export function SCFTrancheRoadmap() {
  const milestones = [
    {
      code: "T0 — Upfront",
      date: "On award",
      cost: "—",
      payout: "$8,000",
      pct: "10%",
      status: "completed" as const,
    },
    {
      code: "T1 — MVP: SWK Connection & Auth",
      date: "Sept 1, 2026",
      cost: "$16,000",
      payout: "$16,000",
      pct: "22%",
      status: "in-progress" as const,
    },
    {
      code: "T2 — Testnet: Core Integrations",
      date: "Oct 20, 2026",
      cost: "$19,500",
      payout: "$19,500",
      pct: "26%",
      status: "planned" as const,
    },
    {
      code: "T3 — Mainnet Launch & OS Adapters",
      date: "Dec 5, 2026",
      cost: "$30,500",
      payout: "$30,500",
      pct: "41%",
      status: "planned" as const,
    },
  ];

  return (
    <div className="rounded-3xl bg-bg-elevated shadow-neu-raised p-6 md:p-10 mb-8 max-w-full overflow-hidden">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="inline-block rounded-full bg-bg-base shadow-neu-sunken px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-theme-primary mb-4">
          Delivery Schedule
        </span>
        <h2 className="text-2xl md:text-h2 font-bold text-content-primary tracking-tight mb-3">
          SCF Build #44 Roadmap
        </h2>
        <p className="text-content-secondary max-w-2xl text-sm md:text-base leading-relaxed">
          Detailed timeline for the execution of our $74,000 SCF Build Award milestones.
        </p>
      </div>

      <div className="rounded-3xl bg-bg-base shadow-neu-raised p-4 sm:p-6 mb-8 max-w-full overflow-hidden">
        <div className="w-full max-w-full overflow-x-auto">
          <ZoomableDiagram
            chart={SCF_GANTT_CHART}
            title="SCF Build #44 Roadmap"
            className="w-full min-w-0 sm:min-w-[500px]"
          />
        </div>
      </div>

      <Table
        label="SCF Build #44 tranche milestones"
        caption="SCF Build #44 tranche milestones"
        className="mx-auto max-w-4xl"
      >
        <thead>
          <tr>
            {["Milestone", "Status", "Date", "Technical Cost", "SCF Payout", "%"].map(
              (heading) => (
                <th key={heading} scope="col" className={TABLE_HEAD_CLASS}>
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {milestones.map((m) => (
            <tr key={m.code} className={TABLE_ROW_CLASS}>
              <td className={`${TABLE_CELL_CLASS} font-medium text-content-primary`}>{m.code}</td>
              <td className={TABLE_CELL_CLASS}>
                {m.status === "completed" && (
                  <StatusBadge variant="success">Completed</StatusBadge>
                )}
                {m.status === "in-progress" && (
                  <StatusBadge variant="primary">In progress</StatusBadge>
                )}
                {m.status === "planned" && (
                  <StatusBadge variant="muted">Planned</StatusBadge>
                )}
              </td>
              <td className={TABLE_CELL_CLASS}>{m.date}</td>
              <td className={TABLE_CELL_CLASS}>{m.cost}</td>
              <td className={TABLE_CELL_CLASS}>{m.payout}</td>
              <td className={TABLE_CELL_CLASS}>{m.pct}</td>
            </tr>
          ))}
          <tr className={TABLE_ROW_CLASS}>
            <td className={`${TABLE_CELL_CLASS} font-bold text-theme-primary`}>Total</td>
            <td className={TABLE_CELL_CLASS}></td>
            <td className={TABLE_CELL_CLASS}></td>
            <td className={`${TABLE_CELL_CLASS} font-bold text-theme-primary`}>$74,000</td>
            <td className={`${TABLE_CELL_CLASS} font-bold text-theme-primary`}>$74,000</td>
            <td className={`${TABLE_CELL_CLASS} font-bold text-theme-primary`}>100%</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
