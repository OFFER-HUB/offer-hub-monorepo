export interface Conversation {
  id: string;
  project_id?: string;
  service_request_id?: string;
  client_id: string;
  freelancer_id: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  participants?: any[];
  last_message?: any;
  unread_count?: number;
}

export interface CreateConversationDTO {
  project_id?: string;
  service_request_id?: string;
  client_id: string;
  freelancer_id: string;
}

export interface UpdateConversationDTO {
  last_message_at?: string;
}

export interface ConversationWithDetails extends Conversation {
  participants: any[];
  last_message?: any;
  unread_count: number;
}
