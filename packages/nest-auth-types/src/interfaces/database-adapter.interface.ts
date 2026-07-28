import type { UserModel } from '../models/user.model';
import type { AccountModel } from '../models/account.model';
import type { SessionModel } from '../models/session.model';
import type { RefreshTokenModel } from '../models/refresh-token.model';
import type { OAuthStateModel } from '../models/oauth-state.model';
import type { OAuthNonceModel } from '../models/oauth-nonce.model';
import type { LoginHistoryModel } from '../models/login-history.model';

export interface DatabaseAdapter {
  createUser(data: Partial<UserModel>): Promise<UserModel>;
  findUser(id: string): Promise<UserModel | null>;
  findUserByEmail(email: string): Promise<UserModel | null>;
  findUserByProvider(provider: string, providerAccountId: string): Promise<{ user: UserModel; account: AccountModel } | null>;
  updateUser(id: string, data: Partial<UserModel>): Promise<UserModel>;
  deleteUser(id: string): Promise<void>;

  createAccount(data: Partial<AccountModel>): Promise<AccountModel>;
  findAccountsByUserId(userId: string): Promise<AccountModel[]>;
  deleteAccount(id: string): Promise<void>;

  createSession(data: Partial<SessionModel>): Promise<SessionModel>;
  findSession(id: string): Promise<SessionModel | null>;
  findSessionsByUserId(userId: string): Promise<SessionModel[]>;
  updateSession(id: string, data: Partial<SessionModel>): Promise<SessionModel>;
  deleteSession(id: string): Promise<void>;
  deleteSessionsByUserId(userId: string): Promise<void>;

  createRefreshToken(data: Partial<RefreshTokenModel>): Promise<RefreshTokenModel>;
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenModel | null>;
  revokeRefreshToken(id: string): Promise<void>;
  revokeRefreshTokensByUserId(userId: string): Promise<void>;

  createOAuthState(data: Partial<OAuthStateModel>): Promise<OAuthStateModel>;
  findOAuthState(state: string): Promise<OAuthStateModel | null>;
  deleteOAuthState(id: string): Promise<void>;

  createOAuthNonce(data: Partial<OAuthNonceModel>): Promise<OAuthNonceModel>;
  findOAuthNonce(nonce: string): Promise<OAuthNonceModel | null>;
  deleteOAuthNonce(id: string): Promise<void>;

  createLoginHistory(data: Partial<LoginHistoryModel>): Promise<LoginHistoryModel>;
  findLoginHistoryByUserId(userId: string): Promise<LoginHistoryModel[]>;
}
