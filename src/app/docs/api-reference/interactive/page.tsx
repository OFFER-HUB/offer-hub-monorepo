"use client";

import { API_SCHEMA } from "@/data/api-schema";
import { EndpointPanel } from "@/components/api-explorer/EndpointPanel";

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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-theme-warning/10 text-theme-warning shadow-neu-raised-sm">
            Coming Soon
          </span>
        </div>
        <p className="mt-3 text-base text-content-secondary">
          Browse endpoints, fill in parameters, and see mock request/response
          payloads — all without leaving the docs.
        </p>
        <div className="mt-4 p-4 rounded-2xl bg-bg-elevated shadow-neu-raised-sm">
          <p className="text-sm text-content-secondary">
            <strong className="text-theme-warning font-bold">Preview Mode:</strong> This interactive explorer is currently under development.
            The endpoints shown below are for reference only. Full interactivity with live API testing
            is coming in a future release.
          </p>
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
