import { Eyebrow } from "@/components/shared/Eyebrow";
type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
}: SectionHeadingProps) => {
  return (
    <div className="mb-12 min-w-0 max-w-full overflow-hidden">
      <Eyebrow className="mb-4 break-words">
        {eyebrow}
      </Eyebrow>
      <h2 className="text-3xl font-bold tracking-tight text-content-primary md:text-5xl max-w-full">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-base font-light text-content-secondary md:text-lg">
        {subtitle}
      </p>
    </div>
  );
};


