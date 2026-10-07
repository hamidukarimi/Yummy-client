export interface ReviewAuthor {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  avatar?: string;
}

export interface ApiReview {
  _id: string;
  page: string;
  author: ReviewAuthor;
  rating: number;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReviews {
  reviews: ApiReview[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  averageRating: number | null;
  ratingCount: number;
  mine: ApiReview | null;
}
