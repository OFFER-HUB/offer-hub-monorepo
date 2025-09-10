import { Request, Response } from "express";
import { MessageService } from "@/services/message.service";
import { CreateMessageDTO, MessageType } from "@/types/message.types";
import { AppError } from "@/utils/AppError";
import {
  buildSuccessResponse,
  buildErrorResponse,
} from "../utils/responseBuilder";

const isUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export class MessageController {
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const messageData: CreateMessageDTO = req.body;

      if (
        !messageData.conversation_id ||
        !messageData.sender_id ||
        !messageData.content ||
        !messageData.message_type
      ) {
        throw new AppError(
          "conversation_id, sender_id, content, and message_type are required",
          400,
        );
      }

      if (!isUUID(messageData.conversation_id)) {
        throw new AppError("Invalid conversation_id format", 400);
      }

      if (!isUUID(messageData.sender_id)) {
        throw new AppError("Invalid sender_id format", 400);
      }

      if (!Object.values(MessageType).includes(messageData.message_type)) {
        throw new AppError(
          "Invalid message_type. Must be text, file, or system",
          400,
        );
      }

      if (messageData.message_type === MessageType.FILE) {
        if (
          !messageData.file_url ||
          !messageData.file_name ||
          messageData.file_size === undefined
        ) {
          throw new AppError(
            "File messages require file_url, file_name, and file_size",
            400,
          );
        }

        if (
          typeof messageData.file_size !== "number" ||
          messageData.file_size <= 0
        ) {
          throw new AppError("file_size must be a positive number", 400);
        }
      }

      if (messageData.content.trim().length === 0) {
        throw new AppError("Message content cannot be empty", 400);
      }

      if (messageData.content.length > 5000) {
        throw new AppError(
          "Message content cannot exceed 5000 characters",
          400,
        );
      }

      const message = await MessageService.sendMessage(messageData);

      res
        .status(201)
        .json(buildSuccessResponse(message, "Message sent successfully"));
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(buildErrorResponse(error.message));
      } else {
        res.status(500).json(buildErrorResponse("Internal server error"));
      }
    }
  }

  static async getMessagesByConversationId(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { conversationId } = req.params;

      if (!isUUID(conversationId)) {
        throw new AppError("Invalid conversationId format", 400);
      }

      const messages =
        await MessageService.getMessagesByConversationId(conversationId);

      res
        .status(200)
        .json(buildSuccessResponse(messages, "Messages fetched successfully"));
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(buildErrorResponse(error.message));
      } else {
        res.status(500).json(buildErrorResponse("Internal server error"));
      }
    }
  }

  static async markMessagesAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      const { userId } = req.body;

      if (!isUUID(conversationId)) {
        throw new AppError("Invalid conversationId format", 400);
      }

      if (!isUUID(userId)) {
        throw new AppError("Invalid userId format", 400);
      }

      await MessageService.markMessagesAsRead(conversationId, userId);

      res.status(200).json({
        success: true,
        message: "Messages_marked_as_read_successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  }

  static async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;

      if (!isUUID(messageId)) {
        throw new AppError("Invalid messageId format", 400);
      }

      const message = await MessageService.getMessageById(messageId);

      if (!message) {
        throw new AppError("Message not found", 404);
      }

      res.status(200).json({
        success: true,
        message: "Message_fetched_successfully",
        data: message,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  }
}
