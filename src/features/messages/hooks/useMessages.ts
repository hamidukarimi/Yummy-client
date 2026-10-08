import { useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { parseApiError } from "@/utils/errorHandler";
import useAuth from "@/hooks/useAuth";
import {
  getConversationsService,
  getMessagesService,
  getRecipientSuggestionsService,
  getUnreadMessageCountService,
  markConversationReadService,
  sendMessageService,
  startConversationService,
} from "@/features/messages/services/message.service";
import { connectMessageSocket, disconnectMessageSocket } from "@/features/messages/socket";
import type {
  ConversationSummary,
  InboxFilter,
  MessageDto,
  MessagePage,
} from "@/features/messages/types/message.types";

export const messageKeys = {
  all: ["messages"] as const,
  conversations: ["messages", "conversations"] as const,
  thread: (id: string) => ["messages", "thread", id] as const,
  unread: ["messages", "unread"] as const,
  suggestions: (q: string, asPageSlug: string) =>
    ["messages", "suggestions", q, asPageSlug] as const,
};

const fromViewer = (conversation: ConversationSummary, message: MessageDto, userId?: string): boolean => {
  if (conversation.actingAs === "page") {
    return Boolean(message.senderPageId && message.senderPageId === conversation.actingPage?.id);
  }
  return message.senderId === userId && !message.senderPageId;
};

const appendMessage = (
  data: InfiniteData<MessagePage> | undefined,
  message: MessageDto,
  userId?: string,
): InfiniteData<MessagePage> | undefined => {
  if (!data?.pages.length) return data;
  if (data.pages.some((page) => page.messages.some((item) => item.id === message.id))) return data;

  const [latest, ...older] = data.pages;
  if (!latest) return data;
  const mine = fromViewer(latest.conversation, message, userId);

  return {
    ...data,
    pages: [
      {
        ...latest,
        messages: [...latest.messages, message],
        conversation: {
          ...latest.conversation,
          unreadCount: mine ? latest.conversation.unreadCount : latest.conversation.unreadCount + 1,
          lastMessage: {
            text: message.body.slice(0, 140),
            senderId: message.senderId,
            ...(message.senderPageId ? { senderPageId: message.senderPageId } : {}),
            createdAt: message.createdAt,
          },
          lastMessageAt: message.createdAt,
        },
      },
      ...older,
    ],
  };
};

const markMessagesRead = (
  data: InfiniteData<MessagePage> | undefined,
  readAt: string,
  userId?: string,
): InfiniteData<MessagePage> | undefined => {
  if (!data) return data;
  const readTime = new Date(readAt).getTime();
  if (Number.isNaN(readTime)) return data;

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      messages: page.messages.map((message) => {
        const mine = fromViewer(page.conversation, message, userId);
        if (!mine || new Date(message.createdAt).getTime() > readTime || message.isRead) return message;
        return { ...message, isRead: true };
      }),
    })),
  };
};

const patchThread = (
  queryClient: QueryClient,
  conversationId: string,
  message: MessageDto,
  userId?: string,
): void => {
  const current = queryClient.getQueryData<InfiniteData<MessagePage>>(messageKeys.thread(conversationId));
  if (!current?.pages.length) {
    void queryClient.invalidateQueries({ queryKey: messageKeys.thread(conversationId) });
    return;
  }
  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messageKeys.thread(conversationId),
    appendMessage(current, message, userId),
  );
};

export const useMessageSocket = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) {
      disconnectMessageSocket();
      return;
    }

    const socket = connectMessageSocket();
    if (!socket) return;

    const refreshLists = () => {
      void queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
      void queryClient.invalidateQueries({ queryKey: messageKeys.unread });
    };

    const onNew = (payload: { conversationId?: string; message?: MessageDto }) => {
      if (!payload?.conversationId || !payload.message?.id) {
        refreshLists();
        return;
      }
      patchThread(queryClient, payload.conversationId, payload.message, userId);
      refreshLists();
    };

    const onRead = (payload: { conversationId?: string; readAt?: string }) => {
      if (!payload?.conversationId || !payload.readAt) return;
      queryClient.setQueryData<InfiniteData<MessagePage>>(
        messageKeys.thread(payload.conversationId),
        (current) => markMessagesRead(current, payload.readAt ?? "", userId),
      );
    };

    const onReconnect = () => {
      void queryClient.invalidateQueries({ queryKey: messageKeys.all });
    };

    socket.on("message:new", onNew);
    socket.on("message:read", onRead);
    socket.io.on("reconnect", onReconnect);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:read", onRead);
      socket.io.off("reconnect", onReconnect);
    };
  }, [userId, queryClient]);
};

export const useConversations = (q?: string, filter: InboxFilter = "all") =>
  useInfiniteQuery({
    queryKey: [...messageKeys.conversations, q ?? "", filter],
    queryFn: ({ pageParam }) => getConversationsService(pageParam, q, filter),
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

export const useRecipientSuggestions = (q: string, asPageSlug?: string) => {
  const [debounced, setDebounced] = useState(q.trim());

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(q.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [q]);

  return useQuery({
    queryKey: messageKeys.suggestions(debounced, asPageSlug ?? ""),
    queryFn: () => getRecipientSuggestionsService(debounced, asPageSlug),
    enabled: debounced.length >= 1,
  });
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
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { body: string; asPageId?: string }) => {
      try {
        return await sendMessageService(conversationId, input.body, input.asPageId);
      } catch (error) {
        throw parseApiError(error);
      }
    },
    onSuccess: (message) => {
      patchThread(queryClient, conversationId, message, user?.id);
      void queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
      void queryClient.invalidateQueries({ queryKey: messageKeys.unread });
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
      if (!conversationId) return;
      queryClient.setQueryData<InfiniteData<MessagePage>>(messageKeys.thread(conversationId), (current) => {
        if (!current) return current;
        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            conversation: { ...page.conversation, unreadCount: 0 },
          })),
        };
      });
      void queryClient.invalidateQueries({ queryKey: messageKeys.conversations });
      void queryClient.invalidateQueries({ queryKey: messageKeys.unread });
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

export const lastMessageLabel = (
  conversation: ConversationSummary,
  userId?: string,
): string => {
  const last = conversation.lastMessage;
  if (!last) return "No messages yet";
  const mine = fromViewer(conversation, {
    id: "",
    conversationId: conversation.id,
    senderId: last.senderId,
    ...(last.senderPageId ? { senderPageId: last.senderPageId } : {}),
    body: last.text,
    createdAt: last.createdAt,
    isRead: false,
  }, userId);
  if (mine) return `You: ${last.text}`;
  if (last.senderPageId && conversation.otherPage?.id === last.senderPageId) {
    return `${conversation.otherPage.name}: ${last.text}`;
  }
  if (last.senderPageId && conversation.actingPage?.id === last.senderPageId) {
    return `${conversation.actingPage.name}: ${last.text}`;
  }
  return last.text;
};
