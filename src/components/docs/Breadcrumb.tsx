"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ChevronRight, Home } from "lucide-react";
import { SITE_URL_FALLBACK } from "@/constants/site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL_FALLBACK;

function formatSegment(segment: string): string {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Breadcrumb() {
  const pathname = usePathname();

  const pathSegments = useMemo(() => {
    const [, docs, ...rest] = pathname.split("/");
    if (docs !== "docs") return [];
    return rest.filter(Boolean);
  }, [pathname]);

  const isHub = pathname === "/docs" || pathname === "/docs/";

  if (isHub || pathSegments.length === 0) return null;

  const breadcrumbItems = [
    { name: "Docs", href: "/docs" },
    ...pathSegments.map((segment, index) => ({
      name: formatSegment(segment),
      href: `/docs/${pathSegments.slice(0, index + 1).join("/")}`,
    })),
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.name,
        item: `${SITE_URL}${item.href}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex items-center gap-2 text-[14px] whitespace-nowrap overflow-x-auto no-scrollbar py-1">
        <Link
          href="/docs"
          className="text-theme-primary hover:text-theme-primary/80 transition-colors font-medium inline-flex items-center gap-1.5 min-h-11"
        >
          <Home size={15} />
          Docs
        </Link>
        {pathSegments.map((segment, index) => {
          const href = `/docs/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          return (
            <span key={`${segment}-${index}`} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-content-secondary/30" />
              {isLast ? (
                <span className="text-content-primary font-medium">
                  {formatSegment(segment)}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-content-secondary hover:text-content-primary transition-colors font-medium inline-flex items-center min-h-11"
                >
                  {formatSegment(segment)}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </>
  );
}
