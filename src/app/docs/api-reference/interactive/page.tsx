"use client";

import { API_SCHEMA } from "@/data/api-schema";
import { EndpointPanel } from "@/components/api-explorer/EndpointPanel";
import { Badge } from "@/components/docs/Badge";
import { Callout } from "@/components/docs/Callout";

export default function InteractiveExplorerPage() {
  const totalEndpoints = API_SCHEMA.reduce(
    (acc, category) => acc + category.endpoints.length,
    0,
  );

  return (
    <article className="max-w-4xl mx-auto">
      {/* Page header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 flex-wrap">
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-content-primary"
          >
            Interactive API Explorer
          </h1>
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-secondary text-content-secondary border border-border-subtle">
            {totalEndpoints} endpoints{totalEndpoints === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-3 text-base text-content-secondary">
          Browse every operation from the generated OpenAPI 3.0 spec, inspect parameters,
          request and response schemas, and security scopes — all without leaving the
          docs.
        </p>
<Callout type="warning">
          <strong>Preview Mode:</strong> This interactive explorer is currently under development.
          The endpoints shown below are for reference only. Full interactivity with live API testing
          is coming in a future release.
        </Callout>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="/openapi.json"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-surface-secondary text-content-primary border border-border-subtle hover:bg-surface-tertiary transition-colors"
          >
            Download openapi.json
          </a>
          <span className="text-xs text-content-secondary">
            Source of truth: <code>docs/public/openapi.json</code>
          </span>
        </div>
      </header>

      {/* Categories */}
      <div className="space-y-12">
        {API_SCHEMA.map((category) => (
          <section key={category.name}>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-content-primary">
                {category.name}
              </h2>
              <p className="text-sm mt-1 text-content-secondary">
                {category.description}
              </p>
            </div>

            <div className="space-y-3">
              {category.endpoints.map((endpoint) => (
                <EndpointPanel
                  key={`${endpoint.method}-${endpoint.path}`}
                  endpoint={endpoint}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
