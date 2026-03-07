type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
}: SectionHeadingProps) => {
  return (
    <div className="mb-12">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-theme-primary">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-black tracking-tight text-content-primary md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 max-w-3xl text-base font-light text-content-secondary md:text-lg">
        {subtitle}
      </p>
    </div>
  );
};

export default SectionHeading;
