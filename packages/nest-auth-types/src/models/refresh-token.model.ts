export interface RefreshTokenModel {
  id: string;
  userId: string;
  tokenHash: string;
  family?: string | null;
  isRevoked: boolean;
  revokedAt?: Date | null;
  expiresAt: Date;
  createdAt: Date;
}
