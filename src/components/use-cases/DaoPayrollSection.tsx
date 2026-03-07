import { CheckCircle2 } from "lucide-react";

const servicePlatformSteps = [
  {
    number: "01",
    title: "Milestone-based releases",
    description:
      "Funds release automatically when milestones are met — no manual approvals, no delays.",
  },
  {
    number: "02",
    title: "Multi-currency",
    description:
      "Accept and settle payments in multiple currencies, conversion handled seamlessly.",
  },
  {
    number: "03",
    title: "On-chain transparency",
    description:
      "Every transaction is recorded on-chain, giving all parties full auditability.",
  },
];

const servicePlatformBenefits = [
  "Release funds automatically when predefined conditions are met — no manual approvals, no delays. Whether it's delivery confirmation, project completion, or a custom trigger, your payment flow runs exactly as agreed.",
  "Accept and settle payments in multiple currencies without friction. Your buyers pay in what they have, your merchants receive what they need — conversion handled seamlessly under the hood.",
  "Every transaction, condition, and settlement is recorded on-chain and visible to all parties. No black boxes, no disputes over what happened — full auditability from lock to release.",
];

export default function DaoPayrollSection() {
  return (
    <section id="dao-payroll" className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-14 animate-fadeInUp">
          <p className="text-xs font-medium uppercase tracking-[0.4em] mb-4 text-primary">
            Dao Payroll
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-text-primary">
            Streamline DAO payroll with smart escrow contracts
          </h2>
          <p className="mt-5 text-base md:text-lg font-light leading-relaxed text-text-secondary">
            Pay your DAO contributors with confidence and transparency. Our smart escrow contracts ensure that funds are securely held and automatically released based on predefined conditions, such as milestone completion or time-based schedules. Say goodbye to manual payroll processes and hello to a seamless, trustless payment experience for your DAO.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 lg:gap-10">
          <div className="xl:col-span-3 rounded-2xl p-6 md:p-8 shadow-raised bg-background">
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-text-primary">
              How it works
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {servicePlatformSteps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-xl p-5 shadow-raised-sm bg-background"
                >
                  <p className="text-sm font-black tracking-wide mb-3 text-primary">{step.number}</p>
                  <h4 className="text-lg font-bold leading-snug mb-2 text-text-primary">
                    {step.title}
                  </h4>
                  <p className="text-sm font-light leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <aside className="xl:col-span-2 rounded-2xl p-6 md:p-8 shadow-raised bg-background">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-text-primary">
              Key benefits
            </h3>

            <ul className="space-y-4">
              {servicePlatformBenefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                  <span className="text-sm md:text-base font-light leading-relaxed text-text-secondary">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
