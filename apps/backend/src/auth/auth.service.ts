import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly supabase: SupabaseService,
  ) {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID || '',
    );
  }

  async register(dto: { email: string; password: string; name?: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name || null,
      },
    });

    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      },
    };
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash || '');
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      },
    };
  }

  async googleAuth(dto: { googleId: string; email: string; name?: string }) {
    if (!dto.googleId || !dto.email) {
      throw new UnauthorizedException('Google ID and email are required');
    }

    // Check if user already exists with this Google ID
    const existing = await this.prisma.user.findUnique({
      where: { googleId: dto.googleId },
    });

    if (existing) {
      const accessToken = await this.jwt.signAsync({ sub: existing.id, email: existing.email });
      return {
        accessToken,
        user: {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          plan: existing.plan,
          role: existing.role,
        },
      };
    }

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        googleId: dto.googleId,
        name: dto.name || null,
      },
    });

    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      },
    };
  }

  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || undefined,
        avatarUrl: payload.picture || undefined,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Authenticate with Supabase session token.
   * Verifies the token with Supabase Auth, then looks up or creates a local user.
   */
  async supabaseAuth(supabaseAccessToken: string) {
    if (!supabaseAccessToken) {
      throw new UnauthorizedException('Supabase access token is required');
    }

    // Verify token with Supabase
    let supabaseUser: any;
    try {
      supabaseUser = await this.supabase.verifySession(supabaseAccessToken);
    } catch {
      throw new UnauthorizedException('Invalid Supabase session token');
    }

    if (!supabaseUser || !supabaseUser.email) {
      throw new UnauthorizedException('Could not retrieve user from Supabase');
    }

    // Look up existing user by supabaseUserId or email
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { supabaseUserId: supabaseUser.id },
          { email: supabaseUser.email },
        ],
      },
    });

    if (existing) {
      // Update supabaseUserId if not set
      if (!existing.supabaseUserId) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { supabaseUserId: supabaseUser.id },
        });
      }

      const accessToken = await this.jwt.signAsync({ sub: existing.id, email: existing.email });
      return {
        accessToken,
        user: {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          plan: existing.plan,
          role: existing.role,
        },
      };
    }

    // Create new user
    const metadata = supabaseUser.user_metadata || {};
    const user = await this.prisma.user.create({
      data: {
        email: supabaseUser.email,
        supabaseUserId: supabaseUser.id,
        name: metadata.name || metadata.full_name || null,
        avatarUrl: metadata.avatar_url || metadata.picture || null,
      },
    });

    const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
      },
    };
  }
}
