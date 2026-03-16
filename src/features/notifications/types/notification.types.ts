export type NotificationType =
  | "post_approved"
  | "post_rejected"
  | "new_follower"
  | "new_post"
  | "new_like";

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
  createdAt:    string;
  updatedAt:    string;
}

export interface PaginatedNotifications {
  notifications: ApiNotification[];
  total:         number;
  unreadCount:   number;
  page:          number;
  totalPages:    number;
}