import { Module } from '@nestjs/common';
import { AuthModule } from '@wdev-studio/nest-auth';
import { GoogleProvider } from '@wdev-studio/nest-auth-provider-google';
import { PrismaClient } from '@prisma/client';
import { PrismaAdapter } from '@wdev-studio/nest-auth-adapter-prisma';

const prisma = new PrismaClient();

@Module({
  imports: [
    AuthModule.forRoot({
      providers: [
        new GoogleProvider(),
      ],
      adapter: new PrismaAdapter(prisma),
      jwt: {
        secret: process.env.JWT_SECRET ?? 'super-secret-key-change-in-production',
        expiresIn: '15m',
        refreshExpiresIn: '7d',
      },
      cookies: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
      },
      session: {
        maxAge: 86400,
        maxSessionsPerUser: 5,
      },
      baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',
    }),
  ],
})
export class AppModule {}
