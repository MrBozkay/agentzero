import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AdminGuard } from './admin.guard';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    SupabaseModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AdminGuard],
  exports: [AuthService, AdminGuard],
})
export class AuthModule {}
