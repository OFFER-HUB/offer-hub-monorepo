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
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-theme-primary break-words">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-tight text-content-primary md:text-5xl max-w-full">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-base font-light text-content-secondary md:text-lg">
        {subtitle}
      </p>
    </div>
  );
};


