import { supabase } from "../lib/supabase/supabase";
import {
  Message,
  CreateMessageDTO,
  UpdateMessageDTO,
  MessageWithSender,
  MessageType,
} from "@/types/message.types";
import { ConversationService } from "@/services/conversation.service";
import { AppError } from "@/utils/AppError";

export class MessageService {
  static async sendMessage(
    messageData: CreateMessageDTO,
  ): Promise<MessageWithSender> {
    try {
      // Validate conversation exists
      const conversation = await ConversationService.getConversationById(
        messageData.conversation_id,
      );
      if (!conversation) {
        throw new AppError("Conversation not found", 404);
      }

      // Validate file message requirements
      if (messageData.message_type === MessageType.FILE) {
        if (
          !messageData.file_url ||
          !messageData.file_name ||
          !messageData.file_size
        ) {
          throw new AppError(
            "File messages require file_url, file_name, and file_size",
            400,
          );
        }
      }

      // Insert message
      const { data: messageResult, error: messageError } = await supabase
        .from("messages")
        .insert({
          ...messageData,
          is_read: false,
          created_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          sender:users(id, name, email)
        `,
        )
        .single();

      if (messageError) {
        throw new AppError("Failed to send message", 500);
      }

      // Update conversation's last_message_at
      await ConversationService.updateConversation(
        messageData.conversation_id,
        {
          last_message_at: new Date().toISOString(),
        },
      );

      return messageResult;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  static async getMessagesByConversationId(
    conversationId: string,
  ): Promise<MessageWithSender[]> {
    try {
      // Validate conversation exists
      const conversation =
        await ConversationService.getConversationById(conversationId);
      if (!conversation) {
        throw new AppError("Conversation not found", 404);
      }

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          sender:users(id, name, email)
        `,
        )
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        throw new AppError("Failed to fetch messages", 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  static async getMessageById(messageId: string): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("id", messageId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw new AppError("Failed to fetch message", 500);
      }

      return data || null;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  static async updateMessage(
    messageId: string,
    updateData: UpdateMessageDTO,
  ): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from("messages")
        .update(updateData)
        .eq("id", messageId)
        .select()
        .single();

      if (error) {
        throw new AppError("Failed to update message", 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  static async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("is_read", false);

      if (error) {
        throw new AppError("Failed to mark messages as read", 500);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }
}
