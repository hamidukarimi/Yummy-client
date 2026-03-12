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
  },
  pages: {
    create:   `${BASE}/pages`,
    all:      `${BASE}/pages`,
    my:       `${BASE}/pages/my`,
    bySlug:   (slug: string) => `${BASE}/pages/${slug}`,
    follow:   (slug: string) => `${BASE}/pages/${slug}/follow`,
  },
} as const;