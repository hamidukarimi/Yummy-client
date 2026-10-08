import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Mail, Send } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import useAuth from "@/hooks/useAuth";
import useMyPages from "@/features/pages/hooks/useMyPages";
import {
  conversationTitle,
  lastMessageLabel,
  useBlockUser,
  useConversationThread,
  useConversations,
  useDeleteMessage,
  useEditMessage,
  useHideConversation,
  useMarkConversationRead,
  useRecipientSuggestions,
  useReportMessage,
  useSendMessage,
  useSetConversationMuted,
  useSetConversationPinned,
  useStartConversation,
} from "@/features/messages/hooks/useMessages";
import MessageText from "@/features/messages/components/MessageText";
import { connectMessageSocket } from "@/features/messages/socket";
import type { ChatPage, ConversationSummary, InboxFilter, MessageDto } from "@/features/messages/types/message.types";
import type { ReportReason } from "@/features/reports/types/report.types";
import { formatTime, getCurrentDayKey, getOpenStatus } from "@/features/pages/utils/openStatus";

const exactTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const dayStamp = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const dayLabel = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const startOf = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const days = Math.round((startOf(today) - startOf(date)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const MESSAGE_CHANGE_WINDOW_MS = 15 * 60 * 1000;

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "misleading", label: "Misleading" },
  { value: "other", label: "Other" },
];

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
  const [inboxQuery, setInboxQuery] = useState("");
  const [debouncedInboxQuery, setDebouncedInboxQuery] = useState("");
  const [inboxFilter, setInboxFilter] = useState<InboxFilter>("all");
  const [replyTarget, setReplyTarget] = useState<MessageDto | null>(null);
  const [reportTarget, setReportTarget] = useState<MessageDto | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [editing, setEditing] = useState<MessageDto | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const [identityError, setIdentityError] = useState("");
  const typingSent = useRef(0);
  const typingHide = useRef<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const anchor = useRef<{ height: number; top: number } | null>(null);
  const conversationRef = useRef(conversationId);
  const newestRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setReplyTarget(null);
    setReportTarget(null);
    setReportDetails("");
    setEditing(null);
    setConfirmDeleteId(null);
    setOtherTyping(false);
    setIdentityError("");
  }, [conversationId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedInboxQuery(inboxQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [inboxQuery]);

  const conversations = useConversations(debouncedInboxQuery, inboxFilter);
  const suggestions = useRecipientSuggestions(handle.replace(/^@/, ""), asPageSlug || undefined);
  const thread = useConversationThread(conversationId);
  const start = useStartConversation();
  const send = useSendMessage(conversationId ?? "");
  const markRead = useMarkConversationRead(conversationId);
  const mute = useSetConversationMuted(conversationId);
  const pin = useSetConversationPinned(conversationId);
  const hide = useHideConversation(conversationId);
  const block = useBlockUser(conversationId);
  const edit = useEditMessage(conversationId);
  const remove = useDeleteMessage(conversationId);
  const report = useReportMessage(conversationId);

  const items = conversations.data?.pages.flatMap((page) => page.conversations) ?? [];
  const messages = useMemo(() => {
    const pages = thread.data?.pages ?? [];
    return [...pages].reverse().flatMap((page) => page.messages);
  }, [thread.data]);
  const active = thread.data?.pages[0]?.conversation;
  const canSend = Boolean(active?.canMessage);
  const newestId = messages[messages.length - 1]?.id;
  const senderPages = myPages.filter(
    (page) => page.isActive && page.slug !== active?.otherPage?.slug,
  );

  useEffect(() => {
    if (!conversationId) return;
    const socket = connectMessageSocket();
    if (!socket) return;
    const onTyping = (payload: { conversationId?: string }) => {
      if (payload?.conversationId !== conversationId) return;
      setOtherTyping(true);
      if (typingHide.current) window.clearTimeout(typingHide.current);
      typingHide.current = window.setTimeout(() => setOtherTyping(false), 3000);
    };
    socket.on("typing", onTyping);
    return () => {
      socket.off("typing", onTyping);
      if (typingHide.current) window.clearTimeout(typingHide.current);
    };
  }, [conversationId]);

  const notifyTyping = () => {
    if (!conversationId || !canSend || editing) return;
    const now = Date.now();
    if (now - typingSent.current < 1500) return;
    typingSent.current = now;
    connectMessageSocket()?.emit("typing", { conversationId });
  };

  const switchIdentity = async (slug: string) => {
    if (!active) return;
    const current = active.actingAs === "page" ? active.actingPage?.slug ?? "" : "";
    if (slug === current) return;
    const target = active.otherKind === "page" && active.otherPage
      ? { pageSlug: active.otherPage.slug }
      : active.otherUser
        ? { username: active.otherUser.username }
        : null;
    if (!target) return;
    try {
      const conversation = await start.mutateAsync({
        ...target,
        ...(slug ? { asPageSlug: slug } : {}),
      });
      setIdentityError("");
      navigate(`/messages/${conversation.id}`);
    } catch (error) {
      setIdentityError(error instanceof Error ? error.message : "Could not switch");
    }
  };

  useEffect(() => {
    if (!conversationId || !active || active.unreadCount < 1) return;
    markRead.mutate();
  }, [conversationId, active?.id, active?.unreadCount]);

  const loadOlder = () => {
    const node = scroller.current;
    if (!node || !thread.hasNextPage || thread.isFetchingNextPage) return;
    anchor.current = { height: node.scrollHeight, top: node.scrollTop };
    void thread.fetchNextPage();
  };

  useLayoutEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const switched = conversationRef.current !== conversationId;
    const newestChanged = newestRef.current !== newestId;
    conversationRef.current = conversationId;
    newestRef.current = newestId;
    if (switched) anchor.current = null;

    if (anchor.current && !newestChanged && !switched) {
      const delta = node.scrollHeight - anchor.current.height;
      if (delta > 0) node.scrollTop = anchor.current.top + delta;
      anchor.current = null;
      return;
    }

    anchor.current = null;
    node.scrollTop = node.scrollHeight;
  }, [newestId, conversationId, messages.length]);

  useEffect(() => {
    if (thread.isFetchingNextPage || !anchor.current) return;
    const node = scroller.current;
    if (!node || node.scrollHeight === anchor.current.height) {
      anchor.current = null;
    }
  }, [thread.isFetchingNextPage, messages.length]);

  const openConversation = (id: string) => navigate(`/messages/${id}`);

  const beginConversation = async (input?: { username?: string; pageSlug?: string }) => {
    const typed = handle.trim().replace(/^@/, "");
    const payload = input ?? (target === "page" ? { pageSlug: typed } : { username: typed });
    if (!payload.username && !payload.pageSlug) return;
    try {
      const conversation = await start.mutateAsync({
        ...payload,
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
    if (editing) {
      try {
        await edit.mutateAsync({ messageId: editing.id, body });
        setDraft("");
        setEditing(null);
      } catch {
        return;
      }
      return;
    }
    try {
      await send.mutateAsync({
        body,
        ...(replyTarget ? { replyTo: replyTarget.id } : {}),
        ...(active?.actingAs === "page" && active.actingPage
          ? { asPageId: active.actingPage.id }
          : {}),
      });
      setDraft("");
      setReplyTarget(null);
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
                placeholder={target === "page" ? "Page name or slug" : "Name or username"}
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
            {(suggestions.data?.users.length ?? 0) + (suggestions.data?.pages.length ?? 0) > 0 && handle.trim().length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
                {suggestions.data?.users.map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => void beginConversation({ username: person.username })}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-900"
                  >
                    <span className="font-medium">{person.firstname} {person.lastname}</span>
                    <span className="text-zinc-500"> @{person.username}</span>
                  </button>
                ))}
                {suggestions.data?.pages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => void beginConversation({ pageSlug: page.slug })}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-900"
                  >
                    <span className="font-medium">{page.name}</span>
                    <span className="text-zinc-500"> /{page.slug}</span>
                  </button>
                ))}
              </div>
            )}
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
          <input
            value={inboxQuery}
            onChange={(event) => setInboxQuery(event.target.value)}
            placeholder="Search conversations"
            className="mt-3 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
          <div className="mt-2 flex gap-1.5">
            {(["all", "unread", "people", "pages"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setInboxFilter(key)}
                className={`px-2.5 py-1 rounded-full text-xs capitalize ${
                  inboxFilter === key ? "bg-[#F7C12B] text-black font-semibold" : "bg-zinc-900 text-zinc-400"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full pb-20 lg:pb-4">
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
              <p className="text-sm">
                {debouncedInboxQuery || inboxFilter !== "all"
                  ? "No conversations match."
                  : "No conversations yet."}
              </p>
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
                    {conversation.pinned ? "Pinned · " : ""}
                    {lastMessageLabel(conversation, user?.id)}
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
              {active.otherPage && active.otherKind === "page" && active.otherPage.isActive ? (
                <button
                  type="button"
                  onClick={() => {
                    if (active.otherPage) navigate(`/pages/${active.otherPage.slug}`);
                  }}
                  className="min-w-0 flex items-center gap-3 text-left"
                >
                  <Avatar conversation={active} />
                  <span className="min-w-0">
                    <p className="font-semibold text-sm truncate">{conversationTitle(active)}</p>
                    <p className="text-zinc-500 text-xs truncate">{subtitle(active)}</p>
                  </span>
                </button>
              ) : (
                <div className="min-w-0 flex items-center gap-3">
                  <Avatar conversation={active} />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{conversationTitle(active)}</p>
                    <p className="text-zinc-500 text-xs truncate">{subtitle(active)}</p>
                  </div>
                </div>
              )}
              <div className="ml-auto flex items-center gap-2 shrink-0">
                {senderPages.length > 0 && (
                  <select
                    value={active.actingAs === "page" ? active.actingPage?.slug ?? "" : ""}
                    onChange={(event) => void switchIdentity(event.target.value)}
                    disabled={start.isPending}
                    aria-label="Replying as"
                    className="max-w-36 bg-zinc-900 border border-zinc-800 rounded-full px-2 py-1 text-xs text-zinc-200"
                  >
                    <option value="">You</option>
                    {senderPages.map((page) => (
                      <option key={page.id} value={page.slug}>
                        {page.name}
                      </option>
                    ))}
                  </select>
                )}
                {active.otherKind === "user" && active.otherUser && (
                  <button
                    type="button"
                    onClick={() => block.mutate({
                      userId: active.otherUser?.id ?? "",
                      blocked: !active.blocked,
                    })}
                    disabled={block.isPending}
                    className="text-xs font-semibold text-zinc-300 border border-zinc-700 rounded-full px-3 py-1 cursor-pointer disabled:opacity-40"
                  >
                    {active.blocked ? "Unblock" : "Block"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => pin.mutate(!active.pinned)}
                  disabled={pin.isPending}
                  className="text-xs font-semibold text-zinc-300 border border-zinc-700 rounded-full px-3 py-1 cursor-pointer disabled:opacity-40"
                >
                  {active.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  type="button"
                  onClick={() => mute.mutate(!active.muted)}
                  disabled={mute.isPending}
                  className="text-xs font-semibold text-zinc-300 border border-zinc-700 rounded-full px-3 py-1 cursor-pointer disabled:opacity-40"
                >
                  {active.muted ? "Unmute" : "Mute"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    hide.mutate(undefined, {
                      onSuccess: () => navigate("/messages"),
                    });
                  }}
                  disabled={hide.isPending}
                  className="text-xs font-semibold text-zinc-300 border border-zinc-700 rounded-full px-3 py-1 cursor-pointer disabled:opacity-40"
                >
                  Hide
                </button>
              </div>
            </header>
            {identityError && (
              <p className="px-4 py-2 text-xs text-red-400 border-b border-zinc-900">{identityError}</p>
            )}
            {otherTyping && (
              <p className="px-4 py-1.5 text-xs text-zinc-400 border-b border-zinc-900">Typing…</p>
            )}

            {active.otherKind === "page" &&
              active.otherPage?.isActive &&
              active.otherPage.workingHours && (
                <HoursNote hours={active.otherPage.workingHours} />
              )}

            <div ref={scroller} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full px-4 py-4 flex flex-col gap-2">
              {thread.hasNextPage && (
                <button
                  onClick={loadOlder}
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
              {messages.map((message, index) => {
                const stamp = dayStamp(message.createdAt);
                const previous = index > 0 ? dayStamp(messages[index - 1]!.createdAt) : "";
                return (
                  <div key={message.id} className="flex flex-col gap-2">
                    {stamp !== previous && (
                      <p className="self-center text-[11px] text-zinc-500 px-2 py-0.5">
                        {dayLabel(message.createdAt)}
                      </p>
                    )}
                    <Bubble
                      message={message}
                      mine={isMine(message)}
                      canChange={
                        isMine(message) &&
                        !message.deleted &&
                        Date.now() - new Date(message.createdAt).getTime() < MESSAGE_CHANGE_WINDOW_MS
                      }
                      confirmDelete={confirmDeleteId === message.id}
                      onReply={() => {
                        setEditing(null);
                        setReportTarget(null);
                        setReplyTarget(message);
                      }}
                      onEdit={() => {
                        setReplyTarget(null);
                        setReportTarget(null);
                        setEditing(message);
                        setDraft(message.body);
                      }}
                      onDelete={() => setConfirmDeleteId(message.id)}
                      onConfirmDelete={() => {
                        remove.mutate(message.id, {
                          onSuccess: () => setConfirmDeleteId(null),
                        });
                      }}
                      onReport={
                        isMine(message) || message.deleted
                          ? undefined
                          : () => {
                              setReplyTarget(null);
                              setEditing(null);
                              setReportTarget(message);
                              setReportReason("spam");
                              setReportDetails("");
                            }
                      }
                    />
                  </div>
                );
              })}
            </div>

            {canSend && active.actingAs === "page" && active.actingPage && (
              <QuickReplies
                page={active.actingPage}
                onPick={(text) =>
                  setDraft((current) => (current.trim() ? `${current.trim()}\n${text}` : text))
                }
              />
            )}

            {editing && (
              <div className="mx-3 mt-2 flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-300">
                <span className="min-w-0 truncate">Editing message</span>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setDraft("");
                  }}
                  className="shrink-0 text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {replyTarget && (
              <div className="mx-3 mt-2 flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-xs text-zinc-300">
                <span className="min-w-0 truncate">Replying to {replyTarget.body}</span>
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="shrink-0 text-zinc-400 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {reportTarget && (
              <form
                className="mx-3 mt-2 flex flex-col gap-2 rounded-xl border border-zinc-800 px-3 py-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  report.mutate(
                    {
                      messageId: reportTarget.id,
                      reason: reportReason,
                      ...(reportDetails.trim() ? { details: reportDetails.trim() } : {}),
                    },
                    { onSuccess: () => setReportTarget(null) },
                  );
                }}
              >
                <p className="text-xs text-zinc-400 truncate">Report: {reportTarget.body}</p>
                <select
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value as ReportReason)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-sm text-white"
                >
                  {REPORT_REASONS.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
                <input
                  value={reportDetails}
                  onChange={(event) => setReportDetails(event.target.value)}
                  maxLength={500}
                  placeholder="Details (optional)"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-sm text-white"
                />
                {report.error && (
                  <p className="text-xs text-red-400">{report.error.message}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={report.isPending}
                    className="text-xs font-semibold text-black bg-[#F7C12B] rounded-full px-3 py-1.5 cursor-pointer disabled:opacity-40"
                  >
                    {report.isPending ? "Sending..." : "Submit report"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportTarget(null)}
                    className="text-xs text-zinc-400 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <form
              className="flex items-end gap-2 px-3 py-3 border-t border-zinc-900"
              onSubmit={(event) => {
                event.preventDefault();
                void submitMessage();
              }}
            >
              <textarea
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  if (event.target.value.trim()) notifyTyping();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submitMessage();
                  }
                }}
                disabled={!canSend && !editing}
                rows={1}
                placeholder={
                  editing
                    ? "Edit message..."
                    : canSend
                    ? "Message..."
                    : active.otherKind === "page"
                      ? "This page can't receive messages"
                      : active.otherUser?.isActive
                        ? "You can't message this user"
                        : "This account can't receive messages"
                }
                className="flex-1 resize-none bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={(!canSend && !editing) || send.isPending || edit.isPending || draft.trim().length === 0}
                className="w-10 h-10 rounded-full bg-[#F7C12B] text-black flex items-center justify-center disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
            {(send.error || edit.error) && (
              <p className="text-red-400 text-xs px-4 pb-3">{send.error?.message ?? edit.error?.message}</p>
            )}
          </>
        )}
      </section>
    </div>
  );
};

const HoursNote = ({ hours }: { hours: NonNullable<ChatPage["workingHours"]> }) => {
  const status = getOpenStatus(hours);
  return (
    <p
      className={`px-4 py-2 text-xs border-b border-zinc-900 ${
        status.isOpen ? "text-emerald-400" : "text-amber-300"
      }`}
    >
      {status.label}
    </p>
  );
};

const QuickReplies = ({
  page,
  onPick,
}: {
  page: ChatPage;
  onPick: (text: string) => void;
}) => {
  const replies: { label: string; text: string }[] = [];
  if (page.workingHours) {
    const today = page.workingHours[getCurrentDayKey()];
    if (today) {
      const status = getOpenStatus(page.workingHours);
      replies.push({
        label: "Hours",
        text: today.isClosed
          ? "We're closed today."
          : `${status.label}. Today ${formatTime(today.open)} – ${formatTime(today.close)}.`,
      });
    }
  }
  const address = [page.address, page.city, page.country].filter(Boolean).join(", ");
  if (address) replies.push({ label: "Address", text: `Our address is ${address}.` });
  if (page.phone) replies.push({ label: "Phone", text: `You can reach us at ${page.phone}.` });
  if (replies.length === 0) return null;

  return (
    <div className="flex gap-2 px-3 pt-3 overflow-x-auto">
      {replies.map((reply) => (
        <button
          key={reply.label}
          type="button"
          onClick={() => onPick(reply.text)}
          className="shrink-0 text-xs font-semibold text-black bg-[#F7C12B] rounded-full px-3 py-1.5 cursor-pointer"
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
};

const Bubble = ({
  message,
  mine,
  canChange,
  confirmDelete,
  onReply,
  onEdit,
  onDelete,
  onConfirmDelete,
  onReport,
}: {
  message: MessageDto;
  mine: boolean;
  canChange: boolean;
  confirmDelete: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onReport?: () => void;
}) => {
  const card = message.share;
  const showBody = !message.deleted && (!card || message.body !== card.title);
  return (
  <div className={`flex flex-col max-w-[78%] ${mine ? "self-end items-end" : "self-start"}`}>
    <div
      className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
        mine ? "bg-[#F7C12B] text-black rounded-br-md" : "bg-zinc-800 text-white rounded-bl-md"
      }`}
    >
      {!message.deleted && message.reply && (
        <span
          className={`block text-xs mb-1 border-l-2 pl-2 ${
            mine ? "border-black/30 text-black/70" : "border-zinc-500 text-zinc-300"
          }`}
        >
          {message.reply.body}
        </span>
      )}
      {message.deleted && <span className="italic">This message was deleted</span>}
      {showBody && <MessageText text={message.body} mine={mine} />}
      {!message.deleted && card && (
        <Link
          to={card.path}
          className={`mt-2 block rounded-xl overflow-hidden border ${
            mine ? "border-black/10 bg-black/10" : "border-zinc-700 bg-zinc-900"
          }`}
        >
          {card.image && (
            <img src={card.image} alt="" className="w-full h-28 object-cover" />
          )}
          <span className="block px-2.5 py-2">
            <span className="block font-semibold text-sm">{card.title}</span>
            {card.subtitle && (
              <span className={`block text-xs ${mine ? "text-black/70" : "text-zinc-400"}`}>
                {card.subtitle}
              </span>
            )}
            {card.price !== undefined && (
              <span className="block text-xs font-semibold">${card.price}</span>
            )}
          </span>
        </Link>
      )}
    </div>
    <span className="text-[10px] text-zinc-500 mt-1 flex items-center gap-2">
      <span>{exactTime(message.createdAt)}</span>
      {message.editedAt && !message.deleted && <span>Edited</span>}
      {mine && !message.deleted && <span>{message.isRead ? "Read" : "Delivered"}</span>}
      {!message.deleted && (
        <button type="button" onClick={onReply} className="cursor-pointer hover:text-zinc-300">
          Reply
        </button>
      )}
      {canChange && (
        <button type="button" onClick={onEdit} className="cursor-pointer hover:text-zinc-300">
          Edit
        </button>
      )}
      {canChange && !confirmDelete && (
        <button type="button" onClick={onDelete} className="cursor-pointer hover:text-zinc-300">
          Delete
        </button>
      )}
      {canChange && confirmDelete && (
        <button type="button" onClick={onConfirmDelete} className="cursor-pointer hover:text-red-400">
          Confirm
        </button>
      )}
      {onReport && (
        <button type="button" onClick={onReport} className="cursor-pointer hover:text-zinc-300">
          Report
        </button>
      )}
    </span>
  </div>
  );
};

export default MessagesPage;
