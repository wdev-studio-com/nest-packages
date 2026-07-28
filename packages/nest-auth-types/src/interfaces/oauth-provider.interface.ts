import type { UserInfoDto } from '../dtos/user-info.dto';
import type { TokenPairDto } from '../dtos/token-pair.dto';

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
  [key: string]: unknown;
}

export interface AuthorizationUrlParams {
  redirectUri?: string;
  state?: string;
  nonce?: string;
  scopes?: string[];
  codeChallenge?: string;
  codeChallengeMethod?: 'S256' | 'plain';
  responseType?: 'code';
  prompt?: 'none' | 'consent' | 'select_account';
}

export interface ExchangeCodeParams {
  code: string;
  redirectUri?: string;
  codeVerifier?: string;
  state?: string;
  nonce?: string;
}

export interface RefreshTokenParams {
  refreshToken: string;
  scope?: string[];
}

export interface RevokeTokenParams {
  token: string;
  tokenTypeHint?: 'access_token' | 'refresh_token';
}

export interface LogoutParams {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  global?: boolean;
}

export interface OAuthProvider {
  readonly name: string;

  initialize(config: OAuthProviderConfig): void;

  getAuthorizationUrl(params?: AuthorizationUrlParams): URL;

  exchangeCode(params: ExchangeCodeParams): Promise<TokenPairDto>;

  refreshToken(params: RefreshTokenParams): Promise<TokenPairDto>;

  revokeToken(params: RevokeTokenParams): Promise<void>;

  getUser(accessToken: string): Promise<UserInfoDto>;

  logout(params?: LogoutParams): Promise<void>;

  validateState(state: string, expectedState: string): boolean | Promise<boolean>;

  validateNonce(nonce: string, expectedNonce: string): boolean | Promise<boolean>;
}
