// @vitest-environment node
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { useMediaQuery } from "../useMediaQuery";

/**
 * Guards the SSR/hydration contract called out in #1500: with no `window`,
 * the hook must fall back to `false` rather than throwing, so the server
 * markup is stable and matches what the client renders before its first
 * effect runs.
 */
function Probe({ query }: { query: string }) {
  const matches = useMediaQuery(query);
  return <span data-matches={String(matches)}>{matches ? "yes" : "no"}</span>;
}

describe("useMediaQuery on the server", () => {
  it("does not reference window during render", () => {
    expect(typeof window).toBe("undefined");
    expect(() => renderToString(<Probe query="(max-width: 768px)" />)).not.toThrow();
  });

  it("renders the false branch, matching the client's pre-effect state", () => {
    const html = renderToString(<Probe query="(max-width: 768px)" />);

    expect(html).toContain('data-matches="false"');
    expect(html).toContain("no");
  });

  it("returns false for every query, including ones that would match a real viewport", () => {
    for (const query of ["(min-width: 0px)", "all", "(prefers-reduced-motion: reduce)"]) {
      expect(renderToString(<Probe query={query} />)).toContain(
        'data-matches="false"',
      );
    }
  });
});
