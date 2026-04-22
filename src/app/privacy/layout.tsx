import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "OFFER-HUB Privacy Policy — learn how we collect, use, and protect your personal data on the platform.",
  openGraph: {
    title: "Privacy Policy | OFFER-HUB",
    description:
      "Learn how OFFER-HUB collects, uses, and protects your personal data.",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
