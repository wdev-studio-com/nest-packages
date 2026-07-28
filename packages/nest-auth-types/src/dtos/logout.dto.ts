export interface LogoutDto {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  global?: boolean;
}
