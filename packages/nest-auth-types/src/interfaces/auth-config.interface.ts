import type { OAuthProvider } from './oauth-provider.interface';
import type { DatabaseAdapter } from './database-adapter.interface';
import type { EventBus } from './event-bus.interface';
import type { Hooks } from './hooks.interface';
import type { Logger } from './logger.interface';

export interface JwtConfig {
  secret: string;
  privateKey?: string;
  publicKey?: string;
  algorithm?: 'HS256' | 'RS256' | 'ES256';
  expiresIn?: string;
  refreshExpiresIn?: string;
  issuer?: string;
}

export interface CookieConfig {
  name?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
  path?: string;
  maxAge?: number;
}

export interface SessionConfig {
  maxAge?: number;
  maxSessionsPerUser?: number;
  cookieName?: string;
}

export interface AuthModuleConfig {
  providers?: OAuthProvider[];
  adapter?: DatabaseAdapter;
  jwt: JwtConfig;
  cookies?: CookieConfig;
  session?: SessionConfig;
  eventBus?: EventBus;
  hooks?: Hooks;
  logger?: Logger;
  baseUrl?: string;
  global?: boolean;
}

export interface AuthModuleAsyncOptions {
  imports?: any[];
  useFactory: (...args: any[]) => AuthModuleConfig | Promise<AuthModuleConfig>;
  inject?: any[];
  global?: boolean;
}
