import { describe, it, expect } from 'bun:test';
import { AuthConfig } from '../config/auth-config';

describe('AuthConfig', () => {
  it('should apply defaults', () => {
    const config = new AuthConfig({
      jwt: { secret: 'test-secret' },
    });
    expect(config.jwt.algorithm).toBe('HS256');
    expect(config.jwt.expiresIn).toBe('15m');
    expect(config.jwt.refreshExpiresIn).toBe('7d');
    expect(config.jwt.issuer).toBe('wdev-auth');
    expect(config.cookies.secure).toBe(true);
    expect(config.cookies.httpOnly).toBe(true);
    expect(config.cookies.sameSite).toBe('lax');
    expect(config.session.maxAge).toBe(86400);
    expect(config.session.maxSessionsPerUser).toBe(5);
    expect(config.baseUrl).toBe('http://localhost:3000');
  });

  it('should override values', () => {
    const config = new AuthConfig({
      jwt: { secret: 'custom', expiresIn: '5m' },
      cookies: { secure: false, sameSite: 'strict' },
      session: { maxAge: 3600, maxSessionsPerUser: 2 },
      baseUrl: 'https://example.com',
    });
    expect(config.jwt.expiresIn).toBe('5m');
    expect(config.cookies.secure).toBe(false);
    expect(config.cookies.sameSite).toBe('strict');
    expect(config.session.maxAge).toBe(3600);
    expect(config.session.maxSessionsPerUser).toBe(2);
    expect(config.baseUrl).toBe('https://example.com');
  });
});
