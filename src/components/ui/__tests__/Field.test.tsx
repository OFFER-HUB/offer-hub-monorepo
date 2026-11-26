import { describe, it, expect, vi } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "../Field";

function box(control: HTMLElement) {
  return control.parentElement as HTMLElement;
}

describe("Field", () => {
  it("renders an input with its label above, linked by htmlFor", () => {
    render(<Field label="Email address" type="email" />);

    const input = screen.getByLabelText("Email address");
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("type", "email");
  });

  it("uses the sunken 4/8 box, rounded-xl, ≥ 44px and a focus ring", () => {
    render(<Field label="Name" />);

    const input = screen.getByLabelText("Name");
    expect(input).toHaveClass("min-h-11");
    expect(box(input)).toHaveClass(
      "shadow-neu-sunken",
      "rounded-xl",
      "min-h-11",
      "focus-within:ring-2",
      "focus-within:ring-theme-primary",
    );
  });

  it.each([
    ["textarea", "TEXTAREA"],
    ["select", "SELECT"],
  ] as const)("renders the %s variant", (as, tagName) => {
    render(
      as === "select" ? (
        <Field as="select" label="Currency" defaultValue="usdc">
          <option value="usdc">USDC</option>
        </Field>
      ) : (
        <Field as="textarea" label="Message" />
      ),
    );

    const control = screen.getByLabelText(as === "select" ? "Currency" : "Message");
    expect(control.tagName).toBe(tagName);
    expect(box(control)).toHaveClass("shadow-neu-sunken", "min-h-11");
  });

  it("exposes the error through aria-invalid and aria-describedby, in theme-error", () => {
    render(<Field id="email" label="Email" error="Enter a valid email" />);

    const input = screen.getByLabelText("Email");
    const error = screen.getByRole("alert");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
    expect(error).toHaveTextContent("Enter a valid email");
    expect(error).toHaveClass("text-theme-error");
    expect(box(input)).toHaveClass("ring-theme-error");
  });

  it("links the hint and keeps a caller's aria-describedby", () => {
    render(<Field id="key" label="Key" hint="Sent as a header" aria-describedby="external" />);

    const describedBy = screen.getByLabelText("Key").getAttribute("aria-describedby") ?? "";
    expect(describedBy.split(" ")).toEqual(["external", "key-hint"]);
    expect(screen.getByText("Sent as a header")).toHaveAttribute("id", "key-hint");
  });

  it("has no aria-invalid or describedby when there is nothing to describe", () => {
    render(<Field label="Plain" />);

    const input = screen.getByLabelText("Plain");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("keeps a visually hidden label for icon-only search boxes", () => {
    render(<Field label="Search endpoints" hideLabel leadingIcon={<svg />} />);

    expect(screen.getByLabelText("Search endpoints")).toBeInTheDocument();
    expect(screen.getByText("Search endpoints")).toHaveClass("sr-only");
  });

  it("renders the trailing element inside the box", async () => {
    const onClick = vi.fn();
    render(
      <Field
        label="Idempotency key"
        trailing={
          <button type="button" onClick={onClick}>
            Generate
          </button>
        }
      />,
    );

    const input = screen.getByLabelText("Idempotency key");
    const button = screen.getByRole("button", { name: "Generate" });
    expect(box(input)).toContainElement(button);
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it.each([
    [10, "text-content-secondary"],
    [85, "text-theme-warning"],
    [97, "text-theme-error"],
  ])("colors the counter with theme tokens at %i/100", (length, expected) => {
    render(
      <Field label="Bio" maxLength={100} showCount value={"a".repeat(length)} onChange={() => {}} />,
    );

    expect(screen.getByText(`${length}/100`)).toHaveClass(expected);
  });

  it("forwards the ref to the control", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Field label="Ref" ref={ref} />);

    expect(ref.current).toBe(screen.getByLabelText("Ref"));
  });

  it("passes native props through", async () => {
    const onChange = vi.fn();
    render(<Field label="Token" name="token" required disabled={false} onChange={onChange} />);

    const input = screen.getByLabelText("Token");
    expect(input).toHaveAttribute("name", "token");
    expect(input).toBeRequired();
    await userEvent.type(input, "ab");
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
