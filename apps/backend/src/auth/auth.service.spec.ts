import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

// Mock bcrypt
import * as bcrypt from 'bcrypt';
jest.mock('bcrypt');

// Mock google-auth-library
jest.mock('google-auth-library');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;
  let supabase: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@gmail.com',
    name: 'Test User',
    googleId: 'google-123',
    supabaseUserId: 'supabase-user-1',
    passwordHash: null,
    avatarUrl: null,
    plan: 'FREE',
    role: 'USER',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };
    jwt = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };
    supabase = {
      getClient: jest.fn(),
      getAdminClient: jest.fn(),
      verifySession: jest.fn(),
      getUserBySupabaseId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'test@gmail.com', password: 'password123', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return JWT', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed');
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@gmail.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@gmail.com');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@gmail.com',
          name: 'Test User',
          passwordHash: '$2b$10$hashed',
        }),
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'nonexistent@email.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: '$2b$10$hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ email: 'test@gmail.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return JWT on successful login', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: '$2b$10$hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@gmail.com', password: 'password123' });
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@gmail.com');
    });
  });

  // 🔴 RED — Slice 1: User model must have a `role` field defaulting to USER
  describe('user role (authorization primitive)', () => {
    it('should default new user role to USER on register', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed');
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'newuser@gmail.com',
        password: 'password123',
        name: 'New User',
      });

      // New users must default to USER role (admin promotion is explicit)
      expect(result.user.role).toBe('USER');
    });

    it('should include role in login response', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, passwordHash: '$2b$10$hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@gmail.com', password: 'password123' });

      expect(result.user.role).toBe('USER');
    });

    it('should reflect admin role in login response when user is admin', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: '$2b$10$hash',
        role: 'ADMIN',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'admin@email.com', password: 'password123' });

      expect(result.user.role).toBe('ADMIN');
    });

    it('should expose role enum values', () => {
      // Prisma's Role enum must be queryable at runtime
      const { Role } = require('@prisma/client');
      expect(Role.USER).toBe('USER');
      expect(Role.ADMIN).toBe('ADMIN');
    });
  });

  describe('googleAuth', () => {
    const googleDto = {
      email: 'test@gmail.com',
      name: 'Test User',
      googleId: 'google-123',
    };

    it('should create a new user if googleId does not exist and return JWT', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.googleAuth(googleDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { googleId: 'google-123' },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@gmail.com',
          name: 'Test User',
          googleId: 'google-123',
        },
      });
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@gmail.com');
    });

    it('should return existing user if googleId already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.googleAuth(googleDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { googleId: 'google-123' },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw if email is missing', async () => {
      await expect(
        service.googleAuth({ email: '', name: 'Test', googleId: 'g-123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if googleId is missing', async () => {
      await expect(
        service.googleAuth({ email: 'test@gmail.com', name: 'Test', googleId: '' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('supabaseAuth', () => {
    const supabaseUser = {
      id: 'supabase-user-1',
      email: 'supabase@email.com',
      user_metadata: { name: 'Supabase User', avatar_url: 'https://example.com/avatar.png' },
    };

    it('should throw if access token is empty', async () => {
      await expect(service.supabaseAuth('')).rejects.toThrow(UnauthorizedException);
    });

    it('should verify token with Supabase and create new user', async () => {
      supabase.verifySession.mockResolvedValue(supabaseUser);
      // No existing user with this email
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        ...mockUser,
        id: 'new-user-id',
        email: 'supabase@email.com',
        supabaseUserId: 'supabase-user-1',
        name: 'Supabase User',
        avatarUrl: 'https://example.com/avatar.png',
      });

      const result = await service.supabaseAuth('valid-supabase-token');

      expect(supabase.verifySession).toHaveBeenCalledWith('valid-supabase-token');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'supabase@email.com',
          supabaseUserId: 'supabase-user-1',
          name: 'Supabase User',
          avatarUrl: 'https://example.com/avatar.png',
        },
      });
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should return existing user if email already exists', async () => {
      supabase.verifySession.mockResolvedValue(supabaseUser);
      prisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.supabaseAuth('valid-supabase-token');

      expect(supabase.verifySession).toHaveBeenCalledWith('valid-supabase-token');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ supabaseUserId: 'supabase-user-1' }, { email: 'supabase@email.com' }],
        },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-jwt-token');
    });

    it('should throw if Supabase token verification fails', async () => {
      supabase.verifySession.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.supabaseAuth('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
