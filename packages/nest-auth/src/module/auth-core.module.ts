import { Global, Module, type DynamicModule, type Provider } from '@nestjs/common';
import type { AuthModuleConfig, DatabaseAdapter, Logger } from '@wdev-studio/nest-auth-types';
import { OAuthManager } from '../core/oauth/oauth-manager';
import { JwtService } from '../core/jwt/jwt-service';
import { SessionService } from '../core/session/session-service';
import { EventBus } from '../core/event-bus/event-bus';
import { HooksEngine } from '../core/hooks/hooks-engine';
import { CookieManager } from '../core/cookies/cookie-manager';
import { AuthConfig } from '../core/config/auth-config';
import { ProviderRegistry } from '../core/registry/provider-registry';
import { AdapterRegistry } from '../core/registry/adapter-registry';
import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AUTH_CONFIG, AUTH_PROVIDER_REGISTRY, AUTH_ADAPTER_REGISTRY, AUTH_OAUTH_MANAGER, AUTH_JWT_SERVICE, AUTH_SESSION_SERVICE, AUTH_EVENT_BUS, AUTH_HOOKS, AUTH_COOKIE_MANAGER, AUTH_LOGGER } from './tokens';

function createProviders(config: AuthModuleConfig) {
  const authConfig = new AuthConfig(config);
  const providerRegistry = new ProviderRegistry();
  const adapterRegistry = new AdapterRegistry();
  const jwtService = new JwtService(authConfig.jwt);
  const eventBus = config.eventBus ?? new EventBus();
  const hooks = config.hooks ? new HooksEngine() : undefined;
  if (hooks && config.hooks) hooks.setHooks(config.hooks);
  const sessionService = config.adapter ? new SessionService(config.adapter, authConfig.session) : undefined;
  const oauthManager = new OAuthManager(providerRegistry);

  if (config.adapter) adapterRegistry.register(config.adapter);
  if (config.providers) {
    for (const p of config.providers) {
      providerRegistry.register(p);
    }
  }

  const cookieManager = new CookieManager(authConfig.cookies);

  const logger: Logger = config.logger ?? console;

  const providers: Provider[] = [
    { provide: AUTH_CONFIG, useValue: authConfig },
    { provide: AUTH_PROVIDER_REGISTRY, useValue: providerRegistry },
    { provide: AUTH_ADAPTER_REGISTRY, useValue: adapterRegistry },
    { provide: AUTH_OAUTH_MANAGER, useValue: oauthManager },
    { provide: AUTH_JWT_SERVICE, useValue: jwtService },
    { provide: AUTH_EVENT_BUS, useValue: eventBus },
    { provide: AUTH_COOKIE_MANAGER, useValue: cookieManager },
    { provide: AUTH_LOGGER, useValue: logger },
    { provide: AUTH_HOOKS, useValue: hooks ?? null },
    AuthGuard,
    AuthService,
  ];

  if (sessionService) {
    providers.push({ provide: AUTH_SESSION_SERVICE, useValue: sessionService });
  }

  return providers;
}

@Global()
@Module({})
export class AuthCoreModule {
  static forRoot(config: AuthModuleConfig): DynamicModule {
    return {
      module: AuthCoreModule,
      providers: createProviders(config),
      controllers: [AuthController],
      exports: [
        AUTH_CONFIG,
        AUTH_PROVIDER_REGISTRY,
        AUTH_ADAPTER_REGISTRY,
        AUTH_OAUTH_MANAGER,
        AUTH_JWT_SERVICE,
        AUTH_SESSION_SERVICE,
        AUTH_EVENT_BUS,
        AUTH_HOOKS,
        AUTH_COOKIE_MANAGER,
        AUTH_LOGGER,
        AuthGuard,
        AuthService,
      ].filter(Boolean),
      global: config.global ?? true,
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (...args: any[]) => AuthModuleConfig | Promise<AuthModuleConfig>;
    inject?: any[];
    global?: boolean;
  }): DynamicModule {
    return {
      module: AuthCoreModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: AUTH_CONFIG,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            const authConfig = new AuthConfig(config);
            if (config.adapter) {
              const adapterRegistry = new AdapterRegistry();
              adapterRegistry.register(config.adapter);
            }
            if (config.providers) {
              const registry = new ProviderRegistry();
              for (const p of config.providers) {
                registry.register(p);
              }
            }
            return authConfig;
          },
          inject: options.inject ?? [],
        },
      ],
      controllers: [AuthController],
      exports: [
        AUTH_CONFIG,
        AUTH_PROVIDER_REGISTRY,
        AUTH_ADAPTER_REGISTRY,
        AUTH_OAUTH_MANAGER,
        AUTH_JWT_SERVICE,
        AUTH_SESSION_SERVICE,
        AUTH_EVENT_BUS,
        AUTH_HOOKS,
        AUTH_COOKIE_MANAGER,
        AUTH_LOGGER,
        AuthGuard,
        AuthService,
      ].filter(Boolean),
      global: options.global ?? true,
    };
  }
}
