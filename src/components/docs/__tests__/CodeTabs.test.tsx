import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CODE_TAB_STORAGE_KEY } from "@/constants/storage";
import { CodeTabs, CodeTab } from "../CodeTabs";

const BASH_CODE = `curl -X POST http://localhost:4000/api/v1/users \\`;
const TS_CODE = `const user = await sdk.users.create({ externalUserId: "your-user-123" });`;

/**
 * Mirrors the shape produced by the docs `pre` override in mdx-components.tsx:
 * the element passed as `children` of a fence is <code className="language-x">.
 */
function PreOverride({ children }: { children?: ReactNode }) {
  return <pre>{children}</pre>;
}

function CodeElement({ className, children }: { className?: string; children?: string }) {
  return <code className={className}>{children}</code>;
}

function fence(language: string, code: string): ReactNode {
  return (
    <PreOverride>
      <CodeElement className={`language-${language}`}>{code}</CodeElement>
    </PreOverride>
  );
}

function renderTabs() {
  return render(
    <ThemeProvider>
      <CodeTabs label="Sample code">
        <CodeTab label="cURL" language="bash">
          {fence("bash", BASH_CODE)}
        </CodeTab>
        <CodeTab label="TypeScript" language="typescript">
          {fence("typescript", TS_CODE)}
        </CodeTab>
      </CodeTabs>
    </ThemeProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("CodeTabs", () => {
  it("renders a WAI-ARIA tablist with the first tab selected", () => {
    renderTabs();

    const tablist = screen.getByRole("tablist", { name: "Sample code" });
    expect(tablist).toHaveAttribute("aria-orientation", "horizontal");

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["cURL", "TypeScript"]);

    // Roving tabindex: only the selected tab is in the tab order.
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");

    // Active panel is exposed and wired to its tab both ways.
    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("data-label", "cURL");
    expect(tabs[0]).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tabs[0].id);
  });

  it("selects panels with arrow keys and Home/End, moving focus along", async () => {
    const user = userEvent.setup();
    renderTabs();

    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("tab")[1]).toHaveFocus();

    // Wraps around at the end.
    await user.keyboard("{ArrowRight}");
    expect(screen.getAllByRole("tab")[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("tab")[0]).toHaveFocus();

    await user.keyboard("{End}");
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{Home}");
    expect(screen.getAllByRole("tab")[0]).toHaveAttribute("aria-selected", "true");

    // ArrowLeft wraps backwards too.
    await user.keyboard("{ArrowLeft}");
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
  });

  it("persists the selected label in localStorage and restores it on mount", async () => {
    const user = userEvent.setup();
    const { unmount } = renderTabs();

    await user.click(screen.getAllByRole("tab")[1]);
    expect(window.localStorage.getItem(CODE_TAB_STORAGE_KEY)).toBe("TypeScript");

    unmount();
    renderTabs();
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("data-label", "TypeScript");
  });

  it("keeps every CodeTabs instance on the page on the same label", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <CodeTabs label="Group A">
          <CodeTab label="cURL" language="bash">
            {fence("bash", BASH_CODE)}
          </CodeTab>
          <CodeTab label="TypeScript" language="typescript">
            {fence("typescript", TS_CODE)}
          </CodeTab>
        </CodeTabs>
        <CodeTabs label="Group B">
          <CodeTab label="cURL" language="bash">
            {fence("bash", BASH_CODE)}
          </CodeTab>
          <CodeTab label="TypeScript" language="typescript">
            {fence("typescript", TS_CODE)}
          </CodeTab>
        </CodeTabs>
      </ThemeProvider>,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(4);

    await user.click(tabs[1]); // Group A → TypeScript

    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("tab")[3]).toHaveAttribute("aria-selected", "true");
  });

  it("copies only the selected panel's code", async () => {
    const user = userEvent.setup();
    // user-event stubs the clipboard in setup(), so install our spy afterwards.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderTabs();

    const copyButton = screen.getByRole("button", { name: "Copy cURL code" });
    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(BASH_CODE);

    // Switching panels swaps which code the copy button targets.
    await user.click(screen.getAllByRole("tab")[1]);
    const nextCopyButton = screen.getByRole("button", { name: "Copy TypeScript code" });
    await user.click(nextCopyButton);

    expect(writeText).toHaveBeenCalledTimes(2);
    expect(writeText).toHaveBeenLastCalledWith(TS_CODE);
  });

  it("renders exactly one panel and one copy control at a time", () => {
    renderTabs();

    // Inactive panels are display:none, so the a11y tree exposes only one.
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect(screen.queryAllByRole("button", { name: /copy .* code/i })).toHaveLength(1);
  });

  it("detects code in RSC-resolved CodeBlock-shaped children (identity-less type)", async () => {
    // Regression: at runtime the `pre` override is executed server-side, so
    // CodeTab receives an already-converted CodeBlock element whose decoded
    // type does not keep function identity — detection must match the props
    // shape instead (language + string children).
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    function ResolvedBlockLike({
      language,
      children,
    }: {
      language?: string;
      children?: string;
    }) {
      return <code data-lang={language}>{children}</code>;
    }

    render(
      <ThemeProvider>
        <CodeTabs label="Sample code">
          {/* The RSC children boundary hands CodeTab an *array* of resolved children. */}
          <CodeTab label="cURL" language="bash">
            {[<ResolvedBlockLike key="bash" language="bash">{BASH_CODE}</ResolvedBlockLike>]}
          </CodeTab>
          <CodeTab label="TypeScript" language="typescript">
            {[<ResolvedBlockLike key="ts" language="typescript">{TS_CODE}</ResolvedBlockLike>]}
          </CodeTab>
        </CodeTabs>
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Copy cURL code" }));
    expect(writeText).toHaveBeenCalledWith(BASH_CODE);

    // The panel renders a headerless CodeBlock (flatten classes, not the
    // raw fallback padding) instead of the resolved child.
    const panel = screen.getByRole("tabpanel");
    expect(panel.className).toContain("[&>div]:my-0");
    expect(panel.className).not.toContain("p-6");
  });
});
