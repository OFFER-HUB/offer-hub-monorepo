import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "../ContactForm";

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

function fillField(container: HTMLElement, id: string, value: string) {
  const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
  fireEvent.change(field, { target: { value } });
}

describe("ContactForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows required-field errors and does not submit when fields are empty", () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fireEvent.submit(form);

    expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/contact name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/work email is required/i)).toBeInTheDocument();
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("shows a format error for an invalid work email", () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fillField(container, "company", "Acme Inc");
    fillField(container, "name", "Jane Doe");
    fillField(container, "email", "not-a-valid-email");

    fireEvent.submit(form);

    expect(screen.getByText(/enter a valid work email/i)).toBeInTheDocument();
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("rejects divergent invalid emails such as a@@b.co", () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fillField(container, "company", "Acme Inc");
    fillField(container, "name", "Jane Doe");
    fillField(container, "email", "a@@b.co");

    fireEvent.submit(form);

    expect(screen.getByText(/enter a valid work email/i)).toBeInTheDocument();
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("submits to the contact API and shows the success state with valid data", async () => {
    mockFetch(async () => jsonResponse(200, { ok: true }));
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fillField(container, "company", "Acme Inc");
    fillField(container, "name", "Jane Doe");
    fillField(container, "email", "jane@acme.com");

    fireEvent.submit(form);

    expect(await screen.findByText(/thanks — we'll be in touch/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/contact", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({
        company: "Acme Inc",
        name: "Jane Doe",
        email: "jane@acme.com",
        message: "",
      }),
    }));
  });

  it("renders the submit error with role=alert when the API returns an error", async () => {
    mockFetch(async () => jsonResponse(500, { error: "boom" }));
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fillField(container, "company", "Acme Inc");
    fillField(container, "name", "Jane Doe");
    fillField(container, "email", "jane@acme.com");

    fireEvent.submit(form);

    expect(await screen.findByRole("alert")).toHaveTextContent(/something went wrong/i);
  });
});
