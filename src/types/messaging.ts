export type User = { id: string; name: string; avatarUrl?: string };
export type MessageStatus = "sent" | "delivered" | "read";
export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text?: string;
  fileUrl?: string;
  createdAt: string;
  status: MessageStatus;
};
export type Conversation = {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
};
