import fs from "fs";
import path from "path";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";
import { MDXRemote } from "next-mdx-remote/rsc";
import { MDX_PRIVACY_COMPONENTS } from "@/components/mdx/PrivacyComponents";

export default async function PrivacyPage() {
  const content = fs.readFileSync(path.join(process.cwd(), "src/content/privacy.mdx"), "utf-8");

  return (
    <div className="min-h-screen flex flex-col">
      <LoadingBar />
      <Navbar />
      <main className="flex-grow pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-24">
        <div className="text-center mb-20 md:mb-28 animate-fadeInUp">
          <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-4 text-theme-primary">
            Data Governance
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-content-primary leading-none mb-6">
            Privacy & <span className="text-theme-primary">Transparency</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl font-medium max-w-2xl mx-auto px-2 text-content-secondary leading-relaxed">
            We believe in full transparency about how we handle your data. Privacy is a feature, not an afterthought.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-elevated shadow-neu-raised-sm text-xs font-bold text-content-secondary">
            Last updated: <span className="text-theme-primary">April 28, 2026</span>
          </div>
        </div>
        <MDXRemote source={content} components={MDX_PRIVACY_COMPONENTS} />
      </main>
      <Footer />
    </div>
  );
}
