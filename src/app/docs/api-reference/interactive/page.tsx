"use client";

import { useState, useMemo } from "react";
import { API_SCHEMA } from "@/data/api-schema";
import { EndpointPanel } from "@/components/api-explorer/EndpointPanel";
import { FileCode, Search, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function InteractiveExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const totalEndpointsCount = useMemo(() => {
    return API_SCHEMA.reduce((sum, cat) => sum + cat.endpoints.length, 0);
  }, []);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return API_SCHEMA.map((cat) => {
      if (selectedCategory !== "ALL" && cat.name !== selectedCategory) {
        return { ...cat, endpoints: [] };
      }

      if (!q) return cat;

      const matchingEndpoints = cat.endpoints.filter((ep) => {
        return (
          ep.path.toLowerCase().includes(q) ||
          ep.title.toLowerCase().includes(q) ||
          ep.method.toLowerCase().includes(q) ||
          ep.description.toLowerCase().includes(q) ||
          (ep.sourceController && ep.sourceController.toLowerCase().includes(q))
        );
      });

      return { ...cat, endpoints: matchingEndpoints };
    }).filter((cat) => cat.endpoints.length > 0);
  }, [searchQuery, selectedCategory]);

  const displayedCount = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + cat.endpoints.length, 0);
  }, [filteredCategories]);

  return (
    <article className="max-w-5xl mx-auto space-y-10">
      {/* Page header */}
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-content-primary">
                Interactive API Explorer
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-bg-sunken text-theme-primary shadow-neu-sunken-subtle">
                <CheckCircle2 size={13} className="text-theme-success" aria-hidden="true" />
                {totalEndpointsCount} Verified Endpoints
              </span>
            </div>
            <p className="text-base text-content-secondary max-w-2xl">
              Inspect verified REST endpoints generated directly from orchestrator NestJS controllers.
              Fill in parameters and test request/response payloads live.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/openapi.json"
              target="_blank"
              download="openapi.json"
              aria-label="Download complete OpenAPI 3.0 specification in JSON format"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-bg-base text-theme-primary shadow-neu-raised hover:shadow-neu-raised-sm active:shadow-neu-sunken transition-all duration-200 border border-theme-border/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            >
              <Download size={14} aria-hidden="true" />
              OpenAPI 3.0 Spec
            </Link>
          </div>
        </div>

        {/* Informational Callout in pure neumorphic styling */}
        <div className="p-5 rounded-2xl bg-bg-sunken shadow-neu-sunken-subtle space-y-2 border border-theme-border/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-primary">
            <FileCode size={15} aria-hidden="true" />
            Verified Controller Schema
          </div>
          <p className="text-sm text-content-secondary leading-relaxed">
            All endpoints listed below are verified against orchestrator backend modules (<code className="font-mono text-xs text-content-primary">src/auth</code>, <code className="font-mono text-xs text-content-primary">src/orders</code>, <code className="font-mono text-xs text-content-primary">src/balance</code>, <code className="font-mono text-xs text-content-primary">src/escrow</code>, <code className="font-mono text-xs text-content-primary">src/resolution</code>, etc.). The raw specification is generated via <code className="font-mono text-xs text-content-primary">scripts/generate-openapi.ts</code>.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" size={16} aria-hidden="true" />
            <input
              id="api-explorer-search-input"
              type="text"
              aria-label="Search API endpoints by path, title, method, or controller"
              placeholder="Search by path (e.g. /orders, /balance), method, or controller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium bg-bg-sunken shadow-neu-sunken-subtle text-content-primary placeholder:text-content-muted outline-none transition-all border border-transparent focus:ring-2 focus:ring-theme-primary"
            />
          </div>

          <div className="w-full sm:w-auto">
            <label htmlFor="api-explorer-category-select" className="sr-only">
              Filter by category
            </label>
            <select
              id="api-explorer-category-select"
              aria-label="Filter API endpoints by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium bg-bg-base shadow-neu-raised text-content-primary outline-none transition-all border border-theme-border/20 cursor-pointer focus:ring-2 focus:ring-theme-primary"
            >
              <option value="ALL">All Categories ({totalEndpointsCount})</option>
              {API_SCHEMA.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.endpoints.length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchQuery && (
          <p className="text-xs text-content-secondary" aria-live="polite">
            Showing <strong className="text-content-primary">{displayedCount}</strong> matching endpoints for &quot;{searchQuery}&quot;
          </p>
        )}
      </header>

      {/* Categories & Endpoints */}
      <div className="space-y-12">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-bg-sunken shadow-neu-sunken-subtle space-y-3">
            <p className="text-base font-semibold text-content-primary">No endpoints matched your search.</p>
            <p className="text-sm text-content-secondary">Try searching for a different keyword or select &quot;All Categories&quot;.</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.name} className="space-y-4" aria-labelledby={`category-heading-${category.name.replace(/[^a-zA-Z0-9]/g, "_")}`}>
              <div>
                <h2 id={`category-heading-${category.name.replace(/[^a-zA-Z0-9]/g, "_")}`} className="text-xl font-black text-content-primary tracking-tight">
                  {category.name}
                </h2>
                <p className="text-sm text-content-secondary mt-0.5">
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
          ))
        )}
      </div>
    </article>
  );
}
