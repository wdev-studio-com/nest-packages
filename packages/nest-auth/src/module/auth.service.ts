import { Injectable, Inject } from '@nestjs/common';
import { AuthEvent } from '@wdev-studio/nest-auth-types';
import type { LoginDto, LogoutDto, TokenPairDto, UserInfoDto } from '@wdev-studio/nest-auth-types';
import { OAuthManager } from '../core/oauth/oauth-manager';
import { ProviderRegistry } from '../core/registry/provider-registry';
import { AdapterRegistry } from '../core/registry/adapter-registry';
import { JwtService } from '../core/jwt/jwt-service';
import { SessionService } from '../core/session/session-service';
import { EventBus } from '../core/event-bus/event-bus';
import { HooksEngine } from '../core/hooks/hooks-engine';
import { CookieManager } from '../core/cookies/cookie-manager';
import { AuthConfig } from '../core/config/auth-config';
import {
  AUTH_CONFIG,
  AUTH_PROVIDER_REGISTRY,
  AUTH_ADAPTER_REGISTRY,
  AUTH_OAUTH_MANAGER,
  AUTH_JWT_SERVICE,
  AUTH_SESSION_SERVICE,
  AUTH_EVENT_BUS,
  AUTH_HOOKS,
  AUTH_COOKIE_MANAGER,
} from './tokens';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_CONFIG) public readonly config: AuthConfig,
    @Inject(AUTH_PROVIDER_REGISTRY) public readonly providerRegistry: ProviderRegistry,
    @Inject(AUTH_ADAPTER_REGISTRY) public readonly adapterRegistry: AdapterRegistry,
    @Inject(AUTH_OAUTH_MANAGER) public readonly oauthManager: OAuthManager,
    @Inject(AUTH_JWT_SERVICE) public readonly jwtService: JwtService,
    @Inject(AUTH_SESSION_SERVICE) public readonly sessionService: SessionService | undefined,
    @Inject(AUTH_EVENT_BUS) public readonly eventBus: EventBus,
    @Inject(AUTH_HOOKS) public readonly hooks: HooksEngine | null,
    @Inject(AUTH_COOKIE_MANAGER) public readonly cookieManager: CookieManager,
  ) {}

  async getAuthorizationUrl(provider: string, params?: Record<string, string>): Promise<URL> {
    await this.eventBus.emit(AuthEvent.BeforeLogin, { provider });
    return this.oauthManager.getAuthorizationUrl(provider, params);
  }

  async login(dto: LoginDto): Promise<{ user: UserInfoDto; tokens: TokenPairDto }> {
    await this.eventBus.emit(AuthEvent.BeforeLogin, { provider: dto.provider });

    const tokens = await this.oauthManager.exchangeCode(dto.provider, {
      code: dto.code,
      redirectUri: dto.redirectUri,
      codeVerifier: dto.codeVerifier,
      state: dto.state,
      nonce: dto.nonce,
    });

    await this.eventBus.emit(AuthEvent.BeforeTokenIssued, { provider: dto.provider });

    let user = await this.oauthManager.getUser(dto.provider, tokens.accessToken);
    if (this.hooks) {
      const modified = await this.hooks.onUserInfo(user);
      user = modified ?? user;
    }

    const adapter = this.adapterRegistry.get();
    if (adapter) {
      let existingUser = await adapter.findUserByProvider(dto.provider, user.sub);
      let dbUser = existingUser?.user ?? null;

      if (!dbUser) {
        dbUser = await adapter.findUserByEmail(user.email ?? '');
      }

      if (!dbUser) {
        await this.eventBus.emit(AuthEvent.BeforeUserCreate, { provider: dto.provider });
        dbUser = await adapter.createUser({
          email: user.email ?? `${user.sub}@${dto.provider}.local`,
          name: user.name,
          picture: user.picture,
          locale: user.locale,
          emailVerified: user.emailVerified ?? false,
          lastLoginAt: new Date(),
        });
        await this.hooks?.onUserCreated(dbUser);
        await this.eventBus.emit(AuthEvent.AfterUserCreate, {
          userId: dbUser.id,
          provider: dto.provider,
        });
      } else {
        dbUser = await adapter.updateUser(dbUser.id, {
          lastLoginAt: new Date(),
          name: user.name ?? dbUser.name,
          picture: user.picture ?? dbUser.picture,
        });
        await this.hooks?.onUserUpdated(dbUser);
      }

      await adapter.createAccount({
        userId: dbUser.id,
        provider: dto.provider,
        providerAccountId: user.sub,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        idToken: tokens.idToken,
        scope: tokens.scope,
        tokenType: tokens.tokenType,
        expiresAt: tokens.accessTokenExpiresAt,
      });

      if (this.sessionService) {
        await this.sessionService.create(dbUser.id, dto.provider, {
          ip: dto.ip,
          userAgent: dto.userAgent,
        });
      }

      await this.hooks?.onLogin(dbUser, dto.provider);
      await adapter.createLoginHistory({
        userId: dbUser.id,
        provider: dto.provider,
        ip: dto.ip,
        userAgent: dto.userAgent,
        success: true,
      });

      const jwtPayload = {
        sub: dbUser.id,
        email: dbUser.email,
        provider: dto.provider,
      };

      const appTokens = await this.createAppTokens(jwtPayload);

      await this.eventBus.emit(AuthEvent.AfterTokenIssued, {
        userId: dbUser.id,
        provider: dto.provider,
      });

      await this.eventBus.emit(AuthEvent.AfterLogin, {
        userId: dbUser.id,
        provider: dto.provider,
      });

      return { user, tokens: appTokens };
    }

    await this.eventBus.emit(AuthEvent.AfterLogin, {
      provider: dto.provider,
    });

    return { user, tokens };
  }

  async createAppTokens(payload: { sub: string; email?: string; provider?: string }): Promise<TokenPairDto> {
    const pair = await this.jwtService.createTokenPair(payload);
    return {
      accessToken: pair.accessToken,
      refreshToken: pair.refreshToken,
      accessTokenExpiresAt: pair.accessTokenExpiresAt,
      refreshTokenExpiresAt: pair.refreshTokenExpiresAt,
      tokenType: 'Bearer',
    };
  }

  async refreshToken(provider: string, refreshToken: string): Promise<TokenPairDto> {
    const payload = this.jwtService.decode(refreshToken);
    if (!payload?.sub) throw new Error('Invalid refresh token');

    const tokens = await this.oauthManager.refreshToken(provider, { refreshToken });
    const appTokens = await this.createAppTokens({
      sub: payload.sub,
      email: payload.email as string | undefined,
      provider,
    });

    await this.hooks?.onRefresh(
      { id: payload.sub, email: '' } as any,
      payload.jti ?? '',
    );

    return appTokens;
  }

  async logout(dto: LogoutDto): Promise<void> {
    await this.eventBus.emit(AuthEvent.BeforeLogout);

    if (dto.sessionId && this.sessionService) {
      await this.sessionService.revoke(dto.sessionId);
    }

    if (dto.global && this.sessionService) {
      const payload = this.jwtService.decode(dto.accessToken);
      if (payload?.sub) {
        await this.sessionService.revokeAll(payload.sub);
      }
    }

    await this.eventBus.emit(AuthEvent.AfterLogout);
  }

  async getMe(accessToken: string): Promise<UserInfoDto | null> {
    try {
      const payload = await this.jwtService.verify(accessToken);
      const adapter = this.adapterRegistry.get();
      if (!adapter) return null;
      const user = await adapter.findUser(payload.sub);
      if (!user) return null;
      return {
        sub: user.id,
        email: user.email,
        name: user.name ?? undefined,
        picture: user.picture ?? undefined,
        locale: user.locale ?? undefined,
        emailVerified: user.emailVerified,
        provider: payload.provider as string ?? 'unknown',
      };
    } catch {
      return null;
    }
  }
}
