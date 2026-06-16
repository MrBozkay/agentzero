import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  // 🔴🔴 RED→GREEN — Slice 2: handleRequest enforces admin role
  // We test handleRequest directly (the part this guard owns) rather than
  // super.canActivate which depends on passport wiring.
  describe('handleRequest', () => {
    it('should return user when user role is ADMIN', () => {
      const user = { id: 'user-1', email: 'a@a.com', role: 'ADMIN' };

      const result = guard.handleRequest(null, user);

      expect(result).toEqual(user);
    });

    it('should throw ForbiddenException when user role is USER', () => {
      const user = { id: 'user-2', email: 'b@b.com', role: 'USER' };

      expect(() => guard.handleRequest(null, user)).toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException when no user on request (no JWT)', () => {
      expect(() => guard.handleRequest(null, undefined)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is null', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException when user has no role (USER-equivalent)', () => {
      // User is authenticated (passport placed them on req) but lacks a role claim.
      // Per HTTP semantics this is a 403 (Forbidden) — auth succeeded, authz failed.
      const user = { id: 'user-3', email: 'c@c.com' };

      expect(() => guard.handleRequest(null, user)).toThrow(ForbiddenException);
    });

    it('should propagate passport error if any', () => {
      const passportError = new Error('passport exploded');
      expect(() => guard.handleRequest(passportError, null)).toThrow(passportError);
    });
  });
});
