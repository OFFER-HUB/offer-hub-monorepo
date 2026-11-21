import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ContactPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/contact",
  useSearchParams: () => new URLSearchParams(),
}));

describe("ContactPage", () => {
  it("renders within the site shell with Navbar and Footer", () => {
    render(
      <ThemeProvider>
        <ContactPage />
      </ThemeProvider>,
    );

    expect(screen.getAllByRole("banner").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("contentinfo").length).toBeGreaterThan(0);
  });

  it("renders page header and two columns", () => {
    const { container } = render(
      <ThemeProvider>
        <ContactPage />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Contact Sales" }),
    ).toBeInTheDocument();

    // Verify two-column grid at lg breakpoint
    const grid = container.querySelector(".lg\\:grid-cols-12");
    expect(grid).toBeInTheDocument();
  });

  it("renders 'What happens next' with 3 steps", () => {
    render(
      <ThemeProvider>
        <ContactPage />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "What happens next" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Discovery & requirements")).toBeInTheDocument();
    expect(screen.getByText("Technical consultation")).toBeInTheDocument();
    expect(screen.getByText("Sandbox & onboarding")).toBeInTheDocument();
  });

  it("renders 'Technical question?' and contact address", () => {
    render(
      <ThemeProvider>
        <ContactPage />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Technical question?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Contact Address" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /contact@offer-hub\.tech/i }),
    ).toHaveAttribute("href", "mailto:contact@offer-hub.tech");
  });
});
