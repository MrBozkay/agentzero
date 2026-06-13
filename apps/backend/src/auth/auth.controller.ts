import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: { email: string; password: string; name?: string }) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { email: string; password: string }) {
    return this.auth.login(dto);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() dto: { googleIdToken: string }) {
    const payload = await this.auth.verifyGoogleToken(dto.googleIdToken);
    return this.auth.googleAuth({
      googleId: payload.googleId,
      email: payload.email,
      name: payload.name ?? undefined,
    });
  }

  @Post('supabase')
  @HttpCode(HttpStatus.OK)
  async supabaseAuth(@Body() dto: { accessToken: string }) {
    return this.auth.supabaseAuth(dto.accessToken);
  }
}
