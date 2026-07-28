import type { UserInfoDto } from '@wdev-studio/nest-auth-types';

interface GoogleUserResponse {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  locale?: string;
}

export class GoogleUserService {
  private readonly userInfoUrl = 'https://openidconnect.googleapis.com/v1/userinfo';

  async getUser(accessToken: string): Promise<UserInfoDto> {
    const response = await fetch(this.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Google userinfo failed: ${response.status}`);
    }

    const data = (await response.json()) as GoogleUserResponse;

    return {
      sub: data.sub,
      name: data.name,
      email: data.email,
      emailVerified: data.email_verified ?? false,
      picture: data.picture,
      locale: data.locale,
      provider: 'google',
      rawAttributes: data as unknown as Record<string, unknown>,
    };
  }
}
