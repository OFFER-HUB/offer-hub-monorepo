import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocsSearchBar from "../DocsSearchBar";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/data/docs-index.json", () => ({
  default: [
    {
      id: "getting-started",
      title: "Getting Started",
      section: "Guides",
      content: "How to install and configure OFFER-HUB.",
      link: "/docs/getting-started",
    },
    {
      id: "authentication",
      title: "Authentication",
      section: "API Reference",
      content: "Authenticate requests using API keys.",
      link: "/docs/authentication",
    },
    {
      id: "escrow",
      title: "Escrow Payments",
      section: "Guides",
      content: "Understand how escrow payments work.",
      link: "/docs/escrow",
    },
  ],
}));

async function typeQuery(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByRole("combobox", { name: /documentation search/i });
  await user.type(input, text);
  return input;
}

describe("DocsSearchBar", () => {
  beforeEach(() => {
    push.mockClear();
  });

  it("does not show results for an empty query", () => {
    render(<DocsSearchBar />);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters results that partially match the query", async () => {
    const user = userEvent.setup();
    render(<DocsSearchBar />);

    await typeQuery(user, "escrow");

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    expect(screen.getByRole("option", { name: /escrow payments/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /authentication/i })).not.toBeInTheDocument();
  });

  it("shows a no-results message when nothing matches", async () => {
    const user = userEvent.setup();
    render(<DocsSearchBar />);

    await typeQuery(user, "zzzznotfound");

    await waitFor(() => {
      expect(screen.getAllByText(/no results found/i).length).toBeGreaterThan(0);
    });
  });

  it("moves the active option on ArrowDown/ArrowUp without wrapping past the bounds", async () => {
    const user = userEvent.setup();
    render(<DocsSearchBar />);

    const input = await typeQuery(user, "guide");

    await waitFor(() => {
      expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
    });

    await user.keyboard("{ArrowDown}");
    let options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowUp}");
    options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("navigates to the active result's link on Enter", async () => {
    const user = userEvent.setup();
    render(<DocsSearchBar />);

    await typeQuery(user, "escrow");

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /escrow payments/i })).toBeInTheDocument();
    });

    await user.keyboard("{ArrowDown}{Enter}");

    expect(push).toHaveBeenCalledWith("/docs/escrow");
  });
});
