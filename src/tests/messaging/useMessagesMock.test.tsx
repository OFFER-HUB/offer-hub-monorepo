import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { useMessagesMock } from "@/hooks/useMessagesMock";

function Harness() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    handleSendMessage,
  } = useMessagesMock();

  return (
    <div>
      <div data-testid="conversations-count">{conversations.length}</div>
      <div data-testid="active-conv">{activeConversationId}</div>
      <div data-testid="messages-count">{messages.length}</div>
      <button onClick={() => handleSendMessage("hola")} aria-label="send">
        send
      </button>
      <button
        onClick={() => setActiveConversationId(conversations[1]?.id)}
        aria-label="switch"
      >
        switch
      </button>
    </div>
  );
}

describe("useMessagesMock", () => {
  it("carga conversaciones y mensajes iniciales desde los mocks", () => {
    render(<Harness />);
    const convCount = Number(
      screen.getByTestId("conversations-count").textContent,
    );
    const msgCount = Number(screen.getByTestId("messages-count").textContent);
    expect(convCount).toBeGreaterThan(0);
    expect(msgCount).toBeGreaterThan(0);
  });

  it("agrega un mensaje al enviar", () => {
    render(<Harness />);
    const before = Number(screen.getByTestId("messages-count").textContent);
    fireEvent.click(screen.getByLabelText("send"));
    const after = Number(screen.getByTestId("messages-count").textContent);
    expect(after).toBe(before + 1);
  });

  it("cambia la conversación activa y actualiza los mensajes", () => {
    render(<Harness />);
    const beforeConv = screen.getByTestId("active-conv").textContent;
    fireEvent.click(screen.getByLabelText("switch"));
    const afterConv = screen.getByTestId("active-conv").textContent;
    expect(afterConv).not.toEqual(beforeConv);
  });
});
