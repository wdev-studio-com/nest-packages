import { describe, it, expect } from 'bun:test';
import { AuthEvent } from '../enums/auth-event.enum';
import { TokenType } from '../enums/token-type.enum';

describe('auth-types', () => {
  describe('AuthEvent', () => {
    it('should have all events defined', () => {
      expect(AuthEvent.BeforeLogin).toBe('beforeLogin');
      expect(AuthEvent.AfterLogin).toBe('afterLogin');
      expect(AuthEvent.BeforeUserCreate).toBe('beforeUserCreate');
      expect(AuthEvent.AfterUserCreate).toBe('afterUserCreate');
      expect(AuthEvent.BeforeTokenIssued).toBe('beforeTokenIssued');
      expect(AuthEvent.AfterTokenIssued).toBe('afterTokenIssued');
      expect(AuthEvent.BeforeLogout).toBe('beforeLogout');
      expect(AuthEvent.AfterLogout).toBe('afterLogout');
      expect(AuthEvent.Error).toBe('error');
    });
  });

  describe('TokenType', () => {
    it('should have all token types defined', () => {
      expect(TokenType.Access).toBe('access');
      expect(TokenType.Refresh).toBe('refresh');
      expect(TokenType.Id).toBe('id');
    });
  });

  describe('interfaces', () => {
    it('should validate OAuthProvider interface structure', () => {
      const provider: Record<string, unknown> = {
        name: 'test',
        initialize: () => {},
        getAuthorizationUrl: () => new URL('http://localhost'),
        exchangeCode: async () => ({ accessToken: '', refreshToken: '', accessTokenExpiresAt: new Date(), refreshTokenExpiresAt: new Date(), tokenType: 'Bearer' }),
        refreshToken: async () => ({ accessToken: '', refreshToken: '', accessTokenExpiresAt: new Date(), refreshTokenExpiresAt: new Date(), tokenType: 'Bearer' }),
        revokeToken: async () => {},
        getUser: async () => ({ sub: '', provider: 'test' }),
        logout: async () => {},
        validateState: () => true,
        validateNonce: () => true,
      };
      expect(provider.name).toBe('test');
      expect(typeof provider.initialize).toBe('function');
      expect(typeof provider.exchangeCode).toBe('function');
    });
  });
});
