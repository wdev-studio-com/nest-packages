import type { UserModel } from '../models/user.model';
import type { UserInfoDto } from '../dtos/user-info.dto';

export interface Hooks {
  onUserCreated?(user: UserModel): void | Promise<void>;
  onUserUpdated?(user: UserModel): void | Promise<void>;
  onLogin?(user: UserModel, provider: string): void | Promise<void>;
  onLogout?(user: UserModel): void | Promise<void>;
  onRefresh?(user: UserModel, tokenId: string): void | Promise<void>;
  onUserInfo?(userInfo: UserInfoDto): UserInfoDto | void | Promise<UserInfoDto | void>;
}
