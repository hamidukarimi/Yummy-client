// ─── Base ─────────────────────────────────────────────────────────────────────

const BASE = "/api";

// ─── Endpoints ────────────────────────────────────────────────────────────────

export const ENDPOINTS = {

  auth: {
    register:        `${BASE}/users`,
    login:           `${BASE}/sessions`,
    logout:          `${BASE}/logout`,
    logoutAll:       `${BASE}/logout/all`,
    refreshToken:    `${BASE}/token`,
  },

  user: {
    me:             `${BASE}/users/me`,
    changePassword:  `${BASE}/users/me/password`,
  },

} as const;