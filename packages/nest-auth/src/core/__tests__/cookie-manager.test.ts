import { describe, it, expect } from 'bun:test';
import { CookieManager } from '../cookies/cookie-manager';

describe('CookieManager', () => {
  it('should serialize cookie', () => {
    const manager = new CookieManager({ httpOnly: true, sameSite: 'lax' });
    const cookie = manager.serialize('session', 'abc');
    expect(cookie.name).toBe('session');
    expect(cookie.value).toBe('abc');
    expect(cookie.options.httpOnly).toBe(true);
    expect(cookie.options.sameSite).toBe('lax');
  });

  it('should serialize session cookie with name from config', () => {
    const manager = new CookieManager({ name: 'my_session', httpOnly: true, sameSite: 'lax' });
    const cookie = manager.serializeSession('abc');
    expect(cookie.name).toBe('my_session');
    expect(cookie.options.httpOnly).toBe(true);
    expect(cookie.options.sameSite).toBe('lax');
  });

  it('should use "auth_session" as default cookie name', () => {
    const manager = new CookieManager({});
    const cookie = manager.serializeSession('abc');
    expect(cookie.name).toBe('auth_session');
  });

  it('should clear session cookie', () => {
    const manager = new CookieManager({});
    const cookie = manager.clearSession();
    expect(cookie.value).toBe('');
    expect(cookie.options.maxAge).toBe(0);
  });

  it('should merge overrides', () => {
    const manager = new CookieManager({ secure: true, sameSite: 'strict' });
    const cookie = manager.serialize('x', 'y', { httpOnly: false });
    expect(cookie.options.secure).toBe(true);
    expect(cookie.options.sameSite).toBe('strict');
    expect(cookie.options.httpOnly).toBe(false);
  });
});
