const BASE = "/api";

export const ENDPOINTS = {
  auth: {
    register:     `${BASE}/users`,
    login:        `${BASE}/sessions`,
    logout:       `${BASE}/logout`,
    logoutAll:    `${BASE}/logout/all`,
    refreshToken: `${BASE}/token`,
  },
  user: {
    me:             `${BASE}/users/me`,
    changePassword: `${BASE}/users/me/password`,
    followedPages:  "/api/users/me/followed-pages",
  },
  pages: {
    create:   `${BASE}/pages`,
    all:      `${BASE}/pages`,
    my:       `${BASE}/pages/my`,
    bySlug:   (slug: string) => `${BASE}/pages/${slug}`,
    follow:   (slug: string) => `${BASE}/pages/${slug}/follow`,
    update: (slug: string) => `/api/pages/${slug}`,
  },

  posts: {
  create:       "/api/posts",
  my:           "/api/posts/my/posts",
  byPage:       (pageId: string) => `/api/posts/page/${pageId}`,
  byId:         (id: string)     => `/api/posts/${id}`,
  like:         (id: string)     => `/api/posts/${id}/like`,
  update:       (id: string)     => `/api/posts/${id}`,
  delete:       (id: string)     => `/api/posts/${id}`,
  adminPending: "/api/posts/admin/pending",
  adminReview:  (id: string)     => `/api/posts/admin/${id}/review`,
},

notifications: {
  all:        "/api/notifications",
  unreadCount: "/api/notifications/unread-count",
  markRead:   (id: string) => `/api/notifications/${id}/read`,
  markAllRead: "/api/notifications/read-all",
  delete:     (id: string) => `/api/notifications/${id}`,
},
search: {
  posts: "/api/posts/search",
  pages: "/api/pages",
},

feed: {
  explore:  "/api/feed/explore",
  forYou:   "/api/feed/for-you",
  tags:     "/api/feed/tags",
},


} as const;