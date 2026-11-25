import Image from "next/image";
import Link from "next/link";
import { Award } from "lucide-react";
import { BENTO_CARD_CLASS, BENTO_EYEBROW_CLASS, BENTO_H2_CLASS } from "@/components/HeroSection";
import { cn } from "@/lib/cn";

const partners = [
  {
    name: "Stellar",
    logo: "/stellar.png",
    url: "https://stellar.org",
    width: 50,
    height: 12,
  },
  {
    name: "Trustless Work",
    logo: "/trustless-works.webp",
    url: "https://www.trustlesswork.com/",
    width: 130,
    height: 28,
  },
  {
    name: "Drips",
    logo: "/drips.svg",
    url: "https://www.drips.network/",
    width: 130,
    height: 28,
  },
];

/**
 * Bento row 4 (right): "Real signals". Only verifiable items: the SCF Build
 * award (documented on /architecture) and the projects supporting OFFER-HUB.
 * Live GitHub numbers stay in StatsSection.
 */
export function SupportedBySection() {
  return (
    <section
      aria-labelledby="real-signals-title"
      className={cn(BENTO_CARD_CLASS, "flex flex-col gap-6 p-6 sm:p-8 lg:col-span-3")}
    >
      <div>
        <p className={BENTO_EYEBROW_CLASS}>Real signals</p>
        <h2 id="real-signals-title" className={cn(BENTO_H2_CLASS, "mt-2")}>
          Backed by the Stellar ecosystem
        </h2>
      </div>

      <Link
        href="/architecture"
        className="flex min-h-11 items-center gap-3 rounded-2xl bg-bg-sunken p-4 shadow-neu-sunken-subtle transition-colors duration-200 hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated"
      >
        <Award size={20} aria-hidden="true" className="shrink-0 text-action" />
        <span className="text-sm font-semibold text-content-primary">
          SCF Build Award #44, Integration Track
        </span>
      </Link>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-content-secondary">
          Supported by
        </p>
        <ul role="list" className="flex flex-wrap items-center gap-6">
          {partners.map((partner) => (
            <li key={partner.name}>
              <Link
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl opacity-80 transition-opacity duration-200 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
              >
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={partner.width}
                  height={partner.height}
                  className="object-contain dark:invert dark:brightness-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
