import type {
  OAuthProviderConfig,
  AuthorizationUrlParams,
  ExchangeCodeParams,
  RefreshTokenParams,
  RevokeTokenParams,
  TokenPairDto,
} from '@wdev-studio/nest-auth-types';
import { randomBytes, createHash } from 'node:crypto';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export class GoogleOAuthService {
  private readonly authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly revokeUrl = 'https://oauth2.googleapis.com/revoke';

  constructor(private readonly config: OAuthProviderConfig) {}

  buildAuthorizationUrl(params?: AuthorizationUrlParams): URL {
    const url = new URL(this.authUrl);
    const scopes = params?.scopes ?? this.config.scopes ?? ['openid', 'profile', 'email'];
    const state = params?.state ?? this.randomString(32);
    const nonce = params?.nonce ?? this.randomString(32);
    const codeChallenge = params?.codeChallenge ?? this.generateCodeChallenge(this.randomString(64));

    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', params?.redirectUri ?? this.config.redirectUri);
    url.searchParams.set('response_type', params?.responseType ?? 'code');
    url.searchParams.set('scope', scopes.join(' '));
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', params?.prompt ?? 'consent');

    return url;
  }

  async exchangeCode(params: ExchangeCodeParams): Promise<TokenPairDto> {
    const body = new URLSearchParams({
      code: params.code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: params.redirectUri ?? this.config.redirectUri,
      grant_type: 'authorization_code',
    });

    if (params.codeVerifier) body.set('code_verifier', params.codeVerifier);

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google token exchange failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as GoogleTokenResponse;
    const now = Date.now();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? '',
      idToken: data.id_token,
      accessTokenExpiresAt: new Date(now + data.expires_in * 1000),
      refreshTokenExpiresAt: data.refresh_token
        ? new Date(now + data.expires_in * 1000 * 30)
        : new Date(now + data.expires_in * 1000),
      scope: data.scope.split(' '),
      tokenType: data.token_type,
    };
  }

  async refresh(params: RefreshTokenParams): Promise<TokenPairDto> {
    const body = new URLSearchParams({
      refresh_token: params.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'refresh_token',
    });

    if (params.scope) body.set('scope', params.scope.join(' '));

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google token refresh failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as GoogleTokenResponse;
    const now = Date.now();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? params.refreshToken,
      idToken: data.id_token,
      accessTokenExpiresAt: new Date(now + data.expires_in * 1000),
      refreshTokenExpiresAt: data.refresh_token
        ? new Date(now + data.expires_in * 1000 * 30)
        : new Date(now + data.expires_in * 1000),
      scope: data.scope.split(' '),
      tokenType: data.token_type,
    };
  }

  async revoke(params: RevokeTokenParams): Promise<void> {
    const body = new URLSearchParams({ token: params.token });
    if (params.tokenTypeHint) body.set('token_type_hint', params.tokenTypeHint);

    const response = await fetch(this.revokeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok && response.status !== 200) {
      throw new Error(`Google token revocation failed: ${response.status}`);
    }
  }

  private randomString(length: number): string {
    return randomBytes(length).toString('base64url').slice(0, length);
  }

  private generateCodeChallenge(verifier: string): string {
    const hash = createHash('sha256').update(verifier).digest();
    return hash.toString('base64url');
  }
}
