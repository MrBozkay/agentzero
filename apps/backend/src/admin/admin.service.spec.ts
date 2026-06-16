import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: any;

  const mockUser = {
    id: 'user-1',
    email: 'a@a.com',
    name: 'A',
    role: 'USER',
    plan: 'FREE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 🔴 RED — Slice 3: AdminService.findAllUsers
  describe('findAllUsers', () => {
    it('should return paginated list of users', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-2', email: 'b@b.com' }];
      prisma.user.findMany.mockResolvedValue(users);
      prisma.user.count.mockResolvedValue(2);

      const result = await service.findAllUsers({ page: 1, pageSize: 20 });

      expect(result.users).toEqual(users);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should compute skip from page correctly (page=2, pageSize=10 → skip=10)', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.findAllUsers({ page: 2, pageSize: 10 });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should exclude passwordHash from response', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser]);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.findAllUsers({ page: 1, pageSize: 20 });

      // We don't fetch passwordHash at the Prisma level
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            email: true,
            role: true,
          }),
        }),
      );
      expect(result.users[0]).not.toHaveProperty('passwordHash');
    });
  });

  // 🔴 RED — Slice 3: AdminService.updateUserRole
  describe('updateUserRole', () => {
    it('should update role for a target user', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, role: 'USER' });
      prisma.user.update.mockResolvedValue({ ...mockUser, role: 'ADMIN' });

      const result = await service.updateUserRole('user-1', 'ADMIN', 'admin-caller-id');

      expect(result.role).toBe('ADMIN');
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: { role: 'ADMIN' },
        }),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserRole('nonexistent', 'ADMIN', 'admin-caller-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should refuse to demote self (caller id === target id)', async () => {
      await expect(
        service.updateUserRole('admin-caller-id', 'USER', 'admin-caller-id'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should refuse to demote the last remaining admin', async () => {
      // The target is the only admin (other than the caller, but caller is a different admin)
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, id: 'admin-1', role: 'ADMIN' });
      prisma.user.count.mockResolvedValue(1); // only 1 admin total

      await expect(
        service.updateUserRole('admin-1', 'USER', 'admin-caller-id'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  // 🔴 RED — Slice 3: AdminService.deleteUser
  describe('deleteUser', () => {
    it('should delete a target user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.delete.mockResolvedValue(mockUser);

      const result = await service.deleteUser('user-1', 'admin-caller-id');

      expect(result.id).toBe('user-1');
      expect(prisma.user.delete).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteUser('nonexistent', 'admin-caller-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should refuse to delete self', async () => {
      await expect(
        service.deleteUser('admin-caller-id', 'admin-caller-id'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('should refuse to delete the last remaining admin', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, id: 'admin-1', role: 'ADMIN' });
      prisma.user.count.mockResolvedValue(1);

      await expect(
        service.deleteUser('admin-1', 'admin-caller-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
