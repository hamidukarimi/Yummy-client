import type { PostType } from "@/features/posts/types/post.types";

export interface PostSearchFilters {
  type?: PostType;
  category?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PageSearchFilters {
  category?: string;
  tag?: string;
}
