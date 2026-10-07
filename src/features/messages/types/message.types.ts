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
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  otherUser: MessageUser | null;
  lastMessage: LastMessagePreview | null;
  unreadCount: number;
  lastMessageAt: string;
  canMessage: boolean;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  isRead: boolean;
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
