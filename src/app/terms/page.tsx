import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { TERMS_MDX_COMPONENTS } from "@/components/terms/terms-mdx-components";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { legalSlug } from "@/components/legal/legalSlug";
import { buildPageMetadata } from "@/lib/seo";
import { getStaticMdxContent } from "@/lib/mdx";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service",
  description:
    "The terms governing use of the OFFER-HUB platform — acceptable use, escrow responsibilities, liability, and the legal framework behind our payment orchestration.",
  keywords: [
    "terms of service",
    "terms and conditions",
    "legal",
    "acceptable use",
    "escrow terms",
    "OFFER-HUB",
  ],
  path: "/terms",
  ogImageAlt: "OFFER-HUB Terms of Service",
});

export default async function TermsOfServicePage() {
  const source = getStaticMdxContent("src/content/terms.mdx");

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-content-primary">
      <LoadingBar />
      <Navbar />
      <LegalLayout eyebrow="Legal Framework" title={<>Platform <span className="text-theme-primary">Terms</span></>} updated="April 29, 2026" description="These terms outline the agreement between you and OFFER-HUB. By using our tools, you agree to these principles of operation." sections={Array.from(source.matchAll(/<TermsSection icon="[^"]+" title="(?:\d+\. )?([^"]+)"/g), ([, label]) => ({ id: legalSlug(label), label }))}>
          <div className="space-y-12">
            <MDXRemote
              source={source}
              components={TERMS_MDX_COMPONENTS}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
            <div className="p-8 md:p-10 rounded-3xl bg-bg-base shadow-neu-sunken-subtle">
              <p className="text-sm font-medium italic leading-relaxed text-content-secondary">
                This document was drafted for the OFFER-HUB open-source project and should be reviewed by a licensed
                attorney before publication in a production environment. It is intended as a comprehensive starting point
                covering the platform&apos;s key legal exposure areas.
              </p>
            </div>
          </div>
      </LegalLayout>
      <Footer />
    </div>
  );
}
