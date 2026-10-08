import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseApiError } from "@/utils/errorHandler";
import {
  getConversationsService,
  getMessagesService,
  getUnreadMessageCountService,
  markConversationReadService,
  sendMessageService,
  startConversationService,
} from "@/features/messages/services/message.service";
import { connectMessageSocket, disconnectMessageSocket } from "@/features/messages/socket";
import type { ConversationSummary } from "@/features/messages/types/message.types";

export const messageKeys = {
  all: ["messages"] as const,
  conversations: ["messages", "conversations"] as const,
  thread: (id: string) => ["messages", "thread", id] as const,
  unread: ["messages", "unread"] as const,
};

export const useMessageSocket = (enabled: boolean) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      disconnectMessageSocket();
      return;
    }

    const socket = connectMessageSocket();
    if (!socket) return;

    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: messageKeys.all });
    };

    socket.on("message:new", refresh);
    socket.on("message:read", refresh);

    return () => {
      socket.off("message:new", refresh);
      socket.off("message:read", refresh);
    };
  }, [enabled, queryClient]);
};

export const useConversations = () =>
  useInfiniteQuery({
    queryKey: messageKeys.conversations,
    queryFn: ({ pageParam }) => getConversationsService(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

export const useConversationThread = (conversationId?: string) =>
  useInfiniteQuery({
    queryKey: messageKeys.thread(conversationId ?? ""),
    queryFn: ({ pageParam }) => getMessagesService(conversationId ?? "", pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(conversationId),
  });

export const useUnreadMessageCount = (enabled = true) => {
  const { data } = useQuery({
    queryKey: messageKeys.unread,
    queryFn: getUnreadMessageCountService,
    enabled,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });

  return data ?? 0;
};

export const useStartConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { username?: string; pageSlug?: string; asPageSlug?: string }) => {
      try {
        return await startConversationService(input);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
    },
  });
};

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { body: string; asPageId?: string }) => {
      try {
        return await sendMessageService(conversationId, input.body, input.asPageId);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
};

export const useMarkConversationRead = (conversationId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!conversationId) return;
      await markConversationReadService(conversationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
};

export const conversationTitle = (conversation: ConversationSummary): string => {
  if (conversation.otherKind === "page") {
    return conversation.otherPage?.name ?? "Deleted page";
  }
  if (!conversation.otherUser) return "Deleted account";
  return `${conversation.otherUser.firstname} ${conversation.otherUser.lastname}`;
};
