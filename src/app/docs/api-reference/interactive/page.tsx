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
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: "#19213D" }}
          >
            Interactive API Explorer
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
            Coming Soon
          </span>
        </div>
        <p className="mt-3 text-base" style={{ color: "#6D758F" }}>
          Browse endpoints, fill in parameters, and see mock request/response
          payloads — all without leaving the docs.
        </p>
        <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">
            <strong>Preview Mode:</strong> This interactive explorer is currently under development.
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
              <h2
                className="text-xl font-bold"
                style={{ color: "#19213D" }}
              >
                {category.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: "#6D758F" }}>
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
