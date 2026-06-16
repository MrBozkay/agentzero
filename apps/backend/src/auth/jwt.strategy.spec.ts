import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    googleId: null,
    supabaseUserId: null,
    passwordHash: null,
    avatarUrl: null,
    plan: 'FREE',
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    // 🔴 RED — Slice 2: validate must include role for AdminGuard to work
    it('should include user role in returned payload', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, role: 'ADMIN' });

      const result = await strategy.validate({ sub: 'user-1', email: 'test@example.com' });
      expect(result).not.toBeNull();
      expect(result!.role).toBe('ADMIN');
    });

    it('should return USER role for normal users', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, role: 'USER' });

      const result = await strategy.validate({ sub: 'user-1', email: 'test@example.com' });
      expect(result).not.toBeNull();
      expect(result!.role).toBe('USER');
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await strategy.validate({ sub: 'nonexistent', email: 'x@x.com' });

      expect(result).toBeNull();
    });

    it('should return user id, email, plan, AND role for downstream guards', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate({ sub: 'user-1', email: 'test@example.com' });

      expect(result).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        plan: 'FREE',
        role: 'USER',
      });
    });
  });
});
