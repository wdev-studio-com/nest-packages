export interface SessionModel {
  id: string;
  userId: string;
  provider: string;
  ip?: string | null;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}
