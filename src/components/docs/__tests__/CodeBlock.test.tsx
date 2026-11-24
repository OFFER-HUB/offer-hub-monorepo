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

    const header = container.querySelector(".rounded-t-2xl");
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

  it("renders tabs in a single header and copies the selected tab's code", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);

    renderCodeBlock({
      label: "Request examples",
      tabs: [
        { id: "curl", label: "cURL", language: "bash", code: "curl https://api.example.com" },
        { id: "ts", label: "TypeScript", language: "typescript", code: "await sdk.users.list()" },
      ],
    });

    expect(screen.getByRole("tablist", { name: "Request examples" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "cURL" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("curl https://api.example.com");

    await user.click(screen.getByRole("tab", { name: "TypeScript" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("await sdk.users.list()");

    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenCalledWith("await sdk.users.list()");
    expect(screen.getByText("Copied")).toBeInTheDocument();
    expect(screen.getByText("Code copied to clipboard")).toHaveAttribute("aria-live", "polite");
  });

  it("supports roving keyboard selection inside CodeBlock tabs", async () => {
    const user = userEvent.setup();
    renderCodeBlock({
      tabs: [
        { id: "curl", label: "cURL", language: "bash", code: "curl example" },
        { id: "ts", label: "TypeScript", language: "typescript", code: "sdk example" },
      ],
    });

    const tabs = screen.getAllByRole("tab");
    tabs[0]!.focus();
    await user.keyboard("{ArrowRight}");

    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("sdk example");
  });

  it("renders terminal mode with a prompt and copies the prompt-free command", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);

    renderCodeBlock({
      code: "npm run build",
      copyText: "npm run build",
      terminal: true,
      title: "Terminal 1",
    });

    expect(screen.getByText("Terminal 1")).toBeInTheDocument();
    expect(screen.getByText("$ npm run build")).toBeInTheDocument();
    expect(
      screen.getByRole("region", {
        name: /terminal 1 \(bash\) code sample, scrollable horizontally/i,
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenCalledWith("npm run build");
  });
});
