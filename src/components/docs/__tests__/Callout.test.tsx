import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Callout, type CalloutTone } from "../Callout";

const TONES: Array<[CalloutTone, string, string, string]> = [
  ["note", "Note", "bg-[var(--color-callout-note-bg)]", "text-theme-primary"],
  ["tip", "Tip", "bg-[var(--color-callout-tip-bg)]", "text-theme-success"],
  ["warning", "Warning", "bg-[var(--color-callout-warning-bg)]", "text-theme-warning"],
  ["danger", "Danger", "bg-[var(--color-callout-danger-bg)]", "text-theme-error"],
];

describe("Callout", () => {
  it.each(TONES)(
    "renders the %s tone with theme tokens and its default label",
    (tone, label, background, accent) => {
      const { container } = render(<Callout tone={tone}>Body copy</Callout>);

      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText("Body copy")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass(background, "rounded-2xl");
      expect(container.firstChild?.firstChild).toHaveClass(accent);
      expect(container.firstChild).toHaveAttribute("role", "note");
    },
  );

  it("supports the MDX type alias, custom label and alert role", () => {
    const { container } = render(
      <Callout type="danger" role="alert" label="Submission error">
        Request failed
      </Callout>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Submission error");
    expect(screen.getByText("Request failed")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("bg-[var(--color-callout-danger-bg)]");
  });

  it("does not emit Tailwind palette colors or dark overrides", () => {
    const { container } = render(
      <Callout tone="warning">Please wait before retrying</Callout>,
    );

    expect(container.innerHTML).not.toMatch(/red-\d+|amber-\d+|dark:/);
  });
});
