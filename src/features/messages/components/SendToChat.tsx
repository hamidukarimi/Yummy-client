import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Send, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { parseApiError } from "@/utils/errorHandler";
import { sendMessageService } from "@/features/messages/services/message.service";
import {
  conversationTitle,
  messageKeys,
  useConversations,
} from "@/features/messages/hooks/useMessages";
import type { ChatShare, ConversationSummary } from "@/features/messages/types/message.types";

interface SendToChatProps {
  share: ChatShare;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

const SendToChat = ({
  share,
  label = "Send in chat",
  className,
  iconOnly = false,
  open,
  onOpenChange,
  hideTrigger = false,
}: SendToChatProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [localOpen, setLocalOpen] = useState(false);
  const visible = open ?? localOpen;

  const setVisible = (next: boolean) => {
    if (open === undefined) setLocalOpen(next);
    onOpenChange?.(next);
  };

  const requestOpen = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setVisible(true);
  };

  return (
    <>
      {!hideTrigger && (
        <button
          type="button"
          onClick={requestOpen}
          className={className ?? "text-sm font-semibold text-[#F7C12B] cursor-pointer"}
          aria-label="Send in chat"
        >
          {iconOnly ? <Send size={16} /> : label}
        </button>
      )}
      {visible && <ChatPicker share={share} onClose={() => setVisible(false)} />}
    </>
  );
};

const ChatPicker = ({
  share,
  onClose,
}: {
  share: ChatShare;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const conversations = useConversations();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const items = conversations.data?.pages.flatMap((page) => page.conversations) ?? [];

  const sendTo = async (conversation: ConversationSummary) => {
    if (!conversation.canMessage || pendingId) return;
    setError("");
    setPendingId(conversation.id);
    try {
      await sendMessageService(
        conversation.id,
        "",
        conversation.actingAs === "page" ? conversation.actingPage?.id : undefined,
        share,
      );
      void queryClient.invalidateQueries({ queryKey: messageKeys.all });
      onClose();
    } catch (caught) {
      setError(parseApiError(caught).message);
      setPendingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <p className="text-white font-semibold text-sm">Send in chat</p>
          <button type="button" onClick={onClose} className="text-zinc-400" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {conversations.isLoading && (
            <p className="text-zinc-500 text-sm text-center py-8">Loading chats...</p>
          )}
          {conversations.isError && (
            <p className="text-red-400 text-sm text-center py-8">Could not load chats.</p>
          )}
          {!conversations.isLoading && items.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-zinc-400 text-sm">Start a chat in Messages first.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/messages");
                }}
                className="text-[#F7C12B] text-sm font-semibold mt-3 cursor-pointer"
              >
                Open Messages
              </button>
            </div>
          )}
          {items.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              disabled={!conversation.canMessage || pendingId !== null}
              onClick={() => void sendTo(conversation)}
              className="w-full text-left px-4 py-3 border-b border-zinc-900 hover:bg-zinc-900 disabled:opacity-50 cursor-pointer"
            >
              <p className="text-white text-sm font-medium truncate">
                {conversationTitle(conversation)}
              </p>
              <p className="text-zinc-500 text-xs truncate">
                {pendingId === conversation.id
                  ? "Sending..."
                  : conversation.canMessage
                    ? "Send here"
                    : "Unavailable"}
              </p>
            </button>
          ))}
          {conversations.hasNextPage && (
            <button
              type="button"
              onClick={() => void conversations.fetchNextPage()}
              disabled={conversations.isFetchingNextPage}
              className="w-full text-xs text-zinc-400 py-3 cursor-pointer"
            >
              {conversations.isFetchingNextPage ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
        {error && <p className="text-red-400 text-xs px-4 py-3">{error}</p>}
      </div>
    </div>
  );
};

export default SendToChat;
