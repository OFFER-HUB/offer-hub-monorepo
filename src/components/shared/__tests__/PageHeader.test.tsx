import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "../PageHeader";
import { Eyebrow, EYEBROW_CLASS } from "../Eyebrow";
import { cn } from "@/lib/cn";

describe("PageHeader", () => {
  it("renders the title as the only h1 at the page size by default", () => {
    render(<PageHeader title="Pricing" />);

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Pricing");
    expect(headings[0]).toHaveClass("text-h1", "text-content-primary");
    expect(headings[0]).not.toHaveClass("text-h1-docs");
  });

  it("uses the docs size for docs pages", () => {
    render(<PageHeader size="docs" title="Getting Started" />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-h1-docs");
  });

  it("renders eyebrow, lead and actions in order", () => {
    const { container } = render(
      <PageHeader
        eyebrow="Legal"
        title="Terms"
        lead="What you agree to."
        actions={<button type="button">Read the docs</button>}
      />,
    );

    const text = container.textContent ?? "";
    expect(text.indexOf("Legal")).toBeLessThan(text.indexOf("Terms"));
    expect(text.indexOf("Terms")).toBeLessThan(text.indexOf("What you agree to."));
    expect(screen.getByText("Legal")).toHaveClass("text-label", "uppercase");
    expect(screen.getByText("What you agree to.")).toHaveClass("text-body", "text-content-secondary");
    expect(screen.getByRole("button", { name: "Read the docs" })).toBeInTheDocument();
  });

  it("omits the optional parts when not given", () => {
    const { container } = render(<PageHeader title="Only a title" />);

    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("centers when align is center", () => {
    const { container } = render(<PageHeader align="center" title="Centered" />);

    expect(container.querySelector("header")).toHaveClass("items-center", "text-center");
  });

  it("forwards the title id and extra children", () => {
    render(
      <PageHeader title="Community" titleId="community-title">
        <p>Last updated today</p>
      </PageHeader>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("id", "community-title");
    expect(screen.getByText("Last updated today")).toBeInTheDocument();
  });
});

describe("Eyebrow", () => {
  it("renders a 12/600 uppercase label in brand teal", () => {
    render(<Eyebrow>How it works</Eyebrow>);

    const eyebrow = screen.getByText("How it works");
    expect(eyebrow.tagName).toBe("P");
    expect(eyebrow).toHaveClass(...EYEBROW_CLASS.split(" "));
    expect(eyebrow.className).not.toMatch(/tracking-\[/);
  });

  it("supports another element and a decorative icon", () => {
    render(
      <Eyebrow as="span" icon={<svg data-testid="icon" />}>
        Technical overview
      </Eyebrow>,
    );

    const eyebrow = screen.getByText("Technical overview");
    expect(eyebrow.tagName).toBe("SPAN");
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });
});

describe("cn with the type scale", () => {
  it("keeps a type-scale size next to a text color", () => {
    expect(cn("text-h1", "text-content-primary")).toBe("text-h1 text-content-primary");
    expect(cn("text-label", "text-theme-primary-hover")).toBe("text-label text-theme-primary-hover");
  });

  it("lets a later size override an earlier one", () => {
    expect(cn("text-h1", "text-h1-docs")).toBe("text-h1-docs");
    expect(cn("text-sm", "text-body")).toBe("text-body");
  });
});
