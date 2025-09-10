import { User } from "@/types/messaging";

export const currentUserId = "u1";

export const users: User[] = [
  { id: "u1", name: "You", avatarUrl: "/avatars/you.png" },
  { id: "u2", name: "John Doe", avatarUrl: "/avatars/john.png" },
  { id: "u3", name: "Jane Smith", avatarUrl: "/avatars/jane.png" },
];

export const getUser = (id: string) => users.find((u) => u.id === id)!;
