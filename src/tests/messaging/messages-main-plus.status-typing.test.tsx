import { render, screen, act } from "@testing-library/react";

Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: jest.fn(),
});

jest.mock(
  "lucide-react",
  () => {
    const React = require("react");
    return new Proxy(
      {},
      { get: () => (props: any) => React.createElement("i", props) },
    );
  },
  { virtual: true },
);

jest.mock(
  "@/hooks/use-message",
  () => ({
    useMessages: () => ({
      newMessage: "",
      setNewMessage: jest.fn(),
      fileInputRef: { current: null },
      handleSendMessage: jest.fn(),
      handleFileUpload: jest.fn(),
      handleKeyPress: jest.fn(),
    }),
  }),
  { virtual: true },
);

let MessagesMainPlus: any;
beforeAll(async () => {
  ({ MessagesMainPlus } = await import(
    "@/components/messaging/messages-main-plus"
  ));
});

jest.useFakeTimers();

const activeConversation = { id: "c1", name: "John Doe" } as any;

describe("MessagesMainPlus", () => {
  it("progride status sent -> delivered -> read en mensajes salientes", async () => {
    const messages = [
      {
        id: "m1",
        isOutgoing: true,
        content: "hola",
        timestamp: "09:00 am",
        type: "text",
      },
      {
        id: "m2",
        isOutgoing: false,
        content: "hey",
        timestamp: "09:01 am",
        type: "text",
      },
    ] as any[];

    render(
      <MessagesMainPlus
        activeConversation={activeConversation}
        messages={messages}
        onSendMessage={jest.fn()}
      />,
    );

    expect(await screen.findByLabelText(/status: Sent/i)).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(650);
    });
    expect(
      await screen.findByLabelText(/status: Delivered/i),
    ).toBeInTheDocument();
    await act(async () => {
      jest.advanceTimersByTime(800);
    });
    expect(await screen.findByLabelText(/status: Read/i)).toBeInTheDocument();
  });

  it("muestra y oculta el typing indicator con el intervalo", async () => {
    render(
      <MessagesMainPlus
        activeConversation={activeConversation}
        messages={[]}
        onSendMessage={jest.fn()}
      />,
    );

    expect(screen.queryByText("●")).toBeNull();
    await act(async () => {
      jest.advanceTimersByTime(6600);
    });
    expect(screen.getAllByText("●").length).toBeGreaterThan(0);
    await act(async () => {
      jest.advanceTimersByTime(1200);
    });
    expect(screen.queryByText("●")).toBeNull();
  });
});
