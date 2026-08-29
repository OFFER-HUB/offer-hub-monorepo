import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PageActionsMenu } from "../PageActionsMenu";
import { DOCS_EDIT_BASE } from "@/constants/github";

const loggerError = vi.fn();
const exportDocMarkdown = vi.fn();
const exportDocJson = vi.fn();
const exportDocPdf = vi.fn();

vi.mock("@/utils/logger", () => ({
  logger: {
    error: (...args: unknown[]) => loggerError(...args),
  },
}));

vi.mock("@/lib/docs/export-doc-markdown", () => ({
  exportDocMarkdown: (...args: unknown[]) => exportDocMarkdown(...args),
}));

vi.mock("@/lib/docs/export-doc-json", () => ({
  exportDocJson: (...args: unknown[]) => exportDocJson(...args),
}));

vi.mock("@/lib/docs/export-doc-pdf", () => ({
  exportDocPdf: (...args: unknown[]) => exportDocPdf(...args),
}));

function renderMenu(markdownContent = "# Title\n\nBody copy.") {
  return render(
    <PageActionsMenu
      slug="getting-started"
      title="Getting Started"
      description="A getting started guide."
      markdownContent={markdownContent}
    />,
  );
}

const EXPECTED_PROMPT =
  "Read Getting Started at https://offer-hub.tech/docs/getting-started/raw and help me understand it.";

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByRole("button", { name: /copy page/i });
  await user.click(trigger);
  await waitFor(() => {
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
}

describe("PageActionsMenu", () => {
  beforeEach(() => {
    loggerError.mockClear();
    exportDocMarkdown.mockClear();
    exportDocJson.mockClear();
    exportDocPdf.mockReset();
  });

  it("does not render the menu until opened", () => {
    renderMenu();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the menu on trigger click with the expected menu items, in order", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);

    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems.map((item) => item.textContent)).toEqual([
      "Copy page",
      "View as Markdown",
      "Open in ChatGPT",
      "Open in Claude",
      "Export Markdown",
      "Export JSON",
      "Export PDF",
      "Edit on GitHub",
    ]);
  });

  it("renders exactly one divider between the copy/AI group and the export group", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);

    const menu = screen.getByRole("menu");
    const separators = screen.getAllByRole("separator");
    expect(separators).toHaveLength(1);

    const children = Array.from(menu.children);
    const separatorIndex = children.indexOf(separators[0]);
    const exportMarkdownIndex = children.findIndex((child) => child.textContent === "Export Markdown");
    const openClaudeIndex = children.findIndex((child) => child.textContent === "Open in Claude");

    expect(separatorIndex).toBeGreaterThan(openClaudeIndex);
    expect(separatorIndex).toBeLessThan(exportMarkdownIndex);
  });

  it("closes the menu on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    const trigger = screen.getByRole("button", { name: /copy page/i });
    await openMenu(user);

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it("closes the menu when clicking outside", async () => {
    const user = userEvent.setup({ delay: null });
    render(
      <div>
        <PageActionsMenu slug="getting-started" title="Getting Started" markdownContent="content" />
        <button type="button">outside</button>
      </div>,
    );

    await openMenu(user);
    await user.click(screen.getByRole("button", { name: "outside" }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("moves focus between all 8 items with ArrowDown/ArrowUp, wrapping at both ends", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);

    const orderedLabels = [
      /^copy page$/i,
      /view as markdown/i,
      /open in chatgpt/i,
      /open in claude/i,
      /export markdown/i,
      /export json/i,
      /^export pdf$/i,
      /edit on github/i,
    ];
    const orderedItems = orderedLabels.map((name) => screen.getByRole("menuitem", { name }));

    expect(orderedItems[0]).toHaveFocus();

    for (let i = 1; i < orderedItems.length; i++) {
      await user.keyboard("{ArrowDown}");
      expect(orderedItems[i]).toHaveFocus();
    }

    // wraps back to the first item
    await user.keyboard("{ArrowDown}");
    expect(orderedItems[0]).toHaveFocus();

    // wraps backward to the last item
    await user.keyboard("{ArrowUp}");
    expect(orderedItems[orderedItems.length - 1]).toHaveFocus();
  });

  it("copies the markdown content to the clipboard and shows a confirmation", async () => {
    const user = userEvent.setup({ delay: null });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderMenu("# Hello\n\nWorld.");

    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /^copy page$/i }));

    expect(writeText).toHaveBeenCalledWith("# Hello\n\nWorld.");
    await waitFor(() => {
      expect(screen.getAllByText("Copied!").length).toBeGreaterThan(0);
    });
  });

  it("logs an error when the clipboard write fails", async () => {
    const user = userEvent.setup({ delay: null });
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderMenu();

    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /^copy page$/i }));

    await waitFor(() => {
      expect(loggerError).toHaveBeenCalled();
    });
  });

  it("links View as Markdown to the raw route for the current slug", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);

    const link = screen.getByRole("menuitem", { name: /view as markdown/i });
    expect(link).toHaveAttribute("href", "/docs/getting-started/raw");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links Open in ChatGPT to a prefilled prompt referencing the page", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);

    const link = screen.getByRole("menuitem", { name: /open in chatgpt/i });
    expect(link).toHaveAttribute(
      "href",
      `https://chatgpt.com/?q=${encodeURIComponent(EXPECTED_PROMPT)}`,
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links Open in Claude to a prefilled prompt referencing the page", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);

    const link = screen.getByRole("menuitem", { name: /open in claude/i });
    expect(link).toHaveAttribute(
      "href",
      `https://claude.ai/new?q=${encodeURIComponent(EXPECTED_PROMPT)}`,
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("closes the menu when clicking Open in ChatGPT or Open in Claude", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /open in chatgpt/i }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /open in claude/i }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("exports Markdown via exportDocMarkdown and closes the menu", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu("# Hello\n\nWorld.");

    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /export markdown/i }));

    expect(exportDocMarkdown).toHaveBeenCalledWith("getting-started", "# Hello\n\nWorld.");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("exports JSON via exportDocJson and closes the menu", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /export json/i }));

    expect(exportDocJson).toHaveBeenCalledWith("getting-started", "Getting Started");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("links Edit on GitHub to the edit URL for the current slug's source file", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);

    const link = screen.getByRole("menuitem", { name: /edit on github/i });
    expect(link).toHaveAttribute("href", `${DOCS_EDIT_BASE}/content/docs/getting-started.mdx`);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("closes the menu when clicking Edit on GitHub", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: /edit on github/i }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  describe("Export PDF", () => {
    it("shows a busy state while pending, keeps the menu open, and calls exportDocPdf with the doc's details", async () => {
      const user = userEvent.setup({ delay: null });
      let resolveExport: () => void = () => {};
      exportDocPdf.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveExport = resolve;
          }),
      );

      renderMenu();

      await openMenu(user);
      await user.click(screen.getByRole("menuitem", { name: /export pdf/i }));

      expect(exportDocPdf).toHaveBeenCalledWith({
        slug: "getting-started",
        title: "Getting Started",
        description: "A getting started guide.",
      });

      const busyItem = await screen.findByRole("menuitem", { name: /exporting pdf/i });
      expect(busyItem).toHaveAttribute("aria-busy", "true");
      // the menu must stay open while the export is in flight
      expect(screen.getByRole("menu")).toBeInTheDocument();

      resolveExport();

      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    it("logs an error and clears the busy state when the export fails", async () => {
      const user = userEvent.setup({ delay: null });
      exportDocPdf.mockRejectedValue(new Error("export failed"));

      renderMenu();

      await openMenu(user);
      await user.click(screen.getByRole("menuitem", { name: /export pdf/i }));

      await waitFor(() => {
        expect(loggerError).toHaveBeenCalledWith("PDF export failed", expect.any(Error));
      });
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });

    it("ignores repeat clicks while an export is already in flight", async () => {
      const user = userEvent.setup({ delay: null });
      let resolveExport: () => void = () => {};
      exportDocPdf.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveExport = resolve;
          }),
      );

      renderMenu();

      await openMenu(user);
      const pdfItem = screen.getByRole("menuitem", { name: /export pdf/i });
      await user.click(pdfItem);
      await user.click(screen.getByRole("menuitem", { name: /exporting pdf/i }));

      expect(exportDocPdf).toHaveBeenCalledTimes(1);

      resolveExport();
      await waitFor(() => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      });
    });
  });
});
