import rawSpec from "../../../../../public/openapi.json";
import { parseOpenApiSpec, type RawOpenApiDocument } from "@/lib/openapi";
import { ExplorerClient } from "@/components/api-explorer/ExplorerClient";

export default function InteractiveExplorerPage() {
  const categories = parseOpenApiSpec(rawSpec as unknown as RawOpenApiDocument);

  return (
    <article className="max-w-4xl mx-auto">
      {/* Page header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-content-primary">
          Interactive API Explorer
        </h1>
        <p className="mt-3 text-base text-content-secondary">
          Every endpoint below is generated from the real OFFER-HUB Orchestrator OpenAPI spec
          (<code className="text-sm">public/openapi.json</code>) — fill in parameters, set a bearer
          token, and send a real request straight from your browser.
        </p>
      </header>

      <ExplorerClient categories={categories} />
    </article>
  );
}
