import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      googleAuth: jest.fn(),
      supabaseAuth: jest.fn(),
      verifyGoogleToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        {
          provide: SupabaseService,
          useValue: { verifySession: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // 🔴 RED — Slice 4: /me endpoint must return req.user (placed by JwtAuthGuard)
  describe('me', () => {
    it('should return the authenticated user attached to req', async () => {
      const req = {
        user: {
          id: 'user-1',
          email: 'a@a.com',
          role: 'USER',
          plan: 'FREE',
        },
      } as any;

      const result = await controller.me(req);

      expect(result).toEqual({
        id: 'user-1',
        email: 'a@a.com',
        role: 'USER',
        plan: 'FREE',
      });
    });

    it('should not consult AuthService — req.user is the source of truth', async () => {
      const req = { user: { id: 'u1', email: 'b@b.com', role: 'ADMIN', plan: 'GROWTH' } } as any;

      await controller.me(req);

      // /me is a passthrough of req.user populated by JwtAuthGuard → JwtStrategy
      // It must not call into the DB or AuthService.
      expect(authService.register).not.toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should delegate to AuthService.login and return its result', async () => {
      const dto = { email: 'a@a.com', password: 'pw' };
      const expected = { accessToken: 'jwt', user: { id: 'u1', email: 'a@a.com', name: null, plan: 'FREE', role: 'USER' } };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });
});
