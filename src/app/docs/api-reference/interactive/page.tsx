"use client";

import { API_SCHEMA } from "@/data/api-schema";
import { EndpointPanel } from "@/components/api-explorer/EndpointPanel";
import { Badge } from "@/components/docs/Badge";
import { Callout } from "@/components/docs/Callout";

export default function InteractiveExplorerPage() {
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
          <Badge variant="warning">Coming Soon</Badge>
        </div>
        <p className="mt-3 text-base text-content-secondary">
          Browse endpoints, fill in parameters, and see mock request/response
          payloads — all without leaving the docs.
        </p>
        <Callout type="warning">
          <strong>Preview Mode:</strong> This interactive explorer is currently under development.
          The endpoints shown below are for reference only. Full interactivity with live API testing
          is coming in a future release.
        </Callout>
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