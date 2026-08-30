import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { RegistrationForm } from "../RegistrationForm";

function mockFetch(impl: () => Promise<unknown>) {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
}

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

function fillRequiredFields(container: HTMLElement) {
  const name = container.querySelector<HTMLInputElement>("#name")!;
  const email = container.querySelector<HTMLInputElement>("#email")!;
  const purpose = container.querySelector<HTMLTextAreaElement>("#purpose")!;
  const referral = container.querySelector<HTMLInputElement>("#referral")!;

  fireInput(name, "Jane Doe");
  fireInput(email, "jane@example.com");
  fireInput(purpose, "Building a marketplace");
  fireInput(referral, "Friend");
}

function fireInput(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el),
    "value"
  )!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("RegistrationForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("blocks submission and shows field errors when required fields are empty", async () => {
    render(<RegistrationForm />);

    const submitButton = screen.getByRole("button", { name: /submit application/i });
    await act(async () => {
      submitButton.click();
    });

    expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("submits to the waitlist API and shows the success state on valid submission", async () => {
    mockFetch(async () => jsonResponse(200, { ok: true }));
    const { container } = render(<RegistrationForm />);

    fillRequiredFields(container);

    const submitButton = screen.getByRole("button", { name: /submit application/i });
    await act(async () => {
      submitButton.click();
    });

    expect(fetch).toHaveBeenCalledWith("/api/waitlist", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane@example.com",
        purpose: "Building a marketplace",
        referral: "Friend",
      }),
    }));

    expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument();
  });

  it("shows a duplicate-email error and starts the cooldown on a 409 response", async () => {
    mockFetch(async () => jsonResponse(409, { error: "duplicate" }));
    const { container } = render(<RegistrationForm />);

    fillRequiredFields(container);

    const submitButton = screen.getByRole("button", { name: /submit application/i });
    await act(async () => {
      submitButton.click();
    });

    expect(await screen.findByText(/already registered on our waitlist/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /wait 30s/i })).toBeDisabled();
  });

  it("prevents resubmission while the cooldown is active", async () => {
    vi.useFakeTimers();
    mockFetch(async () => jsonResponse(500, { error: "boom" }));
    const { container } = render(<RegistrationForm />);

    fillRequiredFields(container);

    const submitButton = screen.getByRole("button", { name: /submit application/i });
    await act(async () => {
      submitButton.click();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    const cooldownButton = screen.getByRole("button", { name: /wait \d+s/i });
    expect(cooldownButton).toBeDisabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30000);
    });

    expect(screen.getByRole("button", { name: /submit application/i })).toBeEnabled();
  });
});
