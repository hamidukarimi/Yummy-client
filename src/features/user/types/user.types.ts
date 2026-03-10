// ─── Request Payloads ─────────────────────────────────────────────────────────

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ─── Response Data ────────────────────────────────────────────────────────────

export interface ChangePasswordResult {
  message: string;
}