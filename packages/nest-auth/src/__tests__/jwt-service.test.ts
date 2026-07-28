import { describe, it, expect, beforeAll } from 'bun:test';
import { JwtService } from '../core/jwt/jwt-service';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeAll(() => {
    jwtService = new JwtService({
      secret: 'test-secret-key-at-least-32-chars-long!',
      algorithm: 'HS256',
      expiresIn: '15m',
      refreshExpiresIn: '7d',
      issuer: 'test',
    });
  });

  it('should sign a token', async () => {
    const token = await jwtService.sign({ sub: 'user-123', email: 'test@test.com' });
    expect(token).toBeTruthy();
    expect(token.split('.')).toHaveLength(3);
  });

  it('should verify a valid token', async () => {
    const token = await jwtService.sign({ sub: 'user-123' });
    const payload = await jwtService.verify(token);
    expect(payload.sub).toBe('user-123');
  });

  it('should reject invalid token', async () => {
    expect(jwtService.verify('invalid.token.here')).rejects.toThrow();
  });

  it('should decode a token without verification', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.fake';
    const decoded = jwtService.decode(token);
    expect(decoded?.sub).toBe('user-123');
  });

  it('should revoke a token by jti', async () => {
    const token = await jwtService.sign({ sub: 'user-123' });
    const payload = await jwtService.verify(token);
    await jwtService.revoke(payload.jti!);
    expect(jwtService.isRevoked(payload.jti!)).toBe(true);
    expect(jwtService.verify(token)).rejects.toThrow('Token revoked');
  });

  it('should create token pair', async () => {
    const pair = await jwtService.createTokenPair({ sub: 'user-123', email: 'test@test.com' });
    expect(pair.accessToken).toBeTruthy();
    expect(pair.refreshToken).toBeTruthy();
    expect(pair.accessTokenExpiresAt > new Date()).toBe(true);
    expect(pair.refreshTokenExpiresAt > new Date()).toBe(true);
  });
});
