import { Conversation, User } from "@/types/messaging";

// Mock users for conversations
const mockUsers: User[] = [
  { id: "u1", name: "You", avatarUrl: "/avatars/you.png" },
  { id: "u2", name: "John Doe", avatarUrl: "/avatars/john.png" },
  { id: "u3", name: "Jane Smith", avatarUrl: "/avatars/jane.png" },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    participants: [mockUsers[0], mockUsers[1]],
    unreadCount: 0,
  },
  {
    id: "c2",
    participants: [mockUsers[0], mockUsers[2]],
    unreadCount: 1,
  },
];
