export interface OAuthNonceModel {
  id: string;
  nonce: string;
  provider: string;
  expiresAt: Date;
  createdAt: Date;
}
