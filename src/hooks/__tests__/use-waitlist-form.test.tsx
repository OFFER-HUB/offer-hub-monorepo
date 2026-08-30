import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { WaitlistResult } from "@/services/waitlist";

const submitWaitlistEntry = vi.hoisted(() => vi.fn());
vi.mock("@/services/waitlist", () => ({ submitWaitlistEntry }));

import { useWaitlistForm, type WaitlistFormData } from "../use-waitlist-form";

const SITE_KEY = "0x4AAAAAAA-test-site-key";

const VALID: WaitlistFormData = {
  name: "Jane Doe",
  email: "jane@acme.com",
  purpose: "Marketplace payouts",
  referral: "Twitter",
};

type Hook = ReturnType<typeof useWaitlistForm>;

function change(
  result: { current: Hook },
  name: keyof WaitlistFormData,
  value: string,
) {
  act(() => {
    result.current.handleInputChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLInputElement>);
  });
}

function fill(result: { current: Hook }, data: WaitlistFormData) {
  for (const [name, value] of Object.entries(data)) {
    change(result, name as keyof WaitlistFormData, value);
  }
}

async function submit(result: { current: Hook }) {
  await act(async () => {
    await result.current.handleSubmit({
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent);
  });
}

beforeEach(() => {
  submitWaitlistEntry.mockReset().mockResolvedValue({ ok: true });
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  delete window.turnstile;
});

describe("useWaitlistForm", () => {
  it("starts empty, idle and submittable", () => {
    const { result } = renderHook(() => useWaitlistForm());

    expect(result.current.formData).toEqual({
      name: "",
      email: "",
      purpose: "",
      referral: "",
    });
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.cooldownSeconds).toBe(0);
    expect(result.current.canSubmit).toBe(true);
  });

  it("blocks submission when required fields are empty", async () => {
    const { result } = renderHook(() => useWaitlistForm());

    await submit(result);

    expect(result.current.errors.name).toBeDefined();
    expect(submitWaitlistEntry).not.toHaveBeenCalled();
  });

  it.each(["a@@b.co", "a@b@c.co"])(
    "rejects %s before calling the service",
    async (email) => {
      const { result } = renderHook(() => useWaitlistForm());
      fill(result, { ...VALID, email });

      await submit(result);

      expect(result.current.errors.email).toBeDefined();
      expect(submitWaitlistEntry).not.toHaveBeenCalled();
    },
  );

  it("tracks input changes by field name", () => {
    const { result } = renderHook(() => useWaitlistForm());

    change(result, "email", "jane@acme.com");

    expect(result.current.formData.email).toBe("jane@acme.com");
  });

  it("submits the whole form object and shows the success state", async () => {
    const { result } = renderHook(() => useWaitlistForm());
    fill(result, VALID);

    await submit(result);

    expect(submitWaitlistEntry).toHaveBeenCalledWith(VALID);
    expect(result.current.isSubmitted).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("prevents the default form submission", async () => {
    const { result } = renderHook(() => useWaitlistForm());
    const preventDefault = vi.fn();

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it.each<[WaitlistResult, string]>([
    [
      { ok: false, reason: "duplicate" },
      "This email is already registered on our waitlist.",
    ],
    [
      { ok: false, reason: "not_configured" },
      "Waitlist is not configured yet. Please try again later.",
    ],
    [{ ok: false, reason: "error" }, "Something went wrong. Please try again."],
    [
      { ok: false, reason: "network" },
      "Network error. Please check your connection and try again.",
    ],
  ])("maps %j to a user-facing message", async (serviceResult, message) => {
    submitWaitlistEntry.mockResolvedValue(serviceResult);
    const { result } = renderHook(() => useWaitlistForm());
    fill(result, VALID);

    await submit(result);

    expect(result.current.error).toBe(message);
    expect(result.current.isSubmitted).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("clears the error as soon as the user edits a field", async () => {
    submitWaitlistEntry.mockResolvedValue({ ok: false, reason: "error" });
    const { result } = renderHook(() => useWaitlistForm());
    fill(result, VALID);
    await submit(result);
    expect(result.current.error).not.toBeNull();

    change(result, "email", "jane@acme.com");

    expect(result.current.error).toBeNull();
  });

  it("applies server-side field errors when the response reports a validation failure", async () => {
    submitWaitlistEntry.mockResolvedValue({
      ok: false,
      reason: "validation",
      errors: { email: "Enter a valid work email" },
    });
    const { result } = renderHook(() => useWaitlistForm());
    fill(result, VALID);

    await submit(result);

    expect(result.current.errors.email).toBe("Enter a valid work email");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe("useWaitlistForm cooldown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    submitWaitlistEntry.mockResolvedValue({ ok: false, reason: "error" });
  });

  it("starts a 30 second cooldown after a failed submission", async () => {
    const { result } = renderHook(() => useWaitlistForm());
    fill(result, VALID);

    await submit(result);

    expect(result.current.cooldownSeconds).toBe(30);
    expect(result.current.canSubmit).toBe(false);
  });

  it("counts the cooldown down once per second", async () => {
    const { result } = renderHook(() => useWaitlistForm());
    fill(result, VALID);
    await submit(result);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.cooldownSeconds).toBe(27);
  });

  it("clears the cooldown and becomes submittable again after 30 seconds", async () => {
    const { result } = renderHook(() => useWaitlistForm());
    fill(result, VALID);
    await submit(result);

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.cooldownSeconds).toBe(0);
    expect(result.current.canSubmit).toBe(true);
  });

  it("ignores a submission attempted during the cooldown", async () => {
    const { result } = renderHook(() => useWaitlistForm());
    fill(result, VALID);
    await submit(result);
    expect(submitWaitlistEntry).toHaveBeenCalledTimes(1);

    await submit(result);

    expect(submitWaitlistEntry).toHaveBeenCalledTimes(1);
  });

  it("does not start a cooldown after a successful submission", async () => {
    submitWaitlistEntry.mockResolvedValue({ ok: true });
    const { result } = renderHook(() => useWaitlistForm());
    fill(result, VALID);

    await submit(result);

    expect(result.current.cooldownSeconds).toBe(0);
  });

  it("clears its interval on unmount", async () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { result, unmount } = renderHook(() => useWaitlistForm());
    fill(result, VALID);
    await submit(result);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

describe("useWaitlistForm with Turnstile configured", () => {
  const render$ = vi.fn<(...args: unknown[]) => string>(() => "widget-1");
  const reset = vi.fn();

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", SITE_KEY);
    render$.mockClear();
    reset.mockClear();
    window.turnstile = { render: render$, reset };
  });

  it("reports the captcha as configured and blocks submission until solved", () => {
    const { result } = renderHook(() => useWaitlistForm());

    expect(result.current.isTurnstileConfigured).toBe(true);
    expect(result.current.canSubmit).toBe(false);
  });

  it("refuses to submit without a token and asks for the captcha", async () => {
    const { result } = renderHook(() => useWaitlistForm());

    await submit(result);

    expect(submitWaitlistEntry).not.toHaveBeenCalled();
    expect(result.current.error).toBe(
      "Please complete the CAPTCHA verification.",
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("renders the widget into the container ref with the site key", () => {
    const { result } = renderHook(() => useWaitlistForm());
    const container = document.createElement("div");
    Object.assign(result.current.turnstileContainerRef, { current: container });

    act(() => result.current.renderTurnstile());

    expect(render$).toHaveBeenCalledWith(
      container,
      expect.objectContaining({ sitekey: SITE_KEY }),
    );
  });

  it("does not render a second widget on a repeat call", () => {
    const { result } = renderHook(() => useWaitlistForm());
    Object.assign(result.current.turnstileContainerRef, {
      current: document.createElement("div"),
    });

    act(() => result.current.renderTurnstile());
    act(() => result.current.renderTurnstile());

    expect(render$).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the Turnstile script has not loaded", () => {
    delete window.turnstile;
    const { result } = renderHook(() => useWaitlistForm());
    Object.assign(result.current.turnstileContainerRef, {
      current: document.createElement("div"),
    });

    expect(() => act(() => result.current.renderTurnstile())).not.toThrow();
    expect(render$).not.toHaveBeenCalled();
  });

  it("becomes submittable once the captcha callback delivers a token", () => {
    const { result } = renderHook(() => useWaitlistForm());
    Object.assign(result.current.turnstileContainerRef, {
      current: document.createElement("div"),
    });
    act(() => result.current.renderTurnstile());

    const options = render$.mock.calls[0][1] as unknown as {
      callback: (token: string) => void;
    };
    act(() => options.callback("token-abc"));

    expect(result.current.canSubmit).toBe(true);
  });

  it.each(["expired-callback", "error-callback"])(
    "blocks submission again when Turnstile fires %s",
    (event) => {
      const { result } = renderHook(() => useWaitlistForm());
      Object.assign(result.current.turnstileContainerRef, {
        current: document.createElement("div"),
      });
      act(() => result.current.renderTurnstile());

      const options = render$.mock.calls[0][1] as unknown as Record<
        string,
        (token?: string) => void
      >;
      act(() => options.callback("token-abc"));
      expect(result.current.canSubmit).toBe(true);

      act(() => options[event]());

      expect(result.current.canSubmit).toBe(false);
    },
  );

  it("submits with a token and resets the widget after a failure", async () => {
    submitWaitlistEntry.mockResolvedValue({ ok: false, reason: "error" });
    const { result } = renderHook(() => useWaitlistForm());
    Object.assign(result.current.turnstileContainerRef, {
      current: document.createElement("div"),
    });
    act(() => result.current.renderTurnstile());
    const options = render$.mock.calls[0][1] as unknown as {
      callback: (token: string) => void;
    };
    act(() => options.callback("token-abc"));
    fill(result, VALID);

    await submit(result);

    expect(submitWaitlistEntry).toHaveBeenCalled();
    expect(reset).toHaveBeenCalledWith("widget-1");
    expect(result.current.canSubmit).toBe(false);
  });
});
