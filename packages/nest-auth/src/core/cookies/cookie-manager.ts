import type { CookieConfig } from '@wdev-studio/nest-auth-types';

export interface SerializedCookie {
  name: string;
  value: string;
  options: CookieConfig;
}

export class CookieManager {
  constructor(private readonly config: CookieConfig) {}

  serialize(name: string, value: string, overrides?: Partial<CookieConfig>): SerializedCookie {
    return {
      name,
      value,
      options: { ...this.config, ...overrides },
    };
  }

  serializeSession(sessionId: string): SerializedCookie {
    return this.serialize(this.config.name ?? 'auth_session', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  clearSession(): SerializedCookie {
    return this.serialize(this.config.name ?? 'auth_session', '', {
      maxAge: 0,
    });
  }
}
