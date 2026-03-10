import type { ApiUser } from "@/types/api.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  birthday?: string;
  gender?: "male" | "female" | "other";
  location?: {
    country?: string;
    city?: string;
  };
}

export interface AuthResult {
  user: ApiUser;
  accessToken: string;
}