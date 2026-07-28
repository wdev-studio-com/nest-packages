import type { AuthModuleConfig, JwtConfig, CookieConfig, SessionConfig } from '@wdev-studio/nest-auth-types';

export class AuthConfig {
  public readonly jwt: JwtConfig;
  public readonly cookies: CookieConfig;
  public readonly session: SessionConfig;
  public readonly baseUrl: string;

  constructor(config: AuthModuleConfig) {
    this.jwt = {
      secret: config.jwt.secret,
      privateKey: config.jwt.privateKey,
      publicKey: config.jwt.publicKey,
      algorithm: config.jwt.algorithm ?? 'HS256',
      expiresIn: config.jwt.expiresIn ?? '15m',
      refreshExpiresIn: config.jwt.refreshExpiresIn ?? '7d',
      issuer: config.jwt.issuer ?? 'wdev-auth',
    };
    this.cookies = {
      secure: config.cookies?.secure ?? true,
      httpOnly: config.cookies?.httpOnly ?? true,
      sameSite: config.cookies?.sameSite ?? 'lax',
      domain: config.cookies?.domain,
      path: config.cookies?.path ?? '/',
      maxAge: config.cookies?.maxAge ?? 86400,
    };
    this.session = {
      maxAge: config.session?.maxAge ?? 86400,
      maxSessionsPerUser: config.session?.maxSessionsPerUser ?? 5,
      cookieName: config.session?.cookieName ?? 'auth_session',
    };
    this.baseUrl = config.baseUrl ?? 'http://localhost:3000';
  }
}
