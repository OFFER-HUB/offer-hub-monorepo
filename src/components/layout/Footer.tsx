"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Twitter, Send, Github, Disc3 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { COOKIE_PREFERENCES_EVENT } from "@/constants/events";
import { SOCIAL_X, SOCIAL_TELEGRAM, SOCIAL_DISCORD } from "@/constants/social";
import { GITHUB_ORG_URL, GITHUB_RELEASES_API_URL } from "@/constants/github";

interface FooterLink {
  href: string;
  label: string;
}

interface FooterNavColumn {
  heading: string;
  links: FooterLink[];
}

export function buildFooterNavColumns(showChangelog: boolean): FooterNavColumn[] {
  return [
    {
      heading: "Platform",
      links: [
        { href: "/", label: "Home" },
        { href: "/pricing", label: "Pricing" },
        { href: "/contact", label: "Contact" },
        { href: "/docs", label: "Docs" },
        { href: "/community", label: "Community" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { href: "/use-cases", label: "Use Cases" },
        ...(showChangelog ? [{ href: "/changelog", label: "Changelog" }] : []),
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
}

const socialLinks = [
  { href: SOCIAL_X, icon: Twitter, label: "X" },
  { href: SOCIAL_TELEGRAM, icon: Send, label: "Telegram" },
  { href: SOCIAL_DISCORD, icon: Disc3, label: "Discord" },
  { href: GITHUB_ORG_URL, icon: Github, label: "GitHub" },
];

export interface FooterProps {
  hasReleases?: boolean;
}

export function Footer({ hasReleases }: FooterProps = {}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [year, setYear] = useState<number | null>(null);
  const [remoteHasReleases, setRemoteHasReleases] = useState(false);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (typeof hasReleases === "boolean") {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    fetch(`${GITHUB_RELEASES_API_URL}?per_page=1`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as unknown;
      })
      .then((data) => {
        if (cancelled || controller.signal.aborted) return;
        if (Array.isArray(data) && data.length > 0) {
          setRemoteHasReleases(true);
        }
      })
      .catch(() => {
        // Keep Changelog hidden when releases cannot be verified.
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [hasReleases]);

  const showChangelog = hasReleases ?? remoteHasReleases;
  const navColumns = useMemo(
    () => buildFooterNavColumns(showChangelog),
    [showChangelog],
  );

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
            <div className="flex flex-col gap-6 md:w-72 md:flex-shrink-0 min-w-0 w-full max-w-full">
              <Link
                href="/"
                className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary rounded-xl w-fit"
              >
                <Logo height={36} />
              </Link>

              <p className="text-sm leading-relaxed text-content-secondary">
                Self-hosted, non-custodial payments orchestrator for modern
                marketplaces — escrow, balances, and settlement in one API.
              </p>

              <div className="flex flex-wrap items-center gap-1 min-w-0 max-w-full overflow-hidden">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-2 min-w-11 min-h-11 shrink-0 rounded-xl text-content-secondary hover:text-content-primary transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
                  >
                    <s.icon size={18} aria-hidden="true" />
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

                  <ul className="flex flex-col gap-1">
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
                            className="inline-flex items-center min-h-11 rounded-xl text-sm text-content-secondary hover:text-content-primary transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="inline-flex items-center min-h-11 rounded-xl text-sm text-content-secondary hover:text-content-primary transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
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
              © {year ?? ""} OFFER-HUB. All rights reserved.
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