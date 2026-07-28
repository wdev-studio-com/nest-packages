import { Module, type DynamicModule } from '@nestjs/common';
import type { AuthModuleConfig, AuthModuleAsyncOptions } from '@wdev-studio/nest-auth-types';
import { AuthCoreModule } from './auth-core.module';

@Module({})
export class AuthModule {
  static forRoot(config: AuthModuleConfig): DynamicModule {
    return {
      module: AuthModule,
      imports: [AuthCoreModule.forRoot(config)],
    };
  }

  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [AuthCoreModule.forRootAsync(options)],
    };
  }
}
