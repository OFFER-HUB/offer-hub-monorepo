import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CODE_TAB_STORAGE_KEY } from "@/constants/storage";
import { CodeTabs, type CodeTabItem } from "../CodeTabs";

const TABS: CodeTabItem[] = [
  {
    id: "curl",
    label: "cURL",
    language: "bash",
    code: "curl -X POST http://localhost:4000/api/v1/users",
  },
  {
    id: "typescript",
    label: "TypeScript",
    language: "typescript",
    code: 'const user = await sdk.users.create({ externalUserId: "your-user-123" });',
  },
];

function renderTabs() {
  return render(
    <ThemeProvider>
      <CodeTabs label="Sample code" tabs={TABS} />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("CodeTabs", () => {
  it("renders WAI-ARIA tabs with deterministic selection and panel associations", () => {
    renderTabs();

    const tablist = screen.getByRole("tablist", { name: "Sample code" });
    expect(tablist).toHaveAttribute("aria-orientation", "horizontal");

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["cURL", "TypeScript"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");

    const panel = screen.getByRole("tabpanel");
    expect(tabs[0]).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tabs[0].id);
  });

  it("moves selection, focus, and roving tabindex with arrows, Home, and End", async () => {
    const user = userEvent.setup();
    renderTabs();

    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();

    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("tabindex", "0");
    expect(tabs[0]).toHaveAttribute("tabindex", "-1");
    expect(tabs[1]).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveFocus();

    await user.keyboard("{End}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveFocus();

    await user.keyboard("{Home}");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveFocus();
  });

  it("persists and restores the selected language", async () => {
    const user = userEvent.setup();
    const { unmount } = renderTabs();

    await user.click(screen.getAllByRole("tab")[1]);
    expect(window.localStorage.getItem(CODE_TAB_STORAGE_KEY)).toBe("TypeScript");

    unmount();
    renderTabs();
    await waitFor(() => {
      expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
    });
  });

  it("synchronizes matching labels across instances without stealing focus", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <CodeTabs label="Group A" tabs={TABS} />
        <CodeTabs label="Group B" tabs={TABS} />
      </ThemeProvider>,
    );

    const tabs = screen.getAllByRole("tab");
    await user.click(tabs[1]);
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[3]).toHaveAttribute("aria-selected", "true");

    tabs[0].focus();
    window.dispatchEvent(new CustomEvent("offer-hub-code-tab-change", { detail: "TypeScript" }));
    expect(tabs[0]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowRight}");
    expect(tabs[1]).toHaveFocus();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[3]).toHaveAttribute("aria-selected", "true");
  });

  it("copies the active panel's code", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderTabs();

    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenLastCalledWith(TABS[0].code);

    await user.click(screen.getAllByRole("tab")[1]);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenLastCalledWith(TABS[1].code);
  });
});
