import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";
import { TERMS_MDX_COMPONENTS } from "@/components/terms/terms-mdx-components";
import { TermsPageHeader } from "@/components/terms/TermsPageHeader";
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
      <main className="flex-grow pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <TermsPageHeader />
          <div className="space-y-12">
            <MDXRemote
              source={source}
              components={TERMS_MDX_COMPONENTS}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
            <div className="p-8 md:p-10 rounded-[2.5rem] bg-bg-base shadow-sunken-subtle">
              <p className="text-sm font-medium italic leading-relaxed text-content-secondary">
                This document was drafted for the OFFER-HUB open-source project and should be reviewed by a licensed
                attorney before publication in a production environment. It is intended as a comprehensive starting point
                covering the platform&apos;s key legal exposure areas.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
