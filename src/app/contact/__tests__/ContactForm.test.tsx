import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactForm } from "../ContactForm";

const insert = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({ insert })),
  },
}));

function fillField(container: HTMLElement, id: string, value: string) {
  const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
  fireEvent.change(field, { target: { value } });
}

describe("ContactForm", () => {
  beforeEach(() => {
    insert.mockReset();
  });

  it("shows required-field errors and does not submit when fields are empty", () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fireEvent.submit(form);

    expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/contact name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/work email is required/i)).toBeInTheDocument();
    expect(insert).not.toHaveBeenCalled();
  });

  it("shows a format error for an invalid work email", () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fillField(container, "company", "Acme Inc");
    fillField(container, "name", "Jane Doe");
    fillField(container, "email", "not-a-valid-email");

    fireEvent.submit(form);

    expect(screen.getByText(/enter a valid work email/i)).toBeInTheDocument();
    expect(insert).not.toHaveBeenCalled();
  });

  it("submits to Supabase and shows the success state with valid data", async () => {
    insert.mockResolvedValueOnce({ error: null });
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fillField(container, "company", "Acme Inc");
    fillField(container, "name", "Jane Doe");
    fillField(container, "email", "jane@acme.com");

    fireEvent.submit(form);

    expect(await screen.findByText(/thanks — we'll be in touch/i)).toBeInTheDocument();
    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        company: "Acme Inc",
        contact_name: "Jane Doe",
        email: "jane@acme.com",
      }),
    ]);
  });

  it("renders the submit error with role=alert when Supabase returns an error", async () => {
    insert.mockResolvedValueOnce({ error: { message: "boom" } });
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fillField(container, "company", "Acme Inc");
    fillField(container, "name", "Jane Doe");
    fillField(container, "email", "jane@acme.com");

    fireEvent.submit(form);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/something went wrong/i);
  });
});
