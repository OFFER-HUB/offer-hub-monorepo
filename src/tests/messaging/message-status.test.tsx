import { render, screen } from "@testing-library/react";
import MessageStatus from "@/components/messaging/MessageStatus";

describe("MessageStatus", () => {
  it("muestra ✓ y aria-label Sent", () => {
    render(<MessageStatus status="sent" />);
    expect(screen.getByLabelText(/status: Sent/i)).toBeInTheDocument();
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("muestra ✓✓ (delivered) en gris", () => {
    render(<MessageStatus status="delivered" />);
    const el = screen.getByLabelText(/status: Delivered/i);
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("✓✓");
    expect(el).toHaveClass("text-gray-400");
  });

  it("muestra ✓✓ (read) en azul", () => {
    render(<MessageStatus status="read" />);
    const el = screen.getByLabelText(/status: Read/i);
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent("✓✓");
    expect(el).toHaveClass("text-blue-500");
  });
});
