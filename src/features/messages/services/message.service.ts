import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  ChatShare,
  ConversationPage,
  ConversationSummary,
  InboxFilter,
  MessageDto,
  MessagePage,
  RecipientSuggestions,
  StartConversationInput,
} from "@/features/messages/types/message.types";

export const getConversationsService = async (
  cursor?: string,
  q?: string,
  filter?: InboxFilter,
): Promise<ConversationPage> => {
  const response = await api.get<ApiResponse<ConversationPage>>(
    ENDPOINTS.messages.conversations,
    {
      params: {
        limit: 20,
        ...(cursor ? { cursor } : {}),
        ...(q ? { q } : {}),
        ...(filter && filter !== "all" ? { filter } : {}),
      },
    },
  );
  return response.data.data;
};

export const getRecipientSuggestionsService = async (
  q: string,
  asPageSlug?: string,
): Promise<RecipientSuggestions> => {
  const response = await api.get<ApiResponse<RecipientSuggestions>>(
    ENDPOINTS.messages.suggestions,
    { params: { q, ...(asPageSlug ? { asPageSlug } : {}) } },
  );
  return response.data.data;
};

export const startConversationService = async (
  input: StartConversationInput,
): Promise<ConversationSummary> => {
  const response = await api.post<ApiResponse<{ conversation: ConversationSummary }>>(
    ENDPOINTS.messages.conversations,
    input,
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
  asPageId?: string,
  share?: ChatShare,
): Promise<MessageDto> => {
  const trimmed = body.trim();
  const response = await api.post<ApiResponse<{ message: MessageDto }>>(
    ENDPOINTS.messages.thread(conversationId),
    {
      ...(trimmed ? { body: trimmed } : {}),
      ...(asPageId ? { asPageId } : {}),
      ...(share ? { share } : {}),
    },
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
