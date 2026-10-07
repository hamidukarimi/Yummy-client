export type NotificationType =
  | "post_approved"
  | "post_rejected"
  | "new_follower"
  | "new_post"
  | "new_like"
  | "new_comment"
  | "new_message";

export interface RelatedPage {
  _id:  string;
  slug: string;
}

export interface ApiNotification {
  _id:          string;
  recipient:    string;
  type:         NotificationType;
  message:      string;
  isRead:       boolean;
  relatedPost?: string;
  relatedPage?: string | RelatedPage;
  relatedConversation?: string;
  createdAt:    string;
  updatedAt:    string;
}

export type NotificationPreferences = Record<NotificationType, boolean>;

export interface PaginatedNotifications {
  notifications: ApiNotification[];
  total:         number;
  unreadCount:   number;
  page:          number;
  totalPages:    number;
}