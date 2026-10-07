export interface CommentAuthor {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  avatar?: string;
}

export interface ApiComment {
  _id: string;
  post: string;
  author: CommentAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedComments {
  comments: ApiComment[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
