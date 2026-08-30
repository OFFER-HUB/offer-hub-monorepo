import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const submitDataRightsRequest = vi.hoisted(() => vi.fn());
vi.mock("@/services/data-rights", () => ({ submitDataRightsRequest }));

import { useDataRightsForm } from "../use-data-rights-form";

const ENDPOINT = "/api/privacy/export";

type Hook = ReturnType<typeof useDataRightsForm>;

async function submit(result: { current: Hook }) {
  await act(async () => {
    await result.current.handleSubmit({
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent);
  });
}

beforeEach(() => {
  submitDataRightsRequest
    .mockReset()
    .mockResolvedValue({ ok: true, message: "Export sent." });
});

describe("useDataRightsForm", () => {
  it("starts with an empty email, no status, no errors and not loading", () => {
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));

    expect(result.current.email).toBe("");
    expect(result.current.errors).toEqual({});
    expect(result.current.status).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("exposes a setter for the controlled email input", () => {
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));

    act(() => result.current.setEmail("jane@acme.com"));

    expect(result.current.email).toBe("jane@acme.com");
  });

  it("prevents the default form submission", async () => {
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));
    const preventDefault = vi.fn();

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault,
      } as unknown as React.FormEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it("sends the current email to the endpoint it was configured with", async () => {
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));
    act(() => result.current.setEmail("jane@acme.com"));

    await submit(result);

    expect(submitDataRightsRequest).toHaveBeenCalledWith(
      ENDPOINT,
      "jane@acme.com",
    );
  });

  it("surfaces the server message and clears the field on success", async () => {
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));
    act(() => result.current.setEmail("jane@acme.com"));

    await submit(result);

    expect(result.current.status).toEqual({ ok: true, message: "Export sent." });
    expect(result.current.email).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("prefers an explicit success message over the server's", async () => {
    const { result } = renderHook(() =>
      useDataRightsForm(ENDPOINT, "Check your inbox."),
    );
    act(() => result.current.setEmail("jane@acme.com"));

    await submit(result);

    expect(result.current.status).toEqual({
      ok: true,
      message: "Check your inbox.",
    });
  });

  it("keeps the typed email on failure so the user can retry", async () => {
    submitDataRightsRequest.mockResolvedValue({
      ok: false,
      reason: "error",
      message: "No record found for that email address.",
    });
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));
    act(() => result.current.setEmail("ghost@acme.com"));

    await submit(result);

    expect(result.current.status).toEqual({
      ok: false,
      message: "No record found for that email address.",
    });
    expect(result.current.email).toBe("ghost@acme.com");
  });

  it("applies server-side field errors when the response reports a validation failure", async () => {
    submitDataRightsRequest.mockResolvedValue({
      ok: false,
      reason: "validation",
      message: "A valid email address is required.",
      errors: { email: "A valid email address is required." },
    });
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));
    act(() => result.current.setEmail("a@@b.co"));

    await submit(result);

    expect(result.current.errors.email).toBe(
      "A valid email address is required.",
    );
  });

  it("does not substitute the success message on a failed request", async () => {
    submitDataRightsRequest.mockResolvedValue({
      ok: false,
      reason: "network",
      message: "Network error. Please try again.",
    });
    const { result } = renderHook(() =>
      useDataRightsForm(ENDPOINT, "Check your inbox."),
    );
    act(() => result.current.setEmail("jane@acme.com"));

    await submit(result);

    expect(result.current.status?.message).toBe(
      "Network error. Please try again.",
    );
  });

  it("flips loading on for the duration of the request", async () => {
    let release!: (value: { ok: boolean; message: string }) => void;
    submitDataRightsRequest.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));
    act(() => result.current.setEmail("jane@acme.com"));

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent) as unknown as Promise<void>;
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      release({ ok: true, message: "Done." });
      await pending;
    });

    expect(result.current.loading).toBe(false);
  });

  it("clears the previous status when a new request starts", async () => {
    submitDataRightsRequest.mockResolvedValueOnce({
      ok: false,
      reason: "error",
      message: "Nope.",
    });
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));
    act(() => result.current.setEmail("ghost@acme.com"));
    await submit(result);
    expect(result.current.status?.ok).toBe(false);

    act(() => result.current.setEmail("jane@acme.com"));
    submitDataRightsRequest.mockResolvedValueOnce({
      ok: true,
      message: "Done.",
    });
    await submit(result);

    expect(result.current.status).toEqual({ ok: true, message: "Done." });
  });

  it("blocks submission for invalid emails before calling the service", async () => {
    const { result } = renderHook(() => useDataRightsForm(ENDPOINT));
    act(() => result.current.setEmail("a@@b.co"));

    await submit(result);

    expect(submitDataRightsRequest).not.toHaveBeenCalled();
    expect(result.current.errors.email).toBe(
      "A valid email address is required.",
    );
  });

  it("works against the delete endpoint too", async () => {
    const { result } = renderHook(() =>
      useDataRightsForm("/api/privacy/delete"),
    );
    act(() => result.current.setEmail("jane@acme.com"));

    await submit(result);

    expect(submitDataRightsRequest).toHaveBeenCalledWith(
      "/api/privacy/delete",
      "jane@acme.com",
    );
  });
});
