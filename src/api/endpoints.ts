const BASE = "/api";

export const ENDPOINTS = {
  auth: {
    register: `${BASE}/users`,
    login: `${BASE}/sessions`,
    logout: `${BASE}/logout`,
    logoutAll: `${BASE}/logout/all`,
    refreshToken: `${BASE}/token`,
    sessions: `${BASE}/sessions`,
    revokeSession: (id: string) => `${BASE}/sessions/${id}`,
    logoutOtherDevices: `${BASE}/sessions/others`,
  },
  user: {
    me: `${BASE}/users/me`,
    changePassword: `${BASE}/users/me/password`,
    followedPages: "/api/users/me/followed-pages",
    savedPosts: "/api/users/me/saved",
    updateProfile: "/api/users/me",
  },
  pages: {
    create: `${BASE}/pages`,
    all: `${BASE}/pages`,
    my: `${BASE}/pages/my`,
    bySlug: (slug: string) => `${BASE}/pages/${slug}`,
    follow: (slug: string) => `${BASE}/pages/${slug}/follow`,
    update: (slug: string) => `/api/pages/${slug}`,
    requestVerification: (slug: string) =>
      `${BASE}/pages/${slug}/verification`,
    pendingVerifications: `${BASE}/pages/admin/verification-requests`,
    reviewVerification: (id: string) =>
      `${BASE}/pages/admin/${id}/verification`,
    menu: (slug: string) => `${BASE}/pages/${slug}/menu`,
    insights: (slug: string) => `${BASE}/pages/${slug}/insights`,
    reviews: (slug: string) => `${BASE}/pages/${slug}/reviews`,
    review: (slug: string, reviewId: string) =>
      `${BASE}/pages/${slug}/reviews/${reviewId}`,
    reportReview: (slug: string, reviewId: string) =>
      `${BASE}/pages/${slug}/reviews/${reviewId}/report`,
  },

  posts: {
    create: "/api/posts",
    my: "/api/posts/my/posts",
    byPage: (pageId: string) => `/api/posts/page/${pageId}`,
    byId: (id: string) => `/api/posts/${id}`,
    like: (id: string) => `/api/posts/${id}/like`,
    update: (id: string) => `/api/posts/${id}`,
    delete: (id: string) => `/api/posts/${id}`,
    adminPending: "/api/posts/admin/pending",
    adminReview: (id: string) => `/api/posts/admin/${id}/review`,
    report: (id: string) => `/api/posts/${id}/report`,
    comments: (id: string) => `/api/posts/${id}/comments`,
    comment: (id: string, commentId: string) =>
      `/api/posts/${id}/comments/${commentId}`,
    reportComment: (id: string, commentId: string) =>
      `/api/posts/${id}/comments/${commentId}/report`,
    adminReports: "/api/posts/admin/reports",
    reviewReport: (id: string) => `/api/posts/admin/reports/${id}`,
  },

  notifications: {
    all: "/api/notifications",
    unreadCount: "/api/notifications/unread-count",
    preferences: "/api/notifications/preferences",
    markRead: (id: string) => `/api/notifications/${id}/read`,
    markAllRead: "/api/notifications/read-all",
    delete: (id: string) => `/api/notifications/${id}`,
  },
  search: {
    posts: "/api/posts/search",
    pages: "/api/pages",
  },

  messages: {
    conversations: "/api/messages/conversations",
    thread: (id: string) => `/api/messages/conversations/${id}/messages`,
    read: (id: string) => `/api/messages/conversations/${id}/read`,
    unreadCount: "/api/messages/unread-count",
    suggestions: "/api/messages/suggestions",
  },

  feed: {
    explore: "/api/feed/explore",
    forYou: "/api/feed/for-you",
    tags: "/api/feed/tags",
  },

  saved: {
    toggle: (postId: string) => `/api/users/me/saved/${postId}`,
    all: "/api/users/me/saved",
    collections: "/api/users/me/collections",
    collection: (id: string) => `/api/users/me/collections/${id}`,
    collectionPost: (id: string, postId: string) =>
      `/api/users/me/collections/${id}/posts/${postId}`,
  },
} as const;
