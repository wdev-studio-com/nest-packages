import { describe, it, expect } from 'bun:test';
import { HooksEngine } from '../hooks/hooks-engine';

describe('HooksEngine', () => {
  it('should call onUserCreated', async () => {
    const engine = new HooksEngine();
    let called = false;
    engine.setHooks({
      onUserCreated: () => { called = true; },
    });
    await engine.onUserCreated({ id: '1', email: 'a@b.com', emailVerified: false, isActive: true, createdAt: new Date(), updatedAt: new Date() });
    expect(called).toBe(true);
  });

  it('should call onLogin', async () => {
    const engine = new HooksEngine();
    let user: any;
    engine.setHooks({
      onLogin: (u, p) => { user = { id: u.id, provider: p }; },
    });
    await engine.onLogin({ id: '1', email: 'a@b.com' } as any, 'google');
    expect(user?.id).toBe('1');
    expect(user?.provider).toBe('google');
  });

  it('should call onUserInfo and allow modification', async () => {
    const engine = new HooksEngine();
    engine.setHooks({
      onUserInfo: (info) => ({ ...info, name: 'Modified' }),
    });
    const result = await engine.onUserInfo({ sub: '123', provider: 'google' });
    expect(result?.name).toBe('Modified');
  });

  it('should not fail without hooks set', async () => {
    const engine = new HooksEngine();
    await engine.onUserCreated({ id: '1', email: 'a@b.com', emailVerified: false, isActive: true, createdAt: new Date(), updatedAt: new Date() });
    await engine.onLogout({ id: '1', email: 'a@b.com' } as any);
  });
});
