export interface AccountModel {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  scope?: string[];
  tokenType?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
