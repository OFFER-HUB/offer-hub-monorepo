import { supabase } from "../lib/supabase/supabase";
import {
  Conversation,
  CreateConversationDTO,
  UpdateConversationDTO,
  ConversationWithDetails,
} from "@/types/conversation.types";
import { AppError } from "@/utils/AppError";

export class ConversationService {
  static async createConversation(
    conversationData: CreateConversationDTO,
  ): Promise<Conversation> {
    try {
      if (conversationData.project_id && conversationData.service_request_id) {
        throw new AppError(
          "Conversation cannot have both project_id and service_request_id",
          400,
        );
      }

      if (
        !conversationData.project_id &&
        !conversationData.service_request_id
      ) {
        throw new AppError(
          "Conversation must have either project_id or service_request_id",
          400,
        );
      }

      const existingConversation =
        await this.findExistingConversation(conversationData);
      if (existingConversation) {
        throw new AppError(
          "Conversation already exists between these participants",
          409,
        );
      }

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          ...conversationData,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          participants:users!conversations_client_id_fkey(*),
          freelancer:users!conversations_freelancer_id_fkey(*)
        `,
        )
        .single();

      if (error) {
        throw new AppError("Failed to create conversation", 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  static async getConversationsByUserId(
    userId: string,
  ): Promise<ConversationWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          *,
          participants:users!conversations_client_id_fkey(*),
          freelancer:users!conversations_freelancer_id_fkey(*),
          last_message:messages(
            id,
            content,
            message_type,
            created_at,
            sender:users(id, name, email)
          )
        `,
        )
        .or(`client_id.eq.${userId},freelancer_id.eq.${userId}`)
        .order("last_message_at", { ascending: false });

      if (error) {
        throw new AppError("Failed to fetch conversations", 500);
      }

      const conversationsWithUnreadCount = await Promise.all(
        data.map(async (conversation) => {
          const unreadCount = await this.getUnreadCount(
            conversation.id,
            userId,
          );
          return {
            ...conversation,
            unread_count: unreadCount,
          };
        }),
      );

      return conversationsWithUnreadCount;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  static async getConversationById(
    conversationId: string,
  ): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw new AppError("Failed to fetch conversation", 500);
      }

      return data || null;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  static async updateConversation(
    conversationId: string,
    updateData: UpdateConversationDTO,
  ): Promise<Conversation> {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
        .select()
        .single();

      if (error) {
        throw new AppError("Failed to update conversation", 500);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Internal server error", 500);
    }
  }

  private static async findExistingConversation(
    conversationData: CreateConversationDTO,
  ): Promise<Conversation | null> {
    const query = supabase
      .from("conversations")
      .select("*")
      .eq("client_id", conversationData.client_id)
      .eq("freelancer_id", conversationData.freelancer_id);

    if (conversationData.project_id) {
      query.eq("project_id", conversationData.project_id);
    }

    if (conversationData.service_request_id) {
      query.eq("service_request_id", conversationData.service_request_id);
    }

    const { data, error } = await query.single();

    if (error && error.code !== "PGRST116") {
      throw new AppError("Failed to check existing conversation", 500);
    }

    return data || null;
  }

  private static async getUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<number> {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .eq("is_read", false)
      .neq("sender_id", userId);

    if (error) {
      return 0;
    }

    return count || 0;
  }
}
