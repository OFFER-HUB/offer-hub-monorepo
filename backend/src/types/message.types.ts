export enum MessageType {
  TEXT = "text",
  FILE = "file",
  SYSTEM = "system",
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  created_at: string;
  sender?: any;
}

export interface CreateMessageDTO {
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface UpdateMessageDTO {
  is_read?: boolean;
}

export interface MessageWithSender extends Message {
  sender: any;
}
