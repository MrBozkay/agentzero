import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard for admin-only endpoints.
 *
 * Must be applied AFTER JwtAuthGuard (or in a chain that ensures
 * `req.user` is populated by the JWT strategy). Checks that
 * `req.user.role === 'ADMIN'` and throws otherwise.
 *
 * Order of checks:
 * 1. No user on request → 401 Unauthorized (no auth at all)
 * 2. User exists but role !== 'ADMIN' → 403 Forbidden (auth but not allowed)
 */
@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | import('rxjs').Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    if ((user as any).role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    return user;
  }
}
