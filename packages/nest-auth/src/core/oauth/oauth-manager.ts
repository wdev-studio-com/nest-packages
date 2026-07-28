import type { OAuthProvider, AuthorizationUrlParams, ExchangeCodeParams, RefreshTokenParams, RevokeTokenParams, LogoutParams, TokenPairDto, UserInfoDto } from '@wdev-studio/nest-auth-types';
import { ProviderRegistry } from '../registry/provider-registry';

export class OAuthManager {
  constructor(private readonly registry: ProviderRegistry) {}

  getAuthorizationUrl(provider: string, params?: AuthorizationUrlParams): URL {
    return this.registry.get(provider).getAuthorizationUrl(params);
  }

  async exchangeCode(provider: string, params: ExchangeCodeParams): Promise<TokenPairDto> {
    return this.registry.get(provider).exchangeCode(params);
  }

  async refreshToken(provider: string, params: RefreshTokenParams): Promise<TokenPairDto> {
    return this.registry.get(provider).refreshToken(params);
  }

  async revokeToken(provider: string, params: RevokeTokenParams): Promise<void> {
    return this.registry.get(provider).revokeToken(params);
  }

  async getUser(provider: string, accessToken: string): Promise<UserInfoDto> {
    return this.registry.get(provider).getUser(accessToken);
  }

  async logout(provider: string, params?: LogoutParams): Promise<void> {
    return this.registry.get(provider).logout(params);
  }
}
