import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ContactForm from "../ContactForm.client";
import { submitContactInquiry } from "@/services/contact";

vi.mock("@/services/contact", () => ({
  submitContactInquiry: vi.fn(),
}));

const submitContactInquiryMock = vi.mocked(submitContactInquiry);

function fillField(container: HTMLElement, id: string, value: string) {
  const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`#${id}`)!;
  fireEvent.change(field, { target: { value } });
}

describe("ContactForm", () => {
  beforeEach(() => {
    submitContactInquiryMock.mockReset();
  });

  it("shows required-field errors and does not submit when fields are empty", () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fireEvent.submit(form);

    expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/contact name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/work email is required/i)).toBeInTheDocument();
    expect(submitContactInquiry).not.toHaveBeenCalled();
  });

  it("shows a format error for an invalid work email", () => {
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fillField(container, "company", "Acme Inc");
    fillField(container, "name", "Jane Doe");
    fillField(container, "email", "not-a-valid-email");

    fireEvent.submit(form);

    expect(screen.getByText(/enter a valid work email/i)).toBeInTheDocument();
    expect(submitContactInquiry).not.toHaveBeenCalled();
  });

  it("submits the inquiry and shows the success state with valid data", async () => {
    submitContactInquiryMock.mockResolvedValueOnce({ ok: true });
    const { container } = render(<ContactForm />);
    const form = container.querySelector("form")!;

    fillField(container, "company", "Acme Inc");
    fillField(container, "name", "Jane Doe");
    fillField(container, "email", "jane@acme.com");
    fillField(container, "message", "We need escrow for 200 sellers");

    fireEvent.submit(form);

    expect(await screen.findByText(/thanks — we'll be in touch/i)).toBeInTheDocument();
    expect(submitContactInquiry).toHaveBeenCalledWith({
      company: "Acme Inc",
      name: "Jane Doe",
      email: "jane@acme.com",
      message: "We need escrow for 200 sellers",
    });
  });

  it("renders the submit error with role=alert when the service reports an error", async () => {
    submitContactInquiryMock.mockResolvedValueOnce({ ok: false, reason: "error" });
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
