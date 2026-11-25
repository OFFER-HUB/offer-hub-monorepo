import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocsSidebar } from "../DocsSidebar";
import type { SidebarSection } from "@/lib/mdx";

const pathnameMock = vi.fn<() => string>();

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

const NAV: SidebarSection[] = [
  {
    section: "Getting Started",
    links: [
      { title: "Getting Started", slug: "getting-started", order: 1 },
      { title: "Installation", slug: "installation", order: 2 },
    ],
  },
  {
    section: "SDK",
    links: [{ title: "Quick Start", slug: "sdk/quick-start", order: 50 }],
  },
];

function currentLinks(container: HTMLElement) {
  return container.querySelectorAll('[aria-current="page"]');
}

describe("DocsSidebar", () => {
  beforeEach(() => {
    pathnameMock.mockReset();
  });

  it("lists getting started exactly once", () => {
    pathnameMock.mockReturnValue("/docs");
    const { container } = render(<DocsSidebar nav={NAV} />);
    expect(container.querySelectorAll('a[href="/docs/getting-started"]')).toHaveLength(1);
    expect(screen.queryByText("Welcome")).toBeNull();
  });

  it.each(["/docs", "/docs/getting-started", "/docs/installation", "/docs/sdk/quick-start"])(
    "marks only one item as the current page on %s",
    (pathname) => {
      pathnameMock.mockReturnValue(pathname);
      const { container } = render(<DocsSidebar nav={NAV} />);
      const current = currentLinks(container);
      expect(current).toHaveLength(1);
      expect(current[0].getAttribute("href")).toBe(pathname);
    },
  );

  it("marks nothing as current on a route that is not in the sidebar", () => {
    pathnameMock.mockReturnValue("/docs/unknown");
    const { container } = render(<DocsSidebar nav={NAV} />);
    expect(currentLinks(container)).toHaveLength(0);
  });
});
