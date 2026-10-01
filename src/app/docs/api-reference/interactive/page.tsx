"use client";

import { useEffect, useState, useRef } from "react";
import { EndpointPanel } from "@/components/api-explorer/EndpointPanel";
import { parseOpenApi, type EndpointCategory } from "@/lib/openapi-parser";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/docs/Badge";
import { Callout } from "@/components/docs/Callout";

export default function InteractiveExplorerPage() {
  const [categories, setCategories] = useState<EndpointCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<unknown>(null);

  useEffect(() => {
    fetch("/openapi.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load OpenAPI spec");
        return res.json();
      })
      .then((data) => {
        dataRef.current = data;
        setCategories(parseOpenApi(data));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading OpenAPI specification.");
        setLoading(false);
      });
  }, []);

  return (
    <article className="max-w-4xl mx-auto">
      {/* Page header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-content-primary mb-3">
          Interactive API Explorer
        </h1>
        <p className="text-base text-content-secondary">
          Browse endpoints, fill in parameters, and see live request/response payloads — all without leaving the docs.
        </p>
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

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-theme-primary" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-bg-sunken text-theme-danger shadow-neu-sunken-subtle">
          {error}
        </div>
      )}

      {/* Categories */}
      {!loading && !error && (
        <>
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search endpoints by path or title..."
              className="w-full px-4 py-3 bg-bg-sunken text-content-primary rounded-xl shadow-neu-sunken-subtle focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                if (!q) {
                  setCategories(parseOpenApi(dataRef.current));
                  return;
                }
                const filtered = parseOpenApi(dataRef.current).map(cat => ({
                  ...cat,
                  endpoints: cat.endpoints.filter(ep => 
                    ep.path.toLowerCase().includes(q) || 
                    ep.title.toLowerCase().includes(q) ||
                    ep.description.toLowerCase().includes(q)
                  )
                })).filter(cat => cat.endpoints.length > 0);
                setCategories(filtered);
              }}
            />
          </div>

          <div className="space-y-12">
            {categories.map((category) => (
              <section key={category.name}>
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-content-primary capitalize">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm mt-1 text-content-secondary">
                      {category.description}
                    </p>
                  )}
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
        </>
      )}
    </article>
  );
}
