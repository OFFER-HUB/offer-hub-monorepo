import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PageActionsMenu } from "../PageActionsMenu";

const loggerError = vi.fn();

vi.mock("@/utils/logger", () => ({
  logger: {
    error: (...args: unknown[]) => loggerError(...args),
  },
}));

function renderMenu(markdownContent = "# Title\n\nBody copy.") {
  return render(<PageActionsMenu slug="getting-started" markdownContent={markdownContent} />);
}

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
  });

  it("does not render the menu until opened", () => {
    renderMenu();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the menu on trigger click with the expected menu items", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);

    expect(screen.getByRole("menuitem", { name: /copy page/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /view as markdown/i })).toBeInTheDocument();
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
        <PageActionsMenu slug="getting-started" markdownContent="content" />
        <button type="button">outside</button>
      </div>,
    );

    await openMenu(user);
    await user.click(screen.getByRole("button", { name: "outside" }));

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });

  it("moves focus between items with ArrowDown/ArrowUp", async () => {
    const user = userEvent.setup({ delay: null });
    renderMenu();

    await openMenu(user);

    const copyItem = screen.getByRole("menuitem", { name: /copy page/i });
    const viewItem = screen.getByRole("menuitem", { name: /view as markdown/i });

    expect(copyItem).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(viewItem).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(copyItem).toHaveFocus();
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
    await user.click(screen.getByRole("menuitem", { name: /copy page/i }));

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
    await user.click(screen.getByRole("menuitem", { name: /copy page/i }));

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
});
