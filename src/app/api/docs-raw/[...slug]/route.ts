import { getRawMarkdown } from "@/lib/mdx";

interface RouteParams {
  params: Promise<{ slug: string[] }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const markdown = getRawMarkdown(slug.join("/"));

  if (markdown === null) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
