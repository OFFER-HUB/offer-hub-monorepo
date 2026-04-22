import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "OFFER-HUB Terms of Service — read the terms and conditions governing your use of the platform, escrow services, and smart contracts.",
  openGraph: {
    title: "Terms of Service | OFFER-HUB",
    description:
      "Read the terms and conditions governing your use of the OFFER-HUB platform.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
