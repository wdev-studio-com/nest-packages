import { describe, it, expect, beforeAll } from 'bun:test';
import { SessionService } from '../session/session-service';
import type { DatabaseAdapter } from '@wdev-studio/nest-auth-types';

describe('SessionService', () => {
  let adapter: DatabaseAdapter;

  beforeAll(() => {
    adapter = {
      createUser: async () => { throw new Error('not used'); },
      findUser: async () => null,
      findUserByEmail: async () => null,
      findUserByProvider: async () => null,
      updateUser: async () => { throw new Error('not used'); },
      deleteUser: async () => {},
      createAccount: async () => { throw new Error('not used'); },
      findAccountsByUserId: async () => [],
      deleteAccount: async () => {},
      createSession: async (d) => ({
        id: 'session-1',
        userId: d.userId!,
        provider: d.provider ?? 'test',
        ip: d.ip,
        userAgent: d.userAgent,
        deviceFingerprint: null,
        metadata: null,
        isActive: d.isActive ?? true,
        createdAt: new Date(),
        expiresAt: d.expiresAt ?? new Date(Date.now() + 86400000),
        lastActivityAt: d.lastActivityAt ?? new Date(),
      }),
      findSession: async (id) => ({
        id,
        userId: 'user-1',
        provider: 'test',
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        lastActivityAt: new Date(),
      }),
      findSessionsByUserId: async () => [],
      updateSession: async (id, data) => ({
        id,
        userId: 'user-1',
        provider: 'test',
        isActive: data.isActive ?? true,
        ip: data.ip,
        userAgent: data.userAgent,
        deviceFingerprint: null,
        metadata: null,
        createdAt: new Date(),
        expiresAt: data.expiresAt ?? new Date(Date.now() + 86400000),
        lastActivityAt: data.lastActivityAt ?? new Date(),
      }),
      deleteSession: async () => {},
      deleteSessionsByUserId: async () => {},
      createRefreshToken: async () => { throw new Error('not used'); },
      findRefreshTokenByHash: async () => null,
      revokeRefreshToken: async () => {},
      revokeRefreshTokensByUserId: async () => {},
      createOAuthState: async () => { throw new Error('not used'); },
      findOAuthState: async () => null,
      deleteOAuthState: async () => {},
      createOAuthNonce: async () => { throw new Error('not used'); },
      findOAuthNonce: async () => null,
      deleteOAuthNonce: async () => {},
      createLoginHistory: async () => { throw new Error('not used'); },
      findLoginHistoryByUserId: async () => [],
    };
  });

  it('should create a session', async () => {
    const service = new SessionService(adapter);
    const session = await service.create('user-1', 'google', { ip: '127.0.0.1' });
    expect(session.userId).toBe('user-1');
    expect(session.ip).toBe('127.0.0.1');
    expect(session.isActive).toBe(true);
  });

  it('should validate an active session', async () => {
    const service = new SessionService(adapter);
    const session = await service.validate('session-1');
    expect(session).not.toBeNull();
  });

  it('should revoke a session', async () => {
    const service = new SessionService(adapter);
    await service.revoke('session-1');
  });

  it('should refresh a session', async () => {
    const service = new SessionService(adapter);
    const session = await service.refresh('session-1');
    expect(session.lastActivityAt).toBeTruthy();
  });
});
