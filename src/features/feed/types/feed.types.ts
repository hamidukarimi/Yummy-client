export interface FeedTag {
  label: string;
  type:  "tag" | "category";
  count: number;
}

export interface FeedFilter {
  type:  "all" | "for-you" | "tag" | "category";
  value?: string;
  label:  string;
}

export interface PaginatedFeed {
  posts:      import("@/features/posts/types/post.types").ApiPost[];
  total:      number;
  page:       number;
  totalPages: number;
  hasMore:    boolean;
}