import type { JwtConfig, CookieConfig, SessionConfig } from '../interfaces/auth-config.interface';
import type { OAuthProviderConfig } from '../interfaces/oauth-provider.interface';

export interface AuthConfigDto {
  jwt: JwtConfig;
  cookies?: CookieConfig;
  session?: SessionConfig;
  providers?: Record<string, OAuthProviderConfig>;
  baseUrl: string;
}
