import { describe, it, expect } from 'bun:test';
import { AdapterRegistry } from '../registry/adapter-registry';
import type { DatabaseAdapter, UserModel, AccountModel, SessionModel } from '@wdev-studio/nest-auth-types';

describe('AdapterRegistry', () => {
  it('should be empty initially', () => {
    const registry = new AdapterRegistry();
    expect(registry.has()).toBe(false);
    expect(registry.get()).toBeUndefined();
  });

  it('should register an adapter', () => {
    const registry = new AdapterRegistry();
    const adapter: DatabaseAdapter = {
      createUser: async (d) => ({ id: '1', email: d.email!, emailVerified: false, isActive: true, createdAt: new Date(), updatedAt: new Date() }),
      findUser: async () => null,
      findUserByEmail: async () => null,
      findUserByProvider: async () => null,
      updateUser: async (id, d) => ({ id, email: d.email!, emailVerified: false, isActive: true, createdAt: new Date(), updatedAt: new Date() }),
      deleteUser: async () => {},
      createAccount: async (d) => ({ id: '1', userId: d.userId!, provider: d.provider!, providerAccountId: d.providerAccountId!, createdAt: new Date(), updatedAt: new Date() }),
      findAccountsByUserId: async () => [],
      deleteAccount: async () => {},
      createSession: async (d) => ({ id: '1', userId: d.userId!, provider: d.provider!, isActive: true, createdAt: new Date(), expiresAt: new Date(), lastActivityAt: new Date() }),
      findSession: async () => null,
      findSessionsByUserId: async () => [],
      updateSession: async (id) => ({ id, userId: '1', provider: 'test', isActive: true, createdAt: new Date(), expiresAt: new Date(), lastActivityAt: new Date() }),
      deleteSession: async () => {},
      deleteSessionsByUserId: async () => {},
      createRefreshToken: async (d) => ({ id: '1', userId: d.userId!, tokenHash: d.tokenHash!, isRevoked: false, expiresAt: new Date(), createdAt: new Date() }),
      findRefreshTokenByHash: async () => null,
      revokeRefreshToken: async () => {},
      revokeRefreshTokensByUserId: async () => {},
      createOAuthState: async (d) => ({ id: '1', state: d.state!, provider: d.provider!, expiresAt: new Date(), createdAt: new Date() }),
      findOAuthState: async () => null,
      deleteOAuthState: async () => {},
      createOAuthNonce: async (d) => ({ id: '1', nonce: d.nonce!, provider: d.provider!, expiresAt: new Date(), createdAt: new Date() }),
      findOAuthNonce: async () => null,
      deleteOAuthNonce: async () => {},
      createLoginHistory: async (d) => ({ id: '1', userId: d.userId!, provider: d.provider!, success: true, createdAt: new Date() }),
      findLoginHistoryByUserId: async () => [],
    };
    registry.register(adapter);
    expect(registry.has()).toBe(true);
    expect(registry.get()).toBe(adapter);
  });
});
