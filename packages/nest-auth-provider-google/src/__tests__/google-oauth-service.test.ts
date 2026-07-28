import { describe, it, expect } from 'bun:test';
import { GoogleOAuthService } from '../services/google-oauth-service';

describe('GoogleOAuthService', () => {
  const config = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/auth/google/callback',
    scopes: ['openid', 'profile', 'email'],
  };

  function createService() {
    return new GoogleOAuthService(config);
  }

  describe('buildAuthorizationUrl', () => {
    it('should build a valid Google OAuth URL', () => {
      const service = createService();
      const url = service.buildAuthorizationUrl();
      expect(url.toString()).toContain('accounts.google.com');
      expect(url.searchParams.get('client_id')).toBe('test-client-id');
      expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/auth/google/callback');
      expect(url.searchParams.get('response_type')).toBe('code');
      expect(url.searchParams.get('scope')).toBe('openid profile email');
      expect(url.searchParams.get('code_challenge_method')).toBe('S256');
      expect(url.searchParams.get('access_type')).toBe('offline');
    });

    it('should include state and nonce when provided', () => {
      const service = createService();
      const url = service.buildAuthorizationUrl({ state: 'my-state', nonce: 'my-nonce' });
      expect(url.searchParams.get('state')).toBe('my-state');
      expect(url.searchParams.get('nonce')).toBe('my-nonce');
    });

    it('should use provided codeChallenge', () => {
      const service = createService();
      const url = service.buildAuthorizationUrl({ codeChallenge: 'challenge-value' });
      expect(url.searchParams.get('code_challenge')).toBe('challenge-value');
    });

    it('should use provided scopes over defaults', () => {
      const service = createService();
      const url = service.buildAuthorizationUrl({ scopes: ['email'] });
      expect(url.searchParams.get('scope')).toBe('email');
    });

    it('should support prompt parameter', () => {
      const service = createService();
      const url = service.buildAuthorizationUrl({ prompt: 'none' });
      expect(url.searchParams.get('prompt')).toBe('none');
    });
  });

  describe('exchangeCode', () => {
    it('should throw when fetch fails', async () => {
      const service = createService();
      // No mock fetch needed - will fail with network error
      // but we expect a specific error shape
      try {
        await service.exchangeCode({ code: 'invalid' });
        expect.unreachable();
      } catch (e: any) {
        expect(e.message).toContain('Google token exchange failed');
      }
    });
  });

  describe('refresh', () => {
    it('should throw when fetch fails', async () => {
      const service = createService();
      try {
        await service.refresh({ refreshToken: 'invalid' });
        expect.unreachable();
      } catch (e: any) {
        expect(e.message).toContain('Google token refresh failed');
      }
    });
  });
});
