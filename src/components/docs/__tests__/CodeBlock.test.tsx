import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CodeBlock } from "../CodeBlock";

function mockClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
}

function renderCodeBlock(props: React.ComponentProps<typeof CodeBlock>) {
  return render(
    <ThemeProvider>
      <CodeBlock {...props} />
    </ThemeProvider>,
  );
}

describe("CodeBlock", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders code block with default language and accessible region", () => {
    renderCodeBlock({
      code: 'console.log("hello world");',
      language: "typescript",
    });

    const region = screen.getByRole("region", {
      name: /typescript code sample, scrollable horizontally/i,
    });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("tabindex", "0");
    expect(screen.getByText('console.log("hello world");')).toBeInTheDocument();
  });

  it("renders title or filename in the header", () => {
    renderCodeBlock({
      code: "const answer = 42;",
      language: "typescript",
      title: "example.ts",
    });

    expect(screen.getByText("example.ts")).toBeInTheDocument();
    expect(
      screen.getByRole("region", {
        name: /example\.ts \(typescript\) code sample, scrollable horizontally/i,
      }),
    ).toBeInTheDocument();
  });

  it("supports filename prop as an alias for title", () => {
    renderCodeBlock({
      code: "export default {}",
      language: "javascript",
      filename: "config.js",
    });

    expect(screen.getByText("config.js")).toBeInTheDocument();
  });

  it("hides header when isHeaderHidden is true", () => {
    const { container } = renderCodeBlock({
      code: "echo 'quiet'",
      language: "bash",
      isHeaderHidden: true,
    });

    const header = container.querySelector(".bg-bg-sunken");
    expect(header).toHaveClass("hidden");
  });

  it("copies code to clipboard and updates aria-live announcement", async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeTextMock);

    renderCodeBlock({
      code: "pnpm install",
      language: "bash",
    });

    const copyBtn = screen.getByRole("button", { name: /copy code/i });
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("pnpm install");
    expect(screen.getByText("Copied")).toBeInTheDocument();
    expect(screen.getByText("Code copied to clipboard")).toHaveAttribute("aria-live", "polite");

    await waitFor(
      () => {
        expect(screen.getByText("Copy")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("handles copy failure gracefully and announces failure", async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockRejectedValue(new Error("Clipboard denied"));
    mockClipboard(writeTextMock);

    renderCodeBlock({
      code: "failed copy snippet",
      language: "bash",
    });

    const copyBtn = screen.getByRole("button", { name: /copy code/i });
    await user.click(copyBtn);

    expect(screen.getByText("Failed to copy code to clipboard")).toBeInTheDocument();
  });

  it("renders line numbers when lineNumbers or showLineNumbers is true", () => {
    const multiLineCode = "line 1\nline 2\nline 3";
    const { container } = renderCodeBlock({
      code: multiLineCode,
      lineNumbers: true,
    });

    const lineElements = container.querySelectorAll("[data-line]");
    expect(lineElements.length).toBe(3);
    expect(lineElements[0]).toHaveAttribute("data-line", "1");
    expect(lineElements[1]).toHaveAttribute("data-line", "2");
    expect(lineElements[2]).toHaveAttribute("data-line", "3");
  });

  it("applies highlighted line styles for lines matching the range syntax", () => {
    const code = "first\nsecond\nthird\nfourth";
    const { container } = renderCodeBlock({
      code,
      highlight: "{2,4}",
    });

    const lines = container.querySelectorAll("span.block");
    expect(lines.length).toBe(4);
    expect(lines[1]).toHaveClass("bg-bg-sunken");
    expect(lines[1]).toHaveClass("shadow-neu-sunken-subtle");
    expect(lines[3]).toHaveClass("bg-bg-sunken");
    expect(lines[3]).toHaveClass("shadow-neu-sunken-subtle");
    expect(lines[0]).not.toHaveClass("bg-bg-sunken");
    expect(lines[2]).not.toHaveClass("bg-bg-sunken");
  });
});
