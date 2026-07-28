import { describe, it, expect } from 'bun:test';
import { GoogleProvider } from '../provider/google-provider';

describe('GoogleProvider - edge cases', () => {
  it('should initialize with minimal config', () => {
    const provider = new GoogleProvider();
    provider.initialize({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'http://localhost/callback',
    });
    expect(provider.name).toBe('google');
  });

  it('should generate state when not provided', () => {
    const provider = new GoogleProvider();
    provider.initialize({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'http://localhost/callback',
    });
    const url = provider.getAuthorizationUrl();
    expect(url.searchParams.get('state')).toBeTruthy();
    expect(url.searchParams.get('nonce')).toBeTruthy();
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
  });

  it('should use prompt param when given', () => {
    const provider = new GoogleProvider();
    provider.initialize({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'http://localhost/callback',
    });
    const url = provider.getAuthorizationUrl({ prompt: 'select_account' });
    expect(url.searchParams.get('prompt')).toBe('select_account');
  });

  it('should reject wrong state', () => {
    const provider = new GoogleProvider();
    provider.initialize({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'http://localhost/callback',
    });
    expect(provider.validateState('real', 'expected')).toBe(false);
  });

  it('should accept matching nonce', () => {
    const provider = new GoogleProvider();
    provider.initialize({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'http://localhost/callback',
    });
    expect(provider.validateNonce('abc', 'abc')).toBe(true);
  });

  it('logout should not throw', async () => {
    const provider = new GoogleProvider();
    provider.initialize({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'http://localhost/callback',
    });
    await provider.logout();
  });
});
