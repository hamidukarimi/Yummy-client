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
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderPageId?: string;
  body: string;
  createdAt: string;
  isRead: boolean;
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
