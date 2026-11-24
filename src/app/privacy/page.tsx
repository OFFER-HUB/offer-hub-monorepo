import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { MDXRemote } from "next-mdx-remote/rsc";
import { MDX_PRIVACY_COMPONENTS } from "@/components/mdx/PrivacyComponents";
import { buildPageMetadata } from "@/lib/seo";
import { getStaticMdxContent } from "@/lib/mdx";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "How OFFER-HUB collects, uses, and protects your data. Privacy is a feature, not an afterthought — read our full data governance and transparency policy.",
  keywords: [
    "privacy policy",
    "data governance",
    "GDPR",
    "data protection",
    "transparency",
    "OFFER-HUB",
  ],
  path: "/privacy",
  ogImageAlt: "OFFER-HUB Privacy Policy — data governance and transparency",
});

export default async function PrivacyPage() {
  const content = getStaticMdxContent("src/content/privacy.mdx");

  return (
    <div className="min-h-screen flex flex-col">
      <LoadingBar />
      <Navbar />
      <LegalLayout eyebrow="Data Governance" title={<>Privacy & <span className="text-theme-primary">Transparency</span></>} updated="April 28, 2026" description="We believe in full transparency about how we handle your data. Privacy is a feature, not an afterthought." sections={["Data Collection Policy", "Cookies", "Third-Party Services", "Third-Party Data Processors", "Your Data Rights", "Get in Touch"].map((label) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), label }))}>
        <MDXRemote source={content} components={MDX_PRIVACY_COMPONENTS} />
      </LegalLayout>
      <Footer />
    </div>
  );
}
