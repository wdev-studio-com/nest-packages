import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../guards/auth.guard';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get(':provider/url')
  async getAuthorizationUrl(
    @Param('provider') provider: string,
    @Query() query: Record<string, string>,
  ): Promise<{ url: string }> {
    const url = await this.authService.getAuthorizationUrl(provider, query);
    return { url: url.toString() };
  }

  @Public()
  @Get(':provider/callback')
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('redirect_uri') redirectUri: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ): Promise<{ user: unknown; tokens: unknown }> {
    const result = await this.authService.login({
      provider,
      code,
      state,
      redirectUri,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    if (redirectUri) {
      const url = new URL(redirectUri);
      url.searchParams.set('access_token', result.tokens.accessToken);
      url.searchParams.set('refresh_token', result.tokens.refreshToken);
      res.redirect(url.toString());
      return { user: result.user, tokens: result.tokens };
    }

    return { user: result.user, tokens: result.tokens };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Body('provider') provider: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.authService.refreshToken(provider, refreshToken);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body('refreshToken') refreshToken: string,
    @Body('sessionId') sessionId: string,
    @Body('global') global: boolean,
  ): Promise<void> {
    await this.authService.logout({ accessToken: '', refreshToken, sessionId, global });
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: any): Promise<unknown> {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '');
    return this.authService.getMe(token);
  }
}
