import { Injectable, type CanActivate, type ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '../core/jwt/jwt-service';
import { AUTH_JWT_SERVICE } from '../module/tokens';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_JWT_SERVICE) private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string>; user?: unknown }>();
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return false;

    try {
      const payload = await this.jwtService.verify(auth.slice(7));
      (request as any).user = payload;
      return true;
    } catch {
      return false;
    }
  }
}
