// ─── Generic API Response Wrapper ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// ─── API Error Response (from server) ─────────────────────────────────────────

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
  stack?: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface ApiLocation {
  city?: string;
  country?: string;
}

export interface ApiUser {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  location?: ApiLocation;
  avatar?: string;
  following: string[];
  role: "user" | "admin";
  isBlocked: boolean;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthData {
  user: ApiUser;
  accessToken: string;
}