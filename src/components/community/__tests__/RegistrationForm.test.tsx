import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import RegistrationForm from "../RegistrationForm";
import { submitWaitlistEntry } from "@/services/waitlist";

vi.mock("@/services/waitlist", () => ({
  submitWaitlistEntry: vi.fn(),
}));

const submitWaitlistEntryMock = vi.mocked(submitWaitlistEntry);

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
    submitWaitlistEntryMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("blocks submission via native field validation when required fields are empty", async () => {
    render(<RegistrationForm />);

    const submitButton = screen.getByRole("button", { name: /submit application/i });
    await act(async () => {
      submitButton.click();
    });

    expect(submitWaitlistEntry).not.toHaveBeenCalled();
  });

  it("submits the entry and shows the success state on valid submission", async () => {
    submitWaitlistEntryMock.mockResolvedValueOnce({ ok: true });
    const { container } = render(<RegistrationForm />);

    fillRequiredFields(container);

    const submitButton = screen.getByRole("button", { name: /submit application/i });
    await act(async () => {
      submitButton.click();
    });

    expect(submitWaitlistEntry).toHaveBeenCalledWith({
      email: "jane@example.com",
      name: "Jane Doe",
      purpose: "Building a marketplace",
      referral: "Friend",
    });

    expect(await screen.findByText(/you're on the list/i)).toBeInTheDocument();
  });

  it("shows a duplicate-email error and starts the cooldown on a duplicate result", async () => {
    submitWaitlistEntryMock.mockResolvedValueOnce({ ok: false, reason: "duplicate" });
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
    submitWaitlistEntryMock.mockResolvedValueOnce({ ok: false, reason: "error" });
    const { container } = render(<RegistrationForm />);

    fillRequiredFields(container);

    const submitButton = screen.getByRole("button", { name: /submit application/i });
    await act(async () => {
      submitButton.click();
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(submitWaitlistEntry).toHaveBeenCalledTimes(1);

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
