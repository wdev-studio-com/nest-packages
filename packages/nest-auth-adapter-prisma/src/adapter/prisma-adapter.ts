import type { DatabaseAdapter } from '@wdev-studio/nest-auth-types';
import type {
  UserModel,
  AccountModel,
  SessionModel,
  RefreshTokenModel,
  OAuthStateModel,
  OAuthNonceModel,
  LoginHistoryModel,
} from '@wdev-studio/nest-auth-types';
import type { PrismaClient } from '@prisma/client';

export class PrismaAdapter implements DatabaseAdapter {
  constructor(private readonly prisma: PrismaClient) {}

  async createUser(data: Partial<UserModel>): Promise<UserModel> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email!,
        name: data.name,
        picture: data.picture,
        locale: data.locale,
        emailVerified: data.emailVerified ?? false,
        isActive: data.isActive ?? true,
        lastLoginAt: data.lastLoginAt,
      },
    });
    return user as unknown as UserModel;
  }

  async findUser(id: string): Promise<UserModel | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user as unknown as UserModel | null;
  }

  async findUserByEmail(email: string): Promise<UserModel | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user as unknown as UserModel | null;
  }

  async findUserByProvider(
    provider: string,
    providerAccountId: string,
  ): Promise<{ user: UserModel; account: AccountModel } | null> {
    const account = await this.prisma.account.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true },
    });
    if (!account) return null;
    return {
      user: account.user as unknown as UserModel,
      account: account as unknown as AccountModel,
    };
  }

  async updateUser(id: string, data: Partial<UserModel>): Promise<UserModel> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        picture: data.picture,
        locale: data.locale,
        emailVerified: data.emailVerified,
        isActive: data.isActive,
        lastLoginAt: data.lastLoginAt,
      },
    });
    return user as unknown as UserModel;
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async createAccount(data: Partial<AccountModel>): Promise<AccountModel> {
    const account = await this.prisma.account.create({
      data: {
        userId: data.userId!,
        provider: data.provider!,
        providerAccountId: data.providerAccountId!,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        idToken: data.idToken,
        scope: data.scope ?? [],
        tokenType: data.tokenType,
        expiresAt: data.expiresAt,
      },
    });
    return account as unknown as AccountModel;
  }

  async findAccountsByUserId(userId: string): Promise<AccountModel[]> {
    const accounts = await this.prisma.account.findMany({ where: { userId } });
    return accounts as unknown as AccountModel[];
  }

  async deleteAccount(id: string): Promise<void> {
    await this.prisma.account.delete({ where: { id } });
  }

  async createSession(data: Partial<SessionModel>): Promise<SessionModel> {
    const session = await this.prisma.session.create({
      data: {
        userId: data.userId!,
        provider: data.provider!,
        ip: data.ip,
        userAgent: data.userAgent,
        deviceFingerprint: data.deviceFingerprint,
        isActive: data.isActive ?? true,
        expiresAt: data.expiresAt!,
        lastActivityAt: data.lastActivityAt ?? new Date(),
      },
    });
    return session as unknown as SessionModel;
  }

  async findSession(id: string): Promise<SessionModel | null> {
    const session = await this.prisma.session.findUnique({ where: { id } });
    return session as unknown as SessionModel | null;
  }

  async findSessionsByUserId(userId: string): Promise<SessionModel[]> {
    const sessions = await this.prisma.session.findMany({ where: { userId } });
    return sessions as unknown as SessionModel[];
  }

  async updateSession(id: string, data: Partial<SessionModel>): Promise<SessionModel> {
    const session = await this.prisma.session.update({
      where: { id },
      data: {
        isActive: data.isActive,
        lastActivityAt: data.lastActivityAt,
        expiresAt: data.expiresAt,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    });
    return session as unknown as SessionModel;
  }

  async deleteSession(id: string): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  async deleteSessionsByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { userId } });
  }

  async createRefreshToken(data: Partial<RefreshTokenModel>): Promise<RefreshTokenModel> {
    const token = await this.prisma.refreshToken.create({
      data: {
        userId: data.userId!,
        tokenHash: data.tokenHash!,
        family: data.family,
        isRevoked: data.isRevoked ?? false,
        expiresAt: data.expiresAt!,
      },
    });
    return token as unknown as RefreshTokenModel;
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenModel | null> {
    const token = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    return token as unknown as RefreshTokenModel | null;
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  async revokeRefreshTokensByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true, revokedAt: new Date() },
    });
  }

  async createOAuthState(data: Partial<OAuthStateModel>): Promise<OAuthStateModel> {
    const state = await this.prisma.oAuthState.create({
      data: {
        state: data.state!,
        provider: data.provider!,
        codeChallenge: data.codeChallenge,
        codeChallengeMethod: data.codeChallengeMethod,
        redirectUri: data.redirectUri,
        expiresAt: data.expiresAt!,
      },
    });
    return state as unknown as OAuthStateModel;
  }

  async findOAuthState(state: string): Promise<OAuthStateModel | null> {
    const result = await this.prisma.oAuthState.findUnique({ where: { state } });
    return result as unknown as OAuthStateModel | null;
  }

  async deleteOAuthState(id: string): Promise<void> {
    await this.prisma.oAuthState.delete({ where: { id } });
  }

  async createOAuthNonce(data: Partial<OAuthNonceModel>): Promise<OAuthNonceModel> {
    const nonce = await this.prisma.oAuthNonce.create({
      data: {
        nonce: data.nonce!,
        provider: data.provider!,
        expiresAt: data.expiresAt!,
      },
    });
    return nonce as unknown as OAuthNonceModel;
  }

  async findOAuthNonce(nonce: string): Promise<OAuthNonceModel | null> {
    const result = await this.prisma.oAuthNonce.findUnique({ where: { nonce } });
    return result as unknown as OAuthNonceModel | null;
  }

  async deleteOAuthNonce(id: string): Promise<void> {
    await this.prisma.oAuthNonce.delete({ where: { id } });
  }

  async createLoginHistory(data: Partial<LoginHistoryModel>): Promise<LoginHistoryModel> {
    const record = await this.prisma.loginHistory.create({
      data: {
        userId: data.userId!,
        provider: data.provider!,
        ip: data.ip,
        userAgent: data.userAgent,
        deviceFingerprint: data.deviceFingerprint,
        success: data.success ?? true,
        failureReason: data.failureReason,
      },
    });
    return record as unknown as LoginHistoryModel;
  }

  async findLoginHistoryByUserId(userId: string): Promise<LoginHistoryModel[]> {
    const records = await this.prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records as unknown as LoginHistoryModel[];
  }
}
