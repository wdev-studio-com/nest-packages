import { describe, it, expect, beforeAll } from 'bun:test';
import { GoogleProvider } from '../provider/google-provider';

describe('GoogleProvider', () => {
  let provider: GoogleProvider;

  beforeAll(() => {
    provider = new GoogleProvider();
    provider.initialize({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost:3000/auth/google/callback',
      scopes: ['openid', 'profile', 'email'],
    });
  });

  it('should have name "google"', () => {
    expect(provider.name).toBe('google');
  });

  it('should build authorization URL', () => {
    const url = provider.getAuthorizationUrl();
    expect(url.toString()).toContain('accounts.google.com');
    expect(url.searchParams.get('client_id')).toBe('test-client-id');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('access_type')).toBe('offline');
  });

  it('should include PKCE params in authorization URL', () => {
    const url = provider.getAuthorizationUrl({
      codeChallenge: 'test-challenge',
      codeChallengeMethod: 'S256',
    });
    expect(url.searchParams.get('code_challenge')).toBe('test-challenge');
  });

  it('should validate state correctly', () => {
    expect(provider.validateState('abc', 'abc')).toBe(true);
    expect(provider.validateState('abc', 'def')).toBe(false);
  });

  it('should validate nonce correctly', () => {
    expect(provider.validateNonce('abc', 'abc')).toBe(true);
    expect(provider.validateNonce('abc', 'def')).toBe(false);
  });
});
