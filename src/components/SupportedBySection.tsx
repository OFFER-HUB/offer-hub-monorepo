import Image from "next/image";
import Link from "next/link";

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

export default function SupportedBySection() {
  return (
    <section className="relative py-8 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-4 animate-fadeIn">
          {/* Small Label */}
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-content-muted">
            Supported by
          </p>

          {/* Partner Logos - Inline */}
          <div className="relative z-10 flex items-center gap-6">
            {partners.map((partner) => (
              <Link
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity duration-200"
              >
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={partner.width}
                  height={partner.height}
                  className="object-contain dark:invert dark:brightness-0"
                  priority
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
