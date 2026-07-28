import { describe, it, expect } from 'bun:test';
import { GitHubProvider } from '../github-provider';

describe('GitHubProvider', () => {
  const config = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/auth/github/callback',
  };

  it('should have name "github"', () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    expect(provider.name).toBe('github');
  });

  it('should build authorization URL with defaults', () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    const url = provider.getAuthorizationUrl();
    expect(url.toString()).toContain('github.com/login/oauth/authorize');
    expect(url.searchParams.get('client_id')).toBe('test-client-id');
    expect(url.searchParams.get('scope')).toContain('read:user');
  });

  it('should use provided state', () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    const url = provider.getAuthorizationUrl({ state: 'my-state' });
    expect(url.searchParams.get('state')).toBe('my-state');
  });

  it('should use provided scopes', () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    const url = provider.getAuthorizationUrl({ scopes: ['repo'] });
    expect(url.searchParams.get('scope')).toBe('repo');
  });

  it('should validate state correctly', () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    expect(provider.validateState('abc', 'abc')).toBe(true);
    expect(provider.validateState('abc', 'def')).toBe(false);
  });

  it('should always validate nonce (GitHub does not use it)', () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    expect(provider.validateNonce('any', 'any')).toBe(true);
  });

  it('should throw on exchange code failure', async () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    try {
      await provider.exchangeCode({ code: 'bad' });
      expect.unreachable();
    } catch (e: any) {
      expect(e.message).toContain('GitHub token exchange failed');
    }
  });

  it('should throw on refresh token (not supported)', async () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    try {
      await provider.refreshToken({ refreshToken: 'x' });
      expect.unreachable();
    } catch (e: any) {
      expect(e.message).toContain('does not support refresh tokens');
    }
  });

  it('should throw on user fetch with bad token', async () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    try {
      await provider.getUser('bad-token');
      expect.unreachable();
    } catch (e: any) {
      expect(e.message).toContain('GitHub user fetch failed');
    }
  });

  it('logout should not throw', async () => {
    const provider = new GitHubProvider();
    provider.initialize(config);
    await provider.logout();
  });
});
