import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, type RenderResult } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

/**
 * Smoke coverage for every `page.tsx` under `src/app`: each route renders
 * without throwing and exposes the `main` landmark a screen-reader user
 * navigates by.
 *
 * The mocks below stand in for the parts of the Next.js runtime that only
 * exist in a real server render — the app router, the MDX compiler, and the
 * network. Everything else (layout components, client hooks, data shaping)
 * renders for real, which is the point: a page that throws on mount fails
 * here instead of in production.
 */

/* ------------------------------- Next.js ---------------------------------- */

const push = vi.fn();

class NotFoundError extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
  }
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new NotFoundError();
  },
}));

/** Build artifact (git-ignored); the docs search bar imports it statically. */
vi.mock("@/data/docs-index.json", () => ({ default: [] }));

/**
 * `MDXRemote` is an async RSC that compiles MDX at render time. Swapping it
 * for a plain element keeps these tests about the page shell rather than
 * about the MDX toolchain, which `src/lib/__tests__/mdx.test.ts` covers.
 */
vi.mock("next-mdx-remote/rsc", () => ({
  MDXRemote: ({ source }: { source: string }) => (
    <div data-testid="mdx-content">{source.slice(0, 200)}</div>
  ),
}));

/** Mermaid renders into a real canvas/SVG pipeline jsdom cannot drive. */
vi.mock("@/components/shared/MermaidDiagram", () => ({
  MermaidDiagram: () => <div data-testid="mermaid" />,
  default: () => <div data-testid="mermaid" />,
}));

/* --------------------------------- Pages ---------------------------------- */

import Home from "../page";
import AccessibilityPage from "../accessibility/page";
import ArchitecturePage from "../architecture/page";
import BlueprintPage from "../blueprint/page";
import ChangelogPage from "../changelog/page";
import CommunityPage from "../community/page";
import ContactPage from "../contact/page";
import PricingPage from "../pricing/page";
import PrivacyPage from "../privacy/page";
import TermsPage from "../terms/page";
import UseCasesPage from "../use-cases/page";
import DocsPage from "../docs/page";
import InteractiveExplorerPage from "../docs/api-reference/interactive/page";
import DocPage from "../docs/[...slug]/page";
import DocsLayout from "../docs/layout";

/* -------------------------------- Helpers --------------------------------- */

/** Mirrors the root layout, which wraps every route in the theme provider. */
function renderRoute(ui: React.ReactElement): RenderResult {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

function expectMainLandmark() {
  const landmarks = screen.getAllByRole("main");
  expect(landmarks.length).toBeGreaterThan(0);
  return landmarks[0];
}

/** GitHub-backed routes must not reach the network from a test run. */
function stubGitHubFetch(ok = true) {
  const fetchMock = vi.fn(async () => ({
    ok,
    json: async () => [],
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.clearAllMocks();
  stubGitHubFetch();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* --------------------------- Synchronous routes --------------------------- */

const SYNC_ROUTES: Array<[string, () => React.ReactElement]> = [
  ["/accessibility", AccessibilityPage],
  ["/architecture", ArchitecturePage],
  ["/blueprint", BlueprintPage],
  ["/contact", ContactPage],
  ["/pricing", PricingPage],
  ["/use-cases", UseCasesPage],
];

describe.each(SYNC_ROUTES)("route %s", (path, Page) => {
  it("renders without throwing", () => {
    expect(() => renderRoute(<Page />)).not.toThrow();
  });

  it("exposes its main landmark", () => {
    renderRoute(<Page />);

    expect(expectMainLandmark()).toBeInTheDocument();
  });
});

describe("route /", () => {
  it("renders without throwing", () => {
    expect(() => renderRoute(<Home />)).not.toThrow();
  });

  it("exposes its main landmark", () => {
    renderRoute(<Home />);

    expect(expectMainLandmark()).toBeInTheDocument();
  });

  it("renders the site chrome around the content", () => {
    renderRoute(<Home />);

    expect(screen.getAllByRole("banner").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("contentinfo").length).toBeGreaterThan(0);
  });
});

/* ------------------------------- Docs routes ------------------------------- */

/**
 * The three docs routes get their `main` from `app/docs/layout.tsx`, so they
 * are rendered inside it — that is the tree a visitor actually gets.
 */
describe("route /docs", () => {
  it("renders without throwing", () => {
    expect(() =>
      renderRoute(
        <DocsLayout>
          <DocsPage />
        </DocsLayout>,
      ),
    ).not.toThrow();
  });

  it("exposes its main landmark", () => {
    renderRoute(
      <DocsLayout>
        <DocsPage />
      </DocsLayout>,
    );

    expect(expectMainLandmark()).toBeInTheDocument();
  });
});

describe("route /docs/api-reference/interactive", () => {
  it("renders without throwing", () => {
    expect(() =>
      renderRoute(
        <DocsLayout>
          <InteractiveExplorerPage />
        </DocsLayout>,
      ),
    ).not.toThrow();
  });

  it("exposes its main landmark", () => {
    renderRoute(
      <DocsLayout>
        <InteractiveExplorerPage />
      </DocsLayout>,
    );

    expect(expectMainLandmark()).toBeInTheDocument();
  });
});

describe("route /docs/[...slug]", () => {
  const params = (slug: string[]) => ({ params: Promise.resolve({ slug }) });

  it("renders an existing doc without throwing", async () => {
    const page = await DocPage(params(["getting-started"]));

    expect(() => renderRoute(<DocsLayout>{page}</DocsLayout>)).not.toThrow();
  });

  it("exposes its main landmark", async () => {
    const page = await DocPage(params(["getting-started"]));
    renderRoute(<DocsLayout>{page}</DocsLayout>);

    expect(expectMainLandmark()).toBeInTheDocument();
  });

  it("renders a nested doc slug", async () => {
    const page = await DocPage(params(["api-reference", "overview"]));
    renderRoute(<DocsLayout>{page}</DocsLayout>);

    expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
  });

  it("calls notFound for a slug with no matching file", async () => {
    await expect(DocPage(params(["definitely-not-a-doc"]))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});

/* ---------------------- Async, network-backed routes ---------------------- */

describe("route /changelog", () => {
  it("renders without throwing when the releases API responds", async () => {
    const page = await ChangelogPage();

    expect(() => renderRoute(page)).not.toThrow();
  });

  it("exposes its main landmark", async () => {
    renderRoute(await ChangelogPage());

    expect(expectMainLandmark()).toBeInTheDocument();
  });

  it("still renders when the releases API fails", async () => {
    stubGitHubFetch(false);

    renderRoute(await ChangelogPage());

    expect(expectMainLandmark()).toBeInTheDocument();
  });

  it("does not reach the real GitHub API", async () => {
    const fetchMock = stubGitHubFetch();

    await ChangelogPage();

    for (const [url] of fetchMock.mock.calls as unknown as [string][]) {
      expect(url).toMatch(/^https:\/\/api\.github\.com\//);
    }
    expect(fetchMock).toHaveBeenCalled();
  });
});

describe("route /community", () => {
  it("renders without throwing", async () => {
    const page = await CommunityPage();

    expect(() => renderRoute(page)).not.toThrow();
  });

  it("exposes its main landmark", async () => {
    renderRoute(await CommunityPage());

    expect(expectMainLandmark()).toBeInTheDocument();
  });

  it("still renders when every GitHub request fails", async () => {
    stubGitHubFetch(false);

    renderRoute(await CommunityPage());

    expect(expectMainLandmark()).toBeInTheDocument();
  });
});

/* ------------------------- Async, MDX-backed routes ----------------------- */

describe("route /privacy", () => {
  it("renders without throwing", async () => {
    const page = await PrivacyPage();

    expect(() => renderRoute(page)).not.toThrow();
  });

  it("exposes its main landmark", async () => {
    renderRoute(await PrivacyPage());

    expect(expectMainLandmark()).toBeInTheDocument();
  });

  it("renders the policy body from src/content/privacy.mdx", async () => {
    renderRoute(await PrivacyPage());

    expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
  });
});

describe("route /terms", () => {
  it("renders without throwing", async () => {
    const page = await TermsPage();

    expect(() => renderRoute(page)).not.toThrow();
  });

  it("exposes its main landmark", async () => {
    renderRoute(await TermsPage());

    expect(expectMainLandmark()).toBeInTheDocument();
  });

  it("renders the terms body from src/content/terms.mdx", async () => {
    renderRoute(await TermsPage());

    expect(screen.getByTestId("mdx-content")).toBeInTheDocument();
  });
});
