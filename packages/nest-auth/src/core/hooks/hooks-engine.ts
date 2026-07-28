import type { Hooks as IHooks, UserModel, UserInfoDto } from '@wdev-studio/nest-auth-types';

export class HooksEngine implements IHooks {
  private hooks: IHooks = {};

  setHooks(hooks: IHooks): void {
    this.hooks = hooks;
  }

  async onUserCreated(user: UserModel): Promise<void> {
    await this.hooks.onUserCreated?.(user);
  }

  async onUserUpdated(user: UserModel): Promise<void> {
    await this.hooks.onUserUpdated?.(user);
  }

  async onLogin(user: UserModel, provider: string): Promise<void> {
    await this.hooks.onLogin?.(user, provider);
  }

  async onLogout(user: UserModel): Promise<void> {
    await this.hooks.onLogout?.(user);
  }

  async onRefresh(user: UserModel, tokenId: string): Promise<void> {
    await this.hooks.onRefresh?.(user, tokenId);
  }

  async onUserInfo(userInfo: UserInfoDto): Promise<UserInfoDto> {
    const result = await this.hooks.onUserInfo?.(userInfo);
    return result ?? userInfo;
  }
}
