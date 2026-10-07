export interface PostInsight {
  _id: string;
  title?: string;
  type: string;
  status: string;
  isPublished: boolean;
  views: number;
  likeCount: number;
  createdAt: string;
}

export interface PageInsights {
  followersCount: number;
  postCount: number;
  totalViews: number;
  totalLikes: number;
  posts: PostInsight[];
}
