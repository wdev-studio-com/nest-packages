import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import type { JwtConfig, TokenType } from '@wdev-studio/nest-auth-types';
import { randomUUID } from 'node:crypto';

export interface JwtPayload {
  sub: string;
  email?: string;
  provider?: string;
  type?: TokenType;
  iat?: number;
  exp?: number;
  jti?: string;
  [key: string]: unknown;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export class JwtService {
  private readonly blacklist = new Set<string>();

  constructor(private readonly config: JwtConfig) {}

  private getKey(): Uint8Array {
    return new TextEncoder().encode(this.config.secret);
  }

  async sign(payload: JwtPayload, expiresIn?: string): Promise<string> {
    const jti = randomUUID();
    const exp = expiresIn ?? this.config.expiresIn ?? '15m';

    let jwt = new SignJWT({ ...payload, jti } as unknown as Record<string, unknown>)
      .setProtectedHeader({
        alg: this.config.algorithm ?? 'HS256',
        typ: 'JWT',
      })
      .setJti(jti)
      .setIssuedAt()
      .setSubject(payload.sub)
      .setExpirationTime(exp);

    if (this.config.issuer) jwt = jwt.setIssuer(this.config.issuer);

    return jwt.sign(this.getKey());
  }

  async verify<T extends JwtPayload = JwtPayload>(token: string): Promise<T> {
    const { payload } = await jwtVerify(token, this.getKey(), {
      algorithms: [this.config.algorithm ?? 'HS256'],
      issuer: this.config.issuer,
    });
    const result = payload as unknown as T;
    if (result.jti && this.blacklist.has(result.jti)) {
      throw new Error('Token revoked');
    }
    return result;
  }

  decode<T extends JwtPayload = JwtPayload>(token: string): T | null {
    try {
      return decodeJwt(token) as unknown as T;
    } catch {
      return null;
    }
  }

  async revoke(jti: string): Promise<void> {
    this.blacklist.add(jti);
  }

  isRevoked(jti: string): boolean {
    return this.blacklist.has(jti);
  }

  async createTokenPair(payload: { sub: string; email?: string; provider?: string }): Promise<TokenPair> {
    const accessToken = await this.sign(
      { ...payload, type: 'access' as TokenType },
      this.config.expiresIn ?? '15m',
    );
    const refreshToken = await this.sign(
      { ...payload, type: 'refresh' as TokenType },
      this.config.refreshExpiresIn ?? '7d',
    );

    const now = Date.now();
    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(now + parseMs(this.config.expiresIn ?? '15m')),
      refreshTokenExpiresAt: new Date(now + parseMs(this.config.refreshExpiresIn ?? '7d')),
    };
  }
}

function parseMs(duration: string): number {
  const match = duration.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) return 900000;
  const val = parseInt(match[1]!, 10);
  const unit = match[2]!;
  const map: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return val * (map[unit] ?? 60000);
}
