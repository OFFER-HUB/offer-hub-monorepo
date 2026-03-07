import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllDocSlugs, getDocBySlug } from "@/lib/mdx";
import { MDX_COMPONENTS } from "@/components/docs/mdx-components";
import { EditOnGitHub } from "@/components/docs/EditOnGitHub";

import remarkGfm from "remark-gfm";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug.join("/"));
  if (!doc) return {};

  return {
    title: `${doc.frontmatter.title} — OFFER-HUB Docs`,
    description: doc.frontmatter.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getDocBySlug(slug.join("/"));

  if (!doc) notFound();

  return (
    <article className="min-w-0">
      {/* Page header */}
      <div className="mb-12 pb-8 border-b border-[#D1D5DB]/30">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight" style={{ color: "#19213D" }}>
          {doc.frontmatter.title}
        </h1>
        {doc.frontmatter.description && (
          <p className="text-xl leading-relaxed font-medium" style={{ color: "#6D758F" }}>
            {doc.frontmatter.description}
          </p>
        )}
      </div>

      {/* MDX content */}
      <div className="max-w-none" id="doc-page-export-content">
        <MDXRemote
          source={doc.content}
          components={MDX_COMPONENTS}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            }
          }}
        />
      </div>

      {/* Hidden metadata for layout actions */}
      <div
        id="doc-metadata-for-actions"
        style={{ display: "none" }}
        data-slug={doc.slug}
        data-title={doc.frontmatter.title}
        data-markdown={doc.content}
      />

      {/* Edit on GitHub link */}
      <div className="mt-8 pt-6 border-t" style={{ borderColor: "#d1d5db" }}>
        <EditOnGitHub filePath={`content/docs/${doc.slug}.mdx`} />
      </div>
    </article>
  );
}
