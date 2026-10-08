import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Mail, Send } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import useAuth from "@/hooks/useAuth";
import useMyPages from "@/features/pages/hooks/useMyPages";
import {
  conversationTitle,
  useConversationThread,
  useConversations,
  useMarkConversationRead,
  useSendMessage,
  useStartConversation,
} from "@/features/messages/hooks/useMessages";
import type { ConversationSummary, MessageDto } from "@/features/messages/types/message.types";

const timeLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const Avatar = ({ conversation }: { conversation: ConversationSummary }) => {
  const page = conversation.otherKind === "page" ? conversation.otherPage : null;
  const user = page ? null : conversation.otherUser;
  const image = page?.avatar ?? user?.avatar;
  const letter = page?.name?.[0] ?? user?.firstname?.[0] ?? "?";
  return (
    <div className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden shrink-0">
      {image ? (
        <img src={image} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white font-semibold">
          {letter}
        </div>
      )}
    </div>
  );
};

const MessagesPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { pages: myPages } = useMyPages();
  const [target, setTarget] = useState<"person" | "page">("person");
  const [handle, setHandle] = useState("");
  const [asPageSlug, setAsPageSlug] = useState("");
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const conversations = useConversations();
  const thread = useConversationThread(conversationId);
  const start = useStartConversation();
  const send = useSendMessage(conversationId ?? "");
  const markRead = useMarkConversationRead(conversationId);

  const items = conversations.data?.pages.flatMap((page) => page.conversations) ?? [];
  const messages = useMemo(() => {
    const pages = thread.data?.pages ?? [];
    return [...pages].reverse().flatMap((page) => page.messages);
  }, [thread.data]);
  const active = thread.data?.pages[0]?.conversation;
  const canSend = Boolean(active?.canMessage);
  const newestId = messages[messages.length - 1]?.id;

  useEffect(() => {
    if (!conversationId || !active || active.unreadCount < 1) return;
    markRead.mutate();
  }, [conversationId, active?.id, active?.unreadCount]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [newestId, conversationId]);

  const openConversation = (id: string) => navigate(`/messages/${id}`);

  const beginConversation = async () => {
    const value = handle.trim().replace(/^@/, "");
    if (!value) return;
    try {
      const conversation = await start.mutateAsync({
        ...(target === "page" ? { pageSlug: value } : { username: value }),
        ...(asPageSlug ? { asPageSlug } : {}),
      });
      setHandle("");
      navigate(`/messages/${conversation.id}`);
    } catch {
      return;
    }
  };

  const submitMessage = async () => {
    const body = draft.trim();
    if (!body || !conversationId) return;
    try {
      await send.mutateAsync({
        body,
        ...(active?.actingAs === "page" && active.actingPage
          ? { asPageId: active.actingPage.id }
          : {}),
      });
      setDraft("");
    } catch {
      return;
    }
  };

  const subtitle = (conversation: ConversationSummary): string => {
    if (conversation.otherKind === "page") {
      return conversation.otherPage?.isActive ? `/${conversation.otherPage.slug}` : "Unavailable";
    }
    return conversation.otherUser ? `@${conversation.otherUser.username}` : "Unavailable";
  };

  const isMine = (message: MessageDto): boolean => {
    if (!active) return false;
    if (active.actingAs === "page") return message.senderPageId === active.actingPage?.id;
    return message.senderId === user?.id && !message.senderPageId;
  };

  return (
    <div className="h-[calc(100dvh-4.25rem)] bg-black text-white lg:grid lg:grid-cols-[360px_minmax(0,1fr)]">
      <section
        className={`${conversationId ? "hidden lg:flex" : "flex"} flex-col border-r border-zinc-900 min-h-0`}
      >
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-lg font-bold">Messages</h1>
          <form
            className="mt-3 flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void beginConversation();
            }}
          >
            <div className="flex gap-2">
              <select
                value={target}
                onChange={(event) => setTarget(event.target.value as "person" | "page")}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-2 text-sm focus:outline-none focus:border-zinc-600"
              >
                <option value="person">Person</option>
                <option value="page">Page</option>
              </select>
              <input
                value={handle}
                onChange={(event) => setHandle(event.target.value)}
                placeholder={target === "page" ? "Page slug" : "Username"}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
              <button
                type="submit"
                disabled={start.isPending}
                className="px-3 rounded-xl bg-[#F7C12B] text-black text-sm font-semibold disabled:opacity-50"
              >
                {start.isPending ? "..." : "Start"}
              </button>
            </div>
            {myPages.some((page) => page.isActive) && (
              <select
                value={asPageSlug}
                onChange={(event) => setAsPageSlug(event.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-zinc-600"
              >
                <option value="">From me</option>
                {myPages.filter((page) => page.isActive).map((page) => (
                  <option key={page.id} value={page.slug}>
                    From {page.name}
                  </option>
                ))}
              </select>
            )}
          </form>
          {start.error && (
            <p className="text-red-400 text-xs mt-2">{start.error.message}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pb-20 lg:pb-4">
          {conversations.isLoading && (
            <div className="flex justify-center py-10">
              <Spinner size="md" />
            </div>
          )}
          {conversations.isError && (
            <p className="text-zinc-500 text-sm text-center py-10">Failed to load conversations.</p>
          )}
          {!conversations.isLoading && items.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-zinc-500">
              <Mail size={28} />
              <p className="text-sm">No conversations yet.</p>
            </div>
          )}
          {items.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => openConversation(conversation.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-zinc-900 ${
                conversation.id === conversationId ? "bg-zinc-900" : ""
              }`}
            >
              <Avatar conversation={conversation} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm truncate">
                    {conversationTitle(conversation)}
                  </span>
                  <span className="text-zinc-600 text-xs shrink-0">
                    {timeLabel(conversation.lastMessage?.createdAt ?? conversation.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-zinc-500 text-xs truncate">
                    {conversation.lastMessage?.text ?? "No messages yet"}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-[#F7C12B] text-black text-[10px] font-bold flex items-center justify-center">
                      {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
          {conversations.hasNextPage && (
            <div className="flex justify-center py-4">
              <button
                onClick={() => void conversations.fetchNextPage()}
                disabled={conversations.isFetchingNextPage}
                className="text-sm text-zinc-300 border border-zinc-700 rounded-full px-4 py-2"
              >
                {conversations.isFetchingNextPage ? "Loading..." : "Load older"}
              </button>
            </div>
          )}
        </div>
      </section>

      <section
        className={`${conversationId ? "flex" : "hidden lg:flex"} flex-col min-h-0`}
      >
        {!conversationId && (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 gap-2">
            <Mail size={32} />
            <p className="text-sm">Select a conversation</p>
          </div>
        )}

        {conversationId && thread.isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="md" />
          </div>
        )}

        {conversationId && thread.isError && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-500 text-sm">This conversation is unavailable.</p>
          </div>
        )}

        {conversationId && active && (
          <>
            <header className="flex items-center gap-3 px-3 py-3 border-b border-zinc-900">
              <button
                onClick={() => navigate("/messages")}
                className="lg:hidden text-white"
                aria-label="Back to conversations"
              >
                <ChevronLeft size={22} />
              </button>
              <Avatar conversation={active} />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{conversationTitle(active)}</p>
                <p className="text-zinc-500 text-xs truncate">{subtitle(active)}</p>
                {active.actingAs === "page" && active.actingPage && (
                  <p className="text-zinc-600 text-xs truncate">
                    Replying as {active.actingPage.name}
                  </p>
                )}
              </div>
            </header>

            <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
              {thread.hasNextPage && (
                <button
                  onClick={() => void thread.fetchNextPage()}
                  disabled={thread.isFetchingNextPage}
                  className="self-center text-xs text-zinc-400 border border-zinc-800 rounded-full px-3 py-1.5 mb-2"
                >
                  {thread.isFetchingNextPage ? "Loading..." : "Load older"}
                </button>
              )}
              {messages.length === 0 && (
                <p className="text-zinc-500 text-sm text-center py-10">
                  No messages yet. Say hello.
                </p>
              )}
              {messages.map((message, index) => (
                <Bubble
                  key={message.id}
                  message={message}
                  mine={isMine(message)}
                  showRead={
                    isMine(message) &&
                    message.isRead &&
                    index === messages.length - 1
                  }
                />
              ))}
            </div>

            <form
              className="flex items-end gap-2 px-3 py-3 border-t border-zinc-900"
              onSubmit={(event) => {
                event.preventDefault();
                void submitMessage();
              }}
            >
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submitMessage();
                  }
                }}
                disabled={!canSend}
                rows={1}
                placeholder={
                  canSend
                    ? "Message..."
                    : active.otherKind === "page"
                      ? "This page can't receive messages"
                      : "This account can't receive messages"
                }
                className="flex-1 resize-none bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!canSend || send.isPending || draft.trim().length === 0}
                className="w-10 h-10 rounded-full bg-[#F7C12B] text-black flex items-center justify-center disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
            {send.error && (
              <p className="text-red-400 text-xs px-4 pb-3">{send.error.message}</p>
            )}
          </>
        )}
      </section>
    </div>
  );
};

const Bubble = ({
  message,
  mine,
  showRead,
}: {
  message: MessageDto;
  mine: boolean;
  showRead: boolean;
}) => (
  <div className={`flex flex-col max-w-[78%] ${mine ? "self-end items-end" : "self-start"}`}>
    <div
      className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
        mine ? "bg-[#F7C12B] text-black rounded-br-md" : "bg-zinc-800 text-white rounded-bl-md"
      }`}
    >
      {message.body}
    </div>
    <span className="text-[10px] text-zinc-600 mt-1">
      {timeLabel(message.createdAt)}
      {showRead ? " · Read" : ""}
    </span>
  </div>
);

export default MessagesPage;
