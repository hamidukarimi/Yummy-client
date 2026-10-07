import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  ConversationPage,
  ConversationSummary,
  MessageDto,
  MessagePage,
} from "@/features/messages/types/message.types";

export const getConversationsService = async (
  cursor?: string,
): Promise<ConversationPage> => {
  const response = await api.get<ApiResponse<ConversationPage>>(
    ENDPOINTS.messages.conversations,
    { params: { limit: 20, ...(cursor ? { cursor } : {}) } },
  );
  return response.data.data;
};

export const startConversationService = async (
  username: string,
): Promise<ConversationSummary> => {
  const response = await api.post<ApiResponse<{ conversation: ConversationSummary }>>(
    ENDPOINTS.messages.conversations,
    { username },
  );
  return response.data.data.conversation;
};

export const getMessagesService = async (
  conversationId: string,
  before?: string,
): Promise<MessagePage> => {
  const response = await api.get<ApiResponse<MessagePage>>(
    ENDPOINTS.messages.thread(conversationId),
    { params: { limit: 30, ...(before ? { before } : {}) } },
  );
  return response.data.data;
};

export const sendMessageService = async (
  conversationId: string,
  body: string,
): Promise<MessageDto> => {
  const response = await api.post<ApiResponse<{ message: MessageDto }>>(
    ENDPOINTS.messages.thread(conversationId),
    { body },
  );
  return response.data.data.message;
};

export const markConversationReadService = async (
  conversationId: string,
): Promise<void> => {
  await api.post(ENDPOINTS.messages.read(conversationId));
};

export const getUnreadMessageCountService = async (): Promise<number> => {
  const response = await api.get<ApiResponse<{ count: number }>>(
    ENDPOINTS.messages.unreadCount,
  );
  return response.data.data.count;
};
