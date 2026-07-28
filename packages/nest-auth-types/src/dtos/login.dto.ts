export interface LoginDto {
  provider: string;
  code: string;
  redirectUri?: string;
  codeVerifier?: string;
  state?: string;
  nonce?: string;
  ip?: string;
  userAgent?: string;
}
