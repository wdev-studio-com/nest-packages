export interface OAuthStateModel {
  id: string;
  state: string;
  provider: string;
  codeChallenge?: string | null;
  codeChallengeMethod?: string | null;
  redirectUri?: string | null;
  expiresAt: Date;
  createdAt: Date;
}
