import { Message } from "@/types/messaging";

export const messages: Message[] = [
  {
    id: "m1",
    conversationId: "c1",
    senderId: "u2",
    text: "Hey! Did you check the latest proposal?",
    createdAt: "2025-01-10T02:08:00.000Z",
    status: "read",
  },
  {
    id: "m2",
    conversationId: "c1",
    senderId: "u1",
    text: "Yes, looks good. I will push the UI today.",
    createdAt: "2025-01-10T02:10:00.000Z",
    status: "read",
  },
  {
    id: "m3",
    conversationId: "c2",
    senderId: "u3",
    text: "Can we add file previews?",
    createdAt: "2025-01-10T01:38:00.000Z",
    status: "delivered",
  },
];
