export interface LoginHistoryModel {
  id: string;
  userId: string;
  provider: string;
  ip?: string | null;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
  success: boolean;
  failureReason?: string | null;
  createdAt: Date;
}
