// ─── Post Types ───────────────────────────────────────────────────────────────

export type PostType = "food" | "announcement" | "promotion" | "menu_item";
export type PostStatus = "pending" | "approved" | "rejected";

// ─── Page (populated) ─────────────────────────────────────────────────────────

export interface PostPage {
  _id: string;
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  category: string;
  isVerified: boolean;
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export interface ApiPost {
  _id: string;
  page: PostPage;
  author: string;
  type: PostType;
  title?: string;
  content: string;
  images: string[];
  price?: number;
  tags: string[];
  likes: string[];
  views: number;
  status: PostStatus;
  rejectedReason?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Paginated Posts ──────────────────────────────────────────────────────────

export interface PaginatedPosts {
  posts: ApiPost[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── Create Post Payload ──────────────────────────────────────────────────────

export interface CreatePostPayload {
  page: string;
  type: PostType;
  title?: string;
  content: string;
  images?: string[];
  price?: number;
  tags?: string[];
}

export interface UpdatePostPayload {
  type?: PostType;
  title?: string;
  content?: string;
  images?: string[];
  price?: number;
  tags?: string[];
}
