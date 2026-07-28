import { describe, it, expect, beforeAll } from 'bun:test';
import { PrismaAdapter } from '../adapter/prisma-adapter';

function createMockPrisma() {
  const store = {
    users: new Map<string, any>(),
    accounts: new Map<string, any>(),
    sessions: new Map<string, any>(),
    refreshTokens: new Map<string, any>(),
    oAuthStates: new Map<string, any>(),
    oAuthNonces: new Map<string, any>(),
    loginHistories: new Map<string, any>(),
  };

  return {
    user: {
      create: async ({ data }: { data: any }) => {
        const id = data.id ?? crypto.randomUUID();
        const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        store.users.set(id, record);
        return record;
      },
      findUnique: async ({ where }: { where: any }) => {
        if (where.id) return store.users.get(where.id) ?? null;
        if (where.email) {
          for (const u of store.users.values()) {
            if (u.email === where.email) return u;
          }
        }
        return null;
      },
      update: async ({ where, data }: { where: any; data: any }) => {
        const existing = store.users.get(where.id);
        if (!existing) throw new Error('Not found');
        const updated = { ...existing, ...data, updatedAt: new Date() };
        store.users.set(where.id, updated);
        return updated;
      },
      delete: async ({ where }: { where: any }) => {
        store.users.delete(where.id);
      },
    },
    account: {
      create: async ({ data }: { data: any }) => {
        const id = data.id ?? crypto.randomUUID();
        const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
        store.accounts.set(id, record);
        return record;
      },
      findUnique: async ({ where }: { where: any }) => {
        if (where.id) return store.accounts.get(where.id) ?? null;
        if (where.provider_providerAccountId) {
          const { provider, providerAccountId } = where.provider_providerAccountId;
          for (const a of store.accounts.values()) {
            if (a.provider === provider && a.providerAccountId === providerAccountId) {
              const user = store.users.get(a.userId);
              return { ...a, user: user ?? null };
            }
          }
        }
        return null;
      },
      findMany: async ({ where }: { where: any }) => {
        return Array.from(store.accounts.values()).filter(a => a.userId === where.userId);
      },
      delete: async ({ where }: { where: any }) => {
        store.accounts.delete(where.id);
      },
    },
    session: {
      create: async ({ data }: { data: any }) => {
        const id = data.id ?? crypto.randomUUID();
        const record = { id, ...data, createdAt: new Date(), lastActivityAt: new Date() };
        store.sessions.set(id, record);
        return record;
      },
      findUnique: async ({ where }: { where: any }) => {
        return store.sessions.get(where.id) ?? null;
      },
      findMany: async ({ where }: { where: any }) => {
        return Array.from(store.sessions.values()).filter(s => s.userId === where.userId);
      },
      update: async ({ where, data }: { where: any; data: any }) => {
        const existing = store.sessions.get(where.id);
        if (!existing) throw new Error('Not found');
        const updated = { ...existing, ...data };
        store.sessions.set(where.id, updated);
        return updated;
      },
      delete: async ({ where }: { where: any }) => {
        store.sessions.delete(where.id);
      },
      deleteMany: async ({ where }: { where: any }) => {
        if (where.userId) {
          for (const [id, s] of store.sessions) {
            if (s.userId === where.userId) store.sessions.delete(id);
          }
        }
      },
    },
    refreshToken: {
      create: async ({ data }: { data: any }) => {
        const id = data.id ?? crypto.randomUUID();
        const record = { id, ...data, createdAt: new Date() };
        store.refreshTokens.set(id, record);
        return record;
      },
      findUnique: async ({ where }: { where: any }) => {
        if (where.tokenHash) {
          for (const t of store.refreshTokens.values()) {
            if (t.tokenHash === where.tokenHash) return t;
          }
        }
        return store.refreshTokens.get(where.id) ?? null;
      },
      findMany: async ({ where }: { where: any }) => {
        return Array.from(store.refreshTokens.values()).filter(t => t.userId === where.userId);
      },
      update: async ({ where, data }: { where: any; data: any }) => {
        const existing = store.refreshTokens.get(where.id);
        if (!existing) throw new Error('Not found');
        const updated = { ...existing, ...data };
        store.refreshTokens.set(where.id, updated);
        return updated;
      },
      updateMany: async ({ where, data }: { where: any; data: any }) => {
        for (const t of store.refreshTokens.values()) {
          if (t.userId === where.userId && !t.isRevoked) {
            Object.assign(t, data);
          }
        }
        return { count: 0 };
      },
    },
    oAuthState: {
      create: async ({ data }: { data: any }) => {
        const id = data.id ?? crypto.randomUUID();
        const record = { id, ...data, createdAt: new Date() };
        store.oAuthStates.set(id, record);
        return record;
      },
      findUnique: async ({ where }: { where: any }) => {
        if (where.state) {
          for (const s of store.oAuthStates.values()) {
            if (s.state === where.state) return s;
          }
        }
        return store.oAuthStates.get(where.id) ?? null;
      },
      delete: async ({ where }: { where: any }) => {
        store.oAuthStates.delete(where.id);
      },
      deleteMany: async ({ where }: { where: any }) => {
        if (where.expiresAt?.lt) {
          const now = where.expiresAt.lt;
          for (const [id, s] of store.oAuthStates) {
            if (s.expiresAt < now) store.oAuthStates.delete(id);
          }
        }
      },
    },
    oAuthNonce: {
      create: async ({ data }: { data: any }) => {
        const id = data.id ?? crypto.randomUUID();
        const record = { id, ...data, createdAt: new Date() };
        store.oAuthNonces.set(id, record);
        return record;
      },
      findUnique: async ({ where }: { where: any }) => {
        if (where.nonce) {
          for (const n of store.oAuthNonces.values()) {
            if (n.nonce === where.nonce) return n;
          }
        }
        return store.oAuthNonces.get(where.id) ?? null;
      },
      delete: async ({ where }: { where: any }) => {
        store.oAuthNonces.delete(where.id);
      },
    },
    loginHistory: {
      create: async ({ data }: { data: any }) => {
        const id = data.id ?? crypto.randomUUID();
        const record = { id, ...data, createdAt: new Date() };
        store.loginHistories.set(id, record);
        return record;
      },
      findMany: async ({ where, orderBy }: { where: any; orderBy?: any }) => {
        let results = Array.from(store.loginHistories.values()).filter(h => h.userId === where.userId);
        if (orderBy?.createdAt === 'desc') results.reverse();
        return results;
      },
    },
  } as any;
}

describe('PrismaAdapter', () => {
  let adapter: PrismaAdapter;

  beforeAll(() => {
    const prisma = createMockPrisma();
    adapter = new PrismaAdapter(prisma);
  });

  describe('User', () => {
    it('should create and find user', async () => {
      const user = await adapter.createUser({ email: 'test@example.com', name: 'Test' });
      expect(user.id).toBeTruthy();
      expect(user.email).toBe('test@example.com');

      const found = await adapter.findUser(user.id);
      expect(found?.email).toBe('test@example.com');
    });

    it('should find user by email', async () => {
      const user = await adapter.createUser({ email: 'find@example.com' });
      const found = await adapter.findUserByEmail('find@example.com');
      expect(found?.id).toBe(user.id);
    });

    it('should update user', async () => {
      const user = await adapter.createUser({ email: 'update@example.com' });
      const updated = await adapter.updateUser(user.id, { name: 'Updated' });
      expect(updated.name).toBe('Updated');
    });

    it('should delete user', async () => {
      const user = await adapter.createUser({ email: 'delete@example.com' });
      await adapter.deleteUser(user.id);
      const found = await adapter.findUser(user.id);
      expect(found).toBeNull();
    });
  });

  describe('Account', () => {
    it('should create account and find by provider', async () => {
      const user = await adapter.createUser({ email: 'account-test@example.com' });
      const account = await adapter.createAccount({
        userId: user.id,
        provider: 'google',
        providerAccountId: 'google-123',
      });
      expect(account.id).toBeTruthy();

      const result = await adapter.findUserByProvider('google', 'google-123');
      expect(result?.user.email).toBe('account-test@example.com');
    });

    it('should find accounts by userId', async () => {
      const user = await adapter.createUser({ email: 'multi-account@example.com' });
      await adapter.createAccount({ userId: user.id, provider: 'google', providerAccountId: 'g1' });
      await adapter.createAccount({ userId: user.id, provider: 'github', providerAccountId: 'gh1' });
      const accounts = await adapter.findAccountsByUserId(user.id);
      expect(accounts).toHaveLength(2);
    });
  });

  describe('Session', () => {
    it('should create, find, update and delete session', async () => {
      const user = await adapter.createUser({ email: 'session-test@example.com' });
      const session = await adapter.createSession({
        userId: user.id,
        provider: 'google',
        expiresAt: new Date(Date.now() + 86400000),
      });
      expect(session.isActive).toBe(true);

      const found = await adapter.findSession(session.id);
      expect(found?.id).toBe(session.id);

      const updated = await adapter.updateSession(session.id, { isActive: false });
      expect(updated.isActive).toBe(false);

      await adapter.deleteSession(session.id);
      const deleted = await adapter.findSession(session.id);
      expect(deleted).toBeNull();
    });

    it('should find sessions by userId', async () => {
      const user = await adapter.createUser({ email: 'multi-session@example.com' });
      await adapter.createSession({ userId: user.id, provider: 'google', expiresAt: new Date(Date.now() + 86400000) });
      await adapter.createSession({ userId: user.id, provider: 'google', expiresAt: new Date(Date.now() + 86400000) });
      const sessions = await adapter.findSessionsByUserId(user.id);
      expect(sessions).toHaveLength(2);
    });

    it('should delete all sessions for a user', async () => {
      const user = await adapter.createUser({ email: 'del-sessions@example.com' });
      await adapter.createSession({ userId: user.id, provider: 'google', expiresAt: new Date(Date.now() + 86400000) });
      await adapter.deleteSessionsByUserId(user.id);
      const sessions = await adapter.findSessionsByUserId(user.id);
      expect(sessions).toHaveLength(0);
    });
  });

  describe('RefreshToken', () => {
    it('should create and find by hash', async () => {
      const user = await adapter.createUser({ email: 'rt-test@example.com' });
      const token = await adapter.createRefreshToken({
        userId: user.id,
        tokenHash: 'hash123',
        expiresAt: new Date(Date.now() + 86400000),
      });
      const found = await adapter.findRefreshTokenByHash('hash123');
      expect(found?.id).toBe(token.id);
    });

    it('should revoke token', async () => {
      const user = await adapter.createUser({ email: 'revoke-test@example.com' });
      const token = await adapter.createRefreshToken({
        userId: user.id,
        tokenHash: 'revoke-hash',
        expiresAt: new Date(Date.now() + 86400000),
      });
      await adapter.revokeRefreshToken(token.id);
      const found = await adapter.findRefreshTokenByHash('revoke-hash');
      expect(found?.isRevoked).toBe(true);
    });
  });

  describe('OAuthState', () => {
    it('should create and find state', async () => {
      const state = await adapter.createOAuthState({
        state: 'state-abc',
        provider: 'google',
        expiresAt: new Date(Date.now() + 3600000),
      });
      const found = await adapter.findOAuthState('state-abc');
      expect(found?.id).toBe(state.id);
    });

    it('should delete state', async () => {
      const state = await adapter.createOAuthState({
        state: 'state-del',
        provider: 'google',
        expiresAt: new Date(Date.now() + 3600000),
      });
      await adapter.deleteOAuthState(state.id);
      const found = await adapter.findOAuthState('state-del');
      expect(found).toBeNull();
    });
  });

  describe('OAuthNonce', () => {
    it('should create and find nonce', async () => {
      const nonce = await adapter.createOAuthNonce({
        nonce: 'nonce-abc',
        provider: 'google',
        expiresAt: new Date(Date.now() + 3600000),
      });
      const found = await adapter.findOAuthNonce('nonce-abc');
      expect(found?.id).toBe(nonce.id);
    });
  });

  describe('LoginHistory', () => {
    it('should create and find login history', async () => {
      const user = await adapter.createUser({ email: 'login-hist@example.com' });
      const record = await adapter.createLoginHistory({
        userId: user.id,
        provider: 'google',
        success: true,
      });
      expect(record.id).toBeTruthy();
      const history = await adapter.findLoginHistoryByUserId(user.id);
      expect(history.length).toBeGreaterThan(0);
    });
  });
});
