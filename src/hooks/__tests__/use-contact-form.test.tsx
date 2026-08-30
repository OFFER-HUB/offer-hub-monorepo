import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ContactResult } from "@/services/contact";

const submitContactInquiry = vi.hoisted(() => vi.fn());
vi.mock("@/services/contact", () => ({ submitContactInquiry }));

import { useContactForm, type ContactFormData } from "../use-contact-form";

const VALID: ContactFormData = {
  company: "Acme Inc",
  name: "Jane Doe",
  email: "jane@acme.com",
  message: "Enterprise pricing please.",
};

/** Mimics a controlled input firing onChange. */
function change(
  result: { current: ReturnType<typeof useContactForm> },
  name: keyof ContactFormData,
  value: string,
) {
  act(() => {
    result.current.handleInputChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLInputElement>);
  });
}

function fill(
  result: { current: ReturnType<typeof useContactForm> },
  data: Partial<ContactFormData>,
) {
  for (const [name, value] of Object.entries(data)) {
    change(result, name as keyof ContactFormData, value);
  }
}

async function submit(result: {
  current: ReturnType<typeof useContactForm>;
}) {
  await act(async () => {
    await result.current.handleSubmit({
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent);
  });
}

beforeEach(() => {
  submitContactInquiry.mockReset().mockResolvedValue({ ok: true });
});

describe("useContactForm", () => {
  it("starts with an empty form and no errors", () => {
    const { result } = renderHook(() => useContactForm());

    expect(result.current.formData).toEqual({
      company: "",
      name: "",
      email: "",
      message: "",
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.submitError).toBeNull();
  });

  it("tracks input changes by field name", () => {
    const { result } = renderHook(() => useContactForm());

    change(result, "company", "Acme Inc");

    expect(result.current.formData.company).toBe("Acme Inc");
  });

  it("prevents the default form submission", async () => {
    const { result } = renderHook(() => useContactForm());
    const preventDefault = vi.fn();

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it("blocks submission and flags every required field when the form is empty", async () => {
    const { result } = renderHook(() => useContactForm());

    await submit(result);

    expect(result.current.errors).toEqual({
      company: "Company name is required",
      name: "Contact name is required",
      email: "Work email is required",
    });
    expect(submitContactInquiry).not.toHaveBeenCalled();
  });

  it("treats whitespace-only values as missing", async () => {
    const { result } = renderHook(() => useContactForm());
    fill(result, { company: "   ", name: "  ", email: "  " });

    await submit(result);

    expect(result.current.errors.company).toBe("Company name is required");
    expect(submitContactInquiry).not.toHaveBeenCalled();
  });

  it("does not require the message field", async () => {
    const { result } = renderHook(() => useContactForm());
    fill(result, { ...VALID, message: "" });

    await submit(result);

    expect(result.current.errors.message).toBeUndefined();
    expect(submitContactInquiry).toHaveBeenCalled();
  });

  it.each(["not-an-email", "jane@acme", "jane acme.com", "@acme.com", "a@@b.co", "a@b@c.co"])(
    "rejects %j as a work email",
    async (email) => {
      const { result } = renderHook(() => useContactForm());
      fill(result, { ...VALID, email });

      await submit(result);

      expect(result.current.errors.email).toBe("Enter a valid work email");
      expect(submitContactInquiry).not.toHaveBeenCalled();
    },
  );

  it("clears a field error as soon as the user edits that field", async () => {
    const { result } = renderHook(() => useContactForm());
    await submit(result);
    expect(result.current.errors.company).toBeDefined();

    change(result, "company", "Acme Inc");

    expect(result.current.errors.company).toBeUndefined();
    expect(result.current.errors.name).toBeDefined();
  });

  it("submits the four fields and shows the success state", async () => {
    const { result } = renderHook(() => useContactForm());
    fill(result, VALID);

    await submit(result);

    expect(submitContactInquiry).toHaveBeenCalledWith(VALID);
    expect(result.current.isSubmitted).toBe(true);
    expect(result.current.submitError).toBeNull();
  });

  it.each<[ContactResult, string]>([
    [
      { ok: false, reason: "not_configured" },
      "Contact is not configured. Please try again later.",
    ],
    [
      { ok: false, reason: "error" },
      "Something went wrong. Please try again.",
    ],
    [
      { ok: false, reason: "network" },
      "Network error. Please check your connection and try again.",
    ],
  ])("maps %j to a user-facing message", async (serviceResult, message) => {
    submitContactInquiry.mockResolvedValue(serviceResult);
    const { result } = renderHook(() => useContactForm());
    fill(result, VALID);

    await submit(result);

    expect(result.current.submitError).toBe(message);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("applies server-side field errors when the response reports validation failures", async () => {
    submitContactInquiry.mockResolvedValue({
      ok: false,
      reason: "validation",
      errors: { email: "Enter a valid work email" },
    });
    const { result } = renderHook(() => useContactForm());
    fill(result, VALID);

    await submit(result);

    expect(result.current.errors.email).toBe("Enter a valid work email");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.submitError).toBeNull();
  });

  it("clears a previous submit error when the user edits any field", async () => {
    submitContactInquiry.mockResolvedValue({ ok: false, reason: "error" });
    const { result } = renderHook(() => useContactForm());
    fill(result, VALID);
    await submit(result);
    expect(result.current.submitError).not.toBeNull();

    change(result, "message", "Following up.");

    expect(result.current.submitError).toBeNull();
  });

  it("allows a retry after a failure", async () => {
    submitContactInquiry.mockResolvedValueOnce({ ok: false, reason: "network" });
    const { result } = renderHook(() => useContactForm());
    fill(result, VALID);

    await submit(result);
    expect(result.current.isSubmitted).toBe(false);

    submitContactInquiry.mockResolvedValueOnce({ ok: true });
    await submit(result);

    expect(result.current.isSubmitted).toBe(true);
    expect(submitContactInquiry).toHaveBeenCalledTimes(2);
  });
});
