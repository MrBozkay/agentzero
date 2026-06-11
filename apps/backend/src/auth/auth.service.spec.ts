import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@gmail.com',
    name: 'Test User',
    googleId: 'google-123',
    passwordHash: null,
    avatarUrl: null,
    plan: 'FREE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwt = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('googleAuth', () => {
    const googleDto = {
      email: 'test@gmail.com',
      name: 'Test User',
      googleId: 'google-123',
    };

    it('should create a new user if googleId does not exist and return JWT', async () => {
      // Mock: no existing user with this googleId
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
});
