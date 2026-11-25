import rawSpec from "../../../../../public/openapi.json";
import { parseOpenApiSpec, type RawOpenApiDocument } from "@/lib/openapi";
import { ExplorerClient } from "@/components/api-explorer/ExplorerClient";
import { PageHeader } from "@/components/shared/PageHeader";

export default function InteractiveExplorerPage() {
  const categories = parseOpenApiSpec(rawSpec as unknown as RawOpenApiDocument);

  return (
    <article className="max-w-4xl mx-auto">
      {/* Page header */}
      <PageHeader
        size="docs"
        className="mb-10"
        title="Interactive API Explorer"
        lead={
          <>
            Every endpoint below is generated from the real OFFER-HUB Orchestrator OpenAPI spec
            (<code className="text-sm">public/openapi.json</code>) — fill in parameters, set a bearer
            token, and send a real request straight from your browser.
          </>
        }
      />

      <ExplorerClient categories={categories} />
    </article>
  );
}
