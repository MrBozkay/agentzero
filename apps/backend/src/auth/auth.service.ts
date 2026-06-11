import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
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
        name: payload.name || null,
        avatarUrl: payload.picture || null,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
