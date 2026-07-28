export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  scope?: string[];
  tokenType: string;
}
