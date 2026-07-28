import type {
  OAuthProvider,
  OAuthProviderConfig,
  AuthorizationUrlParams,
  ExchangeCodeParams,
  RefreshTokenParams,
  RevokeTokenParams,
  LogoutParams,
  TokenPairDto,
  UserInfoDto,
} from '@wdev-studio/nest-auth-types';
import { randomBytes } from 'node:crypto';

interface GitHubTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface GitHubUserResponse {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  html_url?: string;
}

interface GitHubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility?: string;
}

export class GitHubProvider implements OAuthProvider {
  readonly name = 'github';

  private config!: OAuthProviderConfig;
  private readonly authUrl = 'https://github.com/login/oauth/authorize';
  private readonly tokenUrl = 'https://github.com/login/oauth/access_token';
  private readonly userUrl = 'https://api.github.com/user';
  private readonly emailsUrl = 'https://api.github.com/user/emails';

  initialize(config: OAuthProviderConfig): void {
    this.config = {
      scopes: ['read:user', 'user:email'],
      ...config,
    };
  }

  getAuthorizationUrl(params?: AuthorizationUrlParams): URL {
    const url = new URL(this.authUrl);
    const state = params?.state ?? this.randomString(32);

    url.searchParams.set('client_id', this.config.clientId);
    url.searchParams.set('redirect_uri', params?.redirectUri ?? this.config.redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', (params?.scopes ?? this.config.scopes ?? []).join(' '));

    return url;
  }

  async exchangeCode(params: ExchangeCodeParams): Promise<TokenPairDto> {
    if (params.state) this.validateState(params.state, params.state);

    const body = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code: params.code,
      redirect_uri: params.redirectUri ?? this.config.redirectUri,
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`GitHub token exchange failed: ${response.status}`);
    }

    const data = (await response.json()) as GitHubTokenResponse;
    const now = Date.now();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? '',
      accessTokenExpiresAt: new Date(now + (data.expires_in ?? 3600) * 1000),
      refreshTokenExpiresAt: data.refresh_token
        ? new Date(now + (data.expires_in ?? 3600) * 1000 * 30)
        : new Date(now + (data.expires_in ?? 3600) * 1000),
      scope: data.scope?.split(',') ?? [],
      tokenType: data.token_type ?? 'Bearer',
    };
  }

  async refreshToken(_params: RefreshTokenParams): Promise<TokenPairDto> {
    throw new Error('GitHub does not support refresh tokens via OAuth2');
  }

  async revokeToken(_params: RevokeTokenParams): Promise<void> {
    // GitHub OAuth does not provide a token revocation endpoint
  }

  async getUser(accessToken: string): Promise<UserInfoDto> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'User-Agent': 'wdev-studio-nest-auth',
    };

    const res = await fetch(this.userUrl, { headers });
    if (!res.ok) throw new Error(`GitHub user fetch failed: ${res.status}`);

    const data = (await res.json()) as GitHubUserResponse;

    let email = data.email;
    let emailVerified = false;

    if (!email) {
      const emailsRes = await fetch(this.emailsUrl, { headers });
      if (emailsRes.ok) {
        const emails = (await emailsRes.json()) as GitHubEmailResponse[];
        const primary = emails.find((e) => e.primary);
        email = primary?.email ?? emails[0]?.email;
        emailVerified = primary?.verified ?? false;
      }
    }

    return {
      sub: String(data.id),
      name: data.name ?? data.login,
      email,
      emailVerified,
      picture: data.avatar_url,
      provider: this.name,
      rawAttributes: data as unknown as Record<string, unknown>,
    };
  }

  async logout(_params?: LogoutParams): Promise<void> {}

  validateState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }

  validateNonce(_nonce: string, _expectedNonce: string): boolean {
    return true; // GitHub does not use nonce
  }

  private randomString(length: number): string {
    return randomBytes(length).toString('hex').slice(0, length);
  }
}
