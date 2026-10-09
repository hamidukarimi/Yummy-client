import type { WorkingHours } from "@/features/pages/types/page.types";

export interface MessageUser {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  avatar?: string;
  isActive: boolean;
}

export interface LastMessagePreview {
  text: string;
  senderId: string;
  senderPageId?: string;
  createdAt: string;
}

export interface ChatPage {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  isActive: boolean;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  workingHours?: WorkingHours;
}

export interface ChatShare {
  kind: "post" | "menu_item" | "page";
  id?: string;
  pageSlug?: string;
  section?: string;
  name?: string;
}

export interface MessageShareCard {
  kind: "post" | "menu_item" | "page";
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
  path: string;
}

export interface ConversationSummary {
  id: string;
  otherUser: MessageUser | null;
  otherPage: ChatPage | null;
  otherKind: "user" | "page";
  actingAs: "user" | "page";
  actingPage: ChatPage | null;
  lastMessage: LastMessagePreview | null;
  unreadCount: number;
  lastMessageAt: string;
  canMessage: boolean;
  muted: boolean;
  pinned: boolean;
  blocked: boolean;
  otherOnline?: boolean;
  otherLastSeen?: string;
}

export interface MessageReplyPreview {
  id: string;
  body: string;
  senderId: string;
  senderPageId?: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderPageId?: string;
  body: string;
  share?: MessageShareCard;
  reply?: MessageReplyPreview;
  createdAt: string;
  isRead: boolean;
  editedAt?: string;
  deleted?: boolean;
  linkPreview?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
  };
  reactions?: { emoji: string; count: number; reacted: boolean }[];
}

export interface StartConversationInput {
  username?: string;
  pageSlug?: string;
  asPageSlug?: string;
}

export type InboxFilter = "all" | "unread" | "people" | "pages";

export interface RecipientSuggestions {
  users: MessageUser[];
  pages: ChatPage[];
}

export interface ConversationPage {
  conversations: ConversationSummary[];
  nextCursor: string | null;
}

export interface MessagePage {
  conversation: ConversationSummary;
  messages: MessageDto[];
  nextCursor: string | null;
}
