"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Twitter, Send, Github, Disc3 } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

const COOKIE_PREFERENCES_EVENT = "cookie-preferences-open";

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
      { href: "/accessibility", label: "Accessibility" },
      { href: "#", label: "Cookie Preferences" },
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
  const { resolvedTheme } = useTheme();

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
    <footer className="bg-transparent pt-4 pb-0 relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="rounded-3xl px-10 py-12 bg-bg-elevated shadow-neu-raised">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="flex flex-col gap-6 md:w-72 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2.5">
                <Image
                  src={
                    resolvedTheme === "dark"
                      ? "/OFFER-HUB-logo-to-darkmode.png"
                      : "/OFFER-HUB-logo.png"
                  }
                  alt="OFFER-HUB"
                  width={160}
                  height={42}
                  className="h-9 w-auto object-contain"
                />
              </Link>

              <p className="text-sm leading-relaxed text-content-secondary">
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
                    className="text-content-secondary hover:text-content-primary transition-colors duration-200"
                  >
                    <s.icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-1 gap-8 md:gap-12 flex-wrap">
              {navColumns.map((col) => (
                <div
                  key={col.heading}
                  className="flex flex-col gap-4 min-w-[100px]"
                >
                  <h4 className="text-sm font-semibold text-content-primary">
                    {col.heading}
                  </h4>

                  <ul className="flex flex-col gap-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {link.label === "Cookie Preferences" ? (
                          <a
                            href={link.href}
                            onClick={(e) => {
                              e.preventDefault();
                              window.dispatchEvent(
                                new CustomEvent(COOKIE_PREFERENCES_EVENT)
                              );
                            }}
                            className="text-sm text-content-secondary hover:text-content-primary transition-colors duration-200"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-sm text-content-secondary hover:text-content-primary transition-colors duration-200"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-theme-border">
            <p className="text-xs text-content-muted">
              © {new Date().getFullYear()} OFFER-HUB. All rights reserved.
            </p>

            <p className="text-xs text-content-muted">
              Powered by Stellar Blockchain
            </p>
          </div>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="max-w-6xl mx-auto px-6 lg:px-8 overflow-hidden"
      >
        <div
          ref={textRef}
          className="select-none pointer-events-none leading-none mt-2 whitespace-nowrap mx-auto text-theme-primary"
          style={{
            fontWeight: 900,
            letterSpacing: "-0.03em",
            opacity: 0.3,
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