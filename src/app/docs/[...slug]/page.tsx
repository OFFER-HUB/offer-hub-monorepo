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
  if (!doc) notFound();

  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const requestedSlug = slug.join("/");

  if (!getAllDocSlugs().includes(requestedSlug)) {
    notFound();
  }

  const doc = getDocBySlug(requestedSlug);

  if (!doc) {
    notFound();
  }

  return (
    <article className="min-w-0">
      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-theme-border/20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-content-primary">
              {doc.frontmatter.title}
            </h1>
            {doc.frontmatter.description && (
              <p className="text-base leading-relaxed text-content-secondary">
                {doc.frontmatter.description}
              </p>
            )}
          </div>
        </div>
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
