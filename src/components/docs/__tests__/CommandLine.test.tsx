import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CommandLine } from "../CommandLine";

function mockClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
}

describe("CommandLine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders command line with default prompt and accessible region", () => {
    render(<CommandLine command="git status" />);

    const region = screen.getByRole("region", {
      name: /command line, scrollable horizontally/i,
    });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("git status")).toBeInTheDocument();
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("renders custom title or label in header", () => {
    const { rerender } = render(<CommandLine command="npm start" title="Terminal 1" />);
    expect(screen.getByText("Terminal 1")).toBeInTheDocument();

    rerender(<CommandLine command="npm start" label="Build Command" />);
    expect(screen.getByText("Build Command")).toBeInTheDocument();
  });

  it("extracts text from nested children when command prop is not provided", () => {
    render(
      <CommandLine>
        curl -X GET <span>https://api.example.com</span>
      </CommandLine>,
    );

    expect(screen.getByText("curl -X GET https://api.example.com")).toBeInTheDocument();
  });

  it("copies command to clipboard and announces via polite live region", async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeTextMock);

    render(<CommandLine command="npm run build" />);

    const copyBtn = screen.getByRole("button", { name: /copy command/i });
    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith("npm run build");
    expect(screen.getByText("Command copied to clipboard")).toHaveAttribute("aria-live", "polite");

    await waitFor(
      () => {
        expect(screen.getByText("Copy")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("handles clipboard failure gracefully and announces failure", async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockRejectedValue(new Error("Permission denied"));
    mockClipboard(writeTextMock);

    render(<CommandLine command="failed-command" />);

    const copyBtn = screen.getByRole("button", { name: /copy command/i });
    await user.click(copyBtn);

    expect(screen.getByText("Failed to copy command to clipboard")).toBeInTheDocument();
  });
});
