import type { DatabaseAdapter, SessionModel, SessionConfig } from '@wdev-studio/nest-auth-types';
import { randomUUID } from 'node:crypto';

export class SessionService {
  constructor(
    private readonly adapter: DatabaseAdapter,
    private readonly config?: SessionConfig,
  ) {}

  async create(
    userId: string,
    provider: string,
    metadata?: { ip?: string; userAgent?: string; deviceFingerprint?: string },
  ): Promise<SessionModel> {
    const maxSessions = this.config?.maxSessionsPerUser ?? 5;
    const existing = await this.adapter.findSessionsByUserId(userId);
    const active = existing.filter((s) => s.isActive);

    if (active.length >= maxSessions) {
      const oldest = active.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
      if (oldest) await this.adapter.deleteSession(oldest.id);
    }

    const maxAge = (this.config?.maxAge ?? 86400) * 1000;
    const now = new Date();

    return this.adapter.createSession({
      id: randomUUID(),
      userId,
      provider,
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
      deviceFingerprint: metadata?.deviceFingerprint,
      isActive: true,
      createdAt: now,
      expiresAt: new Date(now.getTime() + maxAge),
      lastActivityAt: now,
    });
  }

  async validate(sessionId: string): Promise<SessionModel | null> {
    const session = await this.adapter.findSession(sessionId);
    if (!session?.isActive || session.expiresAt < new Date()) return null;
    return session;
  }

  async refresh(sessionId: string): Promise<SessionModel> {
    const session = await this.validate(sessionId);
    if (!session) throw new Error('Invalid session');
    const maxAge = (this.config?.maxAge ?? 86400) * 1000;
    return this.adapter.updateSession(sessionId, {
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + maxAge),
    });
  }

  async revoke(sessionId: string): Promise<void> {
    await this.adapter.updateSession(sessionId, { isActive: false });
  }

  async revokeAll(userId: string): Promise<void> {
    await this.adapter.deleteSessionsByUserId(userId);
  }
}
