import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// Metadata lives in the layout because accessibility/page.tsx is a client
// component, which cannot export a metadata object.
export const metadata: Metadata = buildPageMetadata({
  title: "Accessibility",
  description:
    "OFFER-HUB's accessibility commitment: WCAG 2.1 Level AA target, screen reader and keyboard support, known limitations, and how to report accessibility barriers.",
  keywords: [
    "accessibility",
    "WCAG 2.1",
    "a11y",
    "screen reader",
    "keyboard navigation",
    "inclusive design",
    "OFFER-HUB",
  ],
  path: "/accessibility",
  ogImageAlt: "OFFER-HUB Accessibility — our WCAG 2.1 Level AA commitment",
});

export default function AccessibilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
