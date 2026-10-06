export interface ApiSession {
  id: string;
  userAgent?: string;
  ip?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  isCurrent: boolean;
}
