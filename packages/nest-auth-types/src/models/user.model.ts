export interface UserModel {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
  locale?: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  metadata?: Record<string, unknown> | null;
}
