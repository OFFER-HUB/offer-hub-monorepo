import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { BlueprintMotionSection } from "./BlueprintMotionSection";

type ArchitectureSectionProps = {
  id: string;
  sectionClassName: string;
  eyebrowClassName: string;
  eyebrow: string;
  heading: string;
  description: ReactNode;
  infoText: ReactNode;
  /** When set, heading block + callout + children share one raised panel. */
  panelClassName?: string;
  /** Spacing below the heading block varies per section. */
  headerClassName?: string;
  /** Some sections carry the trailing gap on the description instead. */
  descriptionClassName?: string;
  infoClassName?: string;
  children: ReactNode;
};

export default function ArchitectureSection({
  id,
  sectionClassName,
  eyebrowClassName,
  eyebrow,
  heading,
  description,
  infoText,
  panelClassName,
  headerClassName = "flex flex-col items-center text-center mb-6",
  descriptionClassName = "text-content-secondary max-w-2xl text-lg mb-8",
  infoClassName = "rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-12 flex gap-3 items-start max-w-4xl mx-auto",
  children,
}: ArchitectureSectionProps) {
  const body = (
    <>
      <div className={headerClassName}>
        <span className={eyebrowClassName}>{eyebrow}</span>
        <h2 className="text-3xl md:text-4xl font-bold text-content-primary mb-4 tracking-tight">
          {heading}
        </h2>
        <p className={descriptionClassName}>{description}</p>
      </div>

      <div className={infoClassName}>
        <Info size={15} className="text-theme-primary shrink-0 mt-0.5" />
        <p className="text-sm text-content-secondary leading-relaxed">{infoText}</p>
      </div>

      {children}
    </>
  );

  return (
    <BlueprintMotionSection id={id} className={sectionClassName}>
      <div className="max-w-6xl mx-auto">
        {panelClassName ? <div className={panelClassName}>{body}</div> : body}
      </div>
    </BlueprintMotionSection>
  );
}
