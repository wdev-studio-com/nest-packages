import { applyDecorators, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

export interface AuthOptions {
  scopes?: string[];
}

export function Auth(options?: AuthOptions) {
  return applyDecorators(
    UseGuards(AuthGuard),
    SetMetadata('auth:options', options ?? {}),
  );
}
