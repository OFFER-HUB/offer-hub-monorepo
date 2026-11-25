"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Search, X, Globe, KeyRound } from "lucide-react";
import type { OpenApiCategory } from "@/lib/openapi";
import { EndpointPanel } from "./EndpointPanel";
import { Field } from "@/components/ui/Field";

interface ExplorerClientProps {
  categories: OpenApiCategory[];
}

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export function ExplorerClient({ categories }: ExplorerClientProps) {
  const [query, setQuery] = useState("");
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [bearerToken, setBearerToken] = useState("");

  const allOperations = useMemo(() => categories.flatMap((c) => c.operations), [categories]);

  const fuse = useMemo(
    () =>
      new Fuse(allOperations, {
        keys: ["summary", "path", "description", "tag"],
        threshold: 0.3,
      }),
    [allOperations],
  );

  const visibleCategories = useMemo(() => {
    if (query.trim().length < 2) return categories;
    const matchedIds = new Set(fuse.search(query).map((r) => r.item.operationId));
    return categories
      .map((c) => ({ ...c, operations: c.operations.filter((op) => matchedIds.has(op.operationId)) }))
      .filter((c) => c.operations.length > 0);
  }, [query, categories, fuse]);

  return (
    <div className="space-y-8">
      {/* Try-it setup */}
      <div className="rounded-2xl bg-bg-base shadow-neu-raised p-5 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-theme-primary">Try-it setup</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Base URL"
            leadingIcon={<Globe size={16} />}
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:4000"
            className="font-mono text-sm"
          />
          <Field
            label="Bearer token"
            leadingIcon={<KeyRound size={16} />}
            type="password"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            placeholder="ohk_live_... or a short-lived token"
            className="font-mono text-sm"
          />
        </div>
        <p className="text-xs text-content-secondary">
          Requests go straight from your browser to the base URL above when you click Try it on an
          endpoint below. Nothing here is stored or sent anywhere else.
        </p>
      </div>

      {/* Search */}
      <Field
        id="explorer-search"
        name="explorer-search"
        label="Search endpoints"
        hideLabel
        leadingIcon={<Search size={18} />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search endpoints by path, title, or description…"
        trailing={
          query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-content-secondary transition-colors duration-200 hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : undefined
        }
      />

      {/* Categories */}
      {visibleCategories.length === 0 ? (
        <p className="text-sm text-content-secondary">No endpoints match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="space-y-12">
          {visibleCategories.map((category) => (
            <section key={category.name}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-content-primary">{category.name}</h2>
                {category.description && (
                  <p className="text-sm mt-1 text-content-secondary">{category.description}</p>
                )}
              </div>
              <div className="space-y-3">
                {category.operations.map((operation) => (
                  <EndpointPanel
                    key={operation.operationId}
                    operation={operation}
                    baseUrl={baseUrl}
                    bearerToken={bearerToken}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
