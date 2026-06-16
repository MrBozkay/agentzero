import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { AdminModule } from '../src/admin/admin.module';
import { AdminService } from '../src/admin/admin.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { AdminGuard } from '../src/auth/admin.guard';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Admin /users endpoints (e2e)', () => {
  let app: INestApplication;
  let adminService: any;

  // Override JwtAuthGuard to inject req.user from a header
  // (mirrors what JwtStrategy.validate() would do post-auth)
  const adminUser = { id: 'admin-caller-id', email: 'admin@x.com', role: 'ADMIN' };
  const regularUser = { id: 'regular-user-id', email: 'user@x.com', role: 'USER' };

  const mockJwtAuthGuard = {
    canActivate: (ctx: any) => {
      const req = ctx.switchToHttp().getRequest();
      const role = req.headers['x-test-role'] || 'ADMIN';
      req.user = role === 'ADMIN' ? adminUser : regularUser;
      return true;
    },
  };

  const mockAdminGuard = {
    canActivate: (ctx: any) => {
      const req = ctx.switchToHttp().getRequest();
      return req.user?.role === 'ADMIN';
    },
  };

  // Mock PrismaService so we don't need a real database.
  // adminService is a mock instance — its methods are spied per-test.
  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AdminModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleRef.createNestApplication();
    adminService = moduleRef.get(AdminService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // 🔴🔴 RED→GREEN — Slice 3: HTTP-level integration of AdminController + AdminService

  describe('GET /api/v1/admin/users', () => {
    it('returns paginated users when caller is admin', async () => {
      const fakeUsers = [
        { id: 'u1', email: 'a@a.com', name: 'A', role: 'USER', plan: 'FREE', createdAt: new Date(), updatedAt: new Date() },
        { id: 'u2', email: 'b@b.com', name: 'B', role: 'ADMIN', plan: 'FREE', createdAt: new Date(), updatedAt: new Date() },
      ];
      jest.spyOn(adminService, 'findAllUsers').mockResolvedValue({
        users: fakeUsers,
        total: 2,
        page: 1,
        pageSize: 20,
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('x-test-role', 'ADMIN')
        .expect(200);

      expect(res.body.users).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(20);
    });

    it('forbids (403) when caller is regular USER', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('x-test-role', 'USER')
        .expect(403);
    });

    it('accepts pageSize query param and forwards it to service', async () => {
      const spy = jest.spyOn(adminService, 'findAllUsers').mockResolvedValue({
        users: [],
        total: 0,
        page: 3,
        pageSize: 5,
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users?page=3&pageSize=5')
        .set('x-test-role', 'ADMIN')
        .expect(200);

      expect(spy).toHaveBeenCalledWith({ page: 3, pageSize: 5 });
      expect(res.body.page).toBe(3);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/role', () => {
    it('updates target user role when caller is admin', async () => {
      const spy = jest.spyOn(adminService, 'updateUserRole').mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
        name: 'A',
        role: 'ADMIN',
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/admin/users/u1/role')
        .set('x-test-role', 'ADMIN')
        .send({ role: 'ADMIN' })
        .expect(200);

      expect(spy).toHaveBeenCalledWith('u1', 'ADMIN', 'admin-caller-id');
      expect(res.body.role).toBe('ADMIN');
    });

    it('returns 400 when service refuses (e.g. self-demote, last admin)', async () => {
      jest
        .spyOn(adminService, 'updateUserRole')
        .mockRejectedValue(new BadRequestException('You cannot change your own role'));

      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${adminUser.id}/role`)
        .set('x-test-role', 'ADMIN')
        .send({ role: 'USER' })
        .expect(400);
    });

    it('forbids (403) for non-admin caller', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/admin/users/u1/role')
        .set('x-test-role', 'USER')
        .send({ role: 'ADMIN' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/admin/users/:id', () => {
    it('deletes target user when caller is admin', async () => {
      const spy = jest.spyOn(adminService, 'deleteUser').mockResolvedValue({
        id: 'u1',
        email: 'a@a.com',
      });

      const res = await request(app.getHttpServer())
        .delete('/api/v1/admin/users/u1')
        .set('x-test-role', 'ADMIN')
        .expect(200);

      expect(spy).toHaveBeenCalledWith('u1', 'admin-caller-id');
      expect(res.body.id).toBe('u1');
    });

    it('returns 400 when service refuses (e.g. self-delete, last admin)', async () => {
      jest
        .spyOn(adminService, 'deleteUser')
        .mockRejectedValue(new BadRequestException('You cannot delete yourself'));

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${adminUser.id}`)
        .set('x-test-role', 'ADMIN')
        .expect(400);
    });

    it('forbids (403) for non-admin caller', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/users/u1')
        .set('x-test-role', 'USER')
        .expect(403);
    });
  });
});
