import { describe, it, expect, beforeAll } from 'bun:test';
import { OAuthManager } from '../oauth/oauth-manager';
import { ProviderRegistry } from '../registry/provider-registry';
import type { OAuthProvider, OAuthProviderConfig, AuthorizationUrlParams, ExchangeCodeParams, RefreshTokenParams, RevokeTokenParams, LogoutParams, TokenPairDto, UserInfoDto } from '@wdev-studio/nest-auth-types';

class MockOAuthProvider implements OAuthProvider {
  readonly name = 'mock';
  initialize(_config: OAuthProviderConfig): void {}
  getAuthorizationUrl(_params?: AuthorizationUrlParams): URL { return new URL('https://example.com/auth'); }
  async exchangeCode(_params: ExchangeCodeParams): Promise<TokenPairDto> {
    return { accessToken: 'at', refreshToken: 'rt', accessTokenExpiresAt: new Date(), refreshTokenExpiresAt: new Date(), tokenType: 'Bearer' };
  }
  async refreshToken(_params: RefreshTokenParams): Promise<TokenPairDto> {
    return { accessToken: 'at2', refreshToken: 'rt2', accessTokenExpiresAt: new Date(), refreshTokenExpiresAt: new Date(), tokenType: 'Bearer' };
  }
  async revokeToken(_params: RevokeTokenParams): Promise<void> {}
  async getUser(_accessToken: string): Promise<UserInfoDto> { return { sub: '123', provider: 'mock' }; }
  async logout(_params?: LogoutParams): Promise<void> {}
  validateState(_state: string, _expectedState: string): boolean { return true; }
  validateNonce(_nonce: string, _expectedNonce: string): boolean { return true; }
}

describe('OAuthManager', () => {
  let manager: OAuthManager;

  beforeAll(() => {
    const registry = new ProviderRegistry();
    const provider = new MockOAuthProvider();
    provider.initialize({ clientId: 'id', clientSecret: 'secret', redirectUri: 'http://localhost/callback' });
    registry.register(provider);
    manager = new OAuthManager(registry);
  });

  it('should build authorization URL', () => {
    const url = manager.getAuthorizationUrl('mock');
    expect(url.toString()).toContain('example.com');
  });

  it('should exchange code', async () => {
    const tokens = await manager.exchangeCode('mock', { code: 'abc' });
    expect(tokens.accessToken).toBe('at');
  });

  it('should refresh token', async () => {
    const tokens = await manager.refreshToken('mock', { refreshToken: 'rt' });
    expect(tokens.accessToken).toBe('at2');
  });

  it('should get user', async () => {
    const user = await manager.getUser('mock', 'at');
    expect(user.sub).toBe('123');
  });

  it('should throw for unknown provider', () => {
    expect(() => manager.getAuthorizationUrl('unknown')).toThrow();
  });
});
