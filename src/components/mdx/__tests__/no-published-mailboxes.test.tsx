import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { COMPANY_INFO } from "@/data/company-info";
import { ContactSection } from "../PrivacyComponents";
import AccessibilityPage from "@/app/accessibility/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/accessibility",
  useSearchParams: () => new URLSearchParams(),
}));

const UNCONFIRMED_MAILBOX_PATTERN =
  /[a-z0-9._%+-]+@offer-?hub\.(?:io|com|tech)\b|mailto:/i;

describe("no unconfirmed mailboxes are published", () => {
  it("routes COMPANY_INFO inquiries to /contact without publishing email addresses", () => {
    expect(COMPANY_INFO.name).toBe("OFFER-HUB Inc.");
    expect(COMPANY_INFO.contactPath).toBe("/contact");
    expect("emails" in COMPANY_INFO).toBe(false);
    expect(JSON.stringify(COMPANY_INFO)).not.toMatch(UNCONFIRMED_MAILBOX_PATTERN);
  });

  it("links Privacy ContactSection inquiries to /contact with zero mailto links", () => {
    const { container } = render(
      <ThemeProvider>
        <ContactSection />
      </ThemeProvider>,
    );

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/contact");
    }
    expect(container.innerHTML).not.toMatch(UNCONFIRMED_MAILBOX_PATTERN);
  });

  it("links AccessibilityPage support actions to /contact with zero mailto links", () => {
    const { container } = render(
      <ThemeProvider>
        <AccessibilityPage />
      </ThemeProvider>,
    );

    const contactLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/contact");
    expect(contactLinks.length).toBeGreaterThanOrEqual(2);
    expect(container.innerHTML).not.toMatch(UNCONFIRMED_MAILBOX_PATTERN);
  });

  it.each([
    "src/content/terms.mdx",
    "src/content/privacy.mdx",
    "docs/terms-and-conditions.md",
    "docs/accessibility.md",
    "docs/brand/guidelines.md",
    "docs/business/product-overview.md",
  ])("contains zero offerhub/offer-hub mailboxes in %s and links to /contact", (relPath) => {
    const source = fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
    expect(source).not.toMatch(UNCONFIRMED_MAILBOX_PATTERN);
    if (relPath !== "src/content/privacy.mdx") {
      expect(source).toContain("/contact");
    }
  });
});
