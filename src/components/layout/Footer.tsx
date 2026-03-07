"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Twitter, Send, Github, Disc3 } from "lucide-react";

const navColumns = [
  {
    heading: "Platform",
    links: [
      { href: "/", label: "Home" },
      { href: "/pricing", label: "Pricing" },
      { href: "/docs", label: "Docs" },
      { href: "/community", label: "Community" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/use-cases", label: "Use Cases" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

const socialLinks = [
  { href: "https://x.com/offerhub_", icon: Twitter, label: "X" },
  { href: "https://t.me/offer_hub_contributors", icon: Send, label: "Telegram" },
  { href: "https://discord.gg/yH4vBNWwc", icon: Disc3, label: "Discord" },
  { href: "https://github.com/OFFER-HUB", icon: Github, label: "GitHub" },
];

export function Footer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;

    const fit = () => {
      text.style.fontSize = "200px";
      text.style.width = "fit-content";
      const textWidth = text.offsetWidth;
      const wrapWidth = wrap.offsetWidth;
      text.style.width = "";
      if (textWidth === 0) return;
      text.style.fontSize = `${200 * (wrapWidth / textWidth) * 0.88}px`;
    };

    document.fonts.ready.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <footer
      className="bg-transparent pt-4 pb-0 relative"
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* ── White card ── */}
        <div
          className="rounded-3xl px-10 py-10"
          style={{
            background: "#ffffff",
            boxShadow:
              "0 4px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            {/* Left — logo + desc + socials */}
            <div className="flex flex-col gap-5 md:w-64 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src="/OFFER-HUB-logo.png"
                  alt="OFFER-HUB"
                  width={120}
                  height={32}
                  className="h-7 w-auto object-contain"
                />
              </Link>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#6D758F" }}
              >
                Empowering freelancers and businesses with secure,
                blockchain-powered solutions — making work easier to find,
                manage, and pay.
              </p>
              <div className="flex items-center gap-4">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200"
                    style={{ color: "#6D758F" }}
                    onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#19213D")
                    }
                    onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color =
                      "#6D758F")
                    }
                  >
                    <s.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Right — nav columns */}
            <div className="flex flex-1 gap-8 md:gap-12 flex-wrap">
              {navColumns.map((col) => (
                <div
                  key={col.heading}
                  className="flex flex-col gap-4 min-w-[100px]"
                >
                  <h4
                    className="text-sm font-semibold"
                    style={{ color: "#19213D" }}
                  >
                    {col.heading}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm transition-colors duration-200"
                          style={{ color: "#6D758F" }}
                          onMouseEnter={(e) =>
                          ((
                            e.currentTarget as HTMLAnchorElement
                          ).style.color = "#19213D")
                          }
                          onMouseLeave={(e) =>
                          ((
                            e.currentTarget as HTMLAnchorElement
                          ).style.color = "#6D758F")
                          }
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Divider + bottom bar */}
          <div
            className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t"
            style={{ borderColor: "#e5e7eb" }}
          >
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              © {new Date().getFullYear()} OFFER-HUB. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Powered by Stellar Blockchain
            </p>
          </div>
        </div>
      </div>

      {/* ── Watermark ── */}
      <div
        ref={wrapRef}
        className="max-w-6xl mx-auto px-6 lg:px-8 overflow-hidden"
      >
        <div
          ref={textRef}
          className="select-none pointer-events-none leading-none mt-2 whitespace-nowrap mx-auto"
          style={{
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "rgba(25,33,61,0.12)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 30%, transparent 75%)",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 30%, transparent 75%)",
          }}
        >
          _OFFER-HUB
        </div>
      </div>
    </footer>
  );
}
