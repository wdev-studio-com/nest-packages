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
import { GoogleOAuthService } from '../services/google-oauth-service';
import { GoogleUserService } from '../services/google-user-service';

export class GoogleProvider implements OAuthProvider {
  readonly name = 'google';

  private config!: OAuthProviderConfig;
  private oauth!: GoogleOAuthService;
  private userService!: GoogleUserService;

  initialize(config: OAuthProviderConfig): void {
    this.config = config;
    this.oauth = new GoogleOAuthService(config);
    this.userService = new GoogleUserService();
  }

  getAuthorizationUrl(params?: AuthorizationUrlParams): URL {
    return this.oauth.buildAuthorizationUrl(params);
  }

  async exchangeCode(params: ExchangeCodeParams): Promise<TokenPairDto> {
    if (params.state) await this.validateState(params.state, params.state);
    if (params.nonce) await this.validateNonce(params.nonce, params.nonce);

    const tokens = await this.oauth.exchangeCode(params);
    return tokens;
  }

  async refreshToken(params: RefreshTokenParams): Promise<TokenPairDto> {
    return this.oauth.refresh(params);
  }

  async revokeToken(params: RevokeTokenParams): Promise<void> {
    await this.oauth.revoke(params);
  }

  async getUser(accessToken: string): Promise<UserInfoDto> {
    return this.userService.getUser(accessToken);
  }

  async logout(_params?: LogoutParams): Promise<void> {}

  validateState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }

  validateNonce(nonce: string, expectedNonce: string): boolean {
    return nonce === expectedNonce;
  }
}
