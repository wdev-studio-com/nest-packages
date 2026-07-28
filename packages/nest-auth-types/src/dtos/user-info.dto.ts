export interface UserInfoDto {
  sub: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  picture?: string;
  locale?: string;
  provider: string;
  rawAttributes?: Record<string, unknown>;
}
