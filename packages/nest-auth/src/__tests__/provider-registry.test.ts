import { describe, it, expect } from 'bun:test';
import { ProviderRegistry } from '../core/registry/provider-registry';
import type { OAuthProvider, OAuthProviderConfig, AuthorizationUrlParams, ExchangeCodeParams, RefreshTokenParams, RevokeTokenParams, LogoutParams, TokenPairDto, UserInfoDto } from '@wdev-studio/nest-auth-types';

class MockProvider implements OAuthProvider {
  readonly name = 'mock';
  initialize(_config: OAuthProviderConfig): void {}
  getAuthorizationUrl(_params?: AuthorizationUrlParams): URL { return new URL('http://localhost'); }
  async exchangeCode(_params: ExchangeCodeParams): Promise<TokenPairDto> { return { accessToken: '', refreshToken: '', accessTokenExpiresAt: new Date(), refreshTokenExpiresAt: new Date(), tokenType: 'Bearer' }; }
  async refreshToken(_params: RefreshTokenParams): Promise<TokenPairDto> { return { accessToken: '', refreshToken: '', accessTokenExpiresAt: new Date(), refreshTokenExpiresAt: new Date(), tokenType: 'Bearer' }; }
  async revokeToken(_params: RevokeTokenParams): Promise<void> {}
  async getUser(_accessToken: string): Promise<UserInfoDto> { return { sub: '123', provider: 'mock' }; }
  async logout(_params?: LogoutParams): Promise<void> {}
  validateState(_state: string, _expectedState: string): boolean { return true; }
  validateNonce(_nonce: string, _expectedNonce: string): boolean { return true; }
}

describe('ProviderRegistry', () => {
  it('should register a provider', () => {
    const registry = new ProviderRegistry();
    registry.register(new MockProvider());
    expect(registry.has('mock')).toBe(true);
  });

  it('should throw on duplicate registration', () => {
    const registry = new ProviderRegistry();
    registry.register(new MockProvider());
    expect(() => registry.register(new MockProvider())).toThrow();
  });

  it('should get a registered provider', () => {
    const registry = new ProviderRegistry();
    registry.register(new MockProvider());
    const provider = registry.get('mock');
    expect(provider?.name).toBe('mock');
  });

  it('should throw for unregistered provider', () => {
    const registry = new ProviderRegistry();
    expect(() => registry.get('nonexistent')).toThrow();
  });

  it('should list all providers', () => {
    const registry = new ProviderRegistry();
    registry.register(new MockProvider());
    expect(registry.getNames()).toEqual(['mock']);
    expect(registry.getAll()).toHaveLength(1);
  });
});
