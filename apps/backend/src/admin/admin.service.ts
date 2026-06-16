import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

export interface PaginationDto {
  page: number;
  pageSize: number;
}

export interface PaginatedUsers {
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    role: Role;
    plan: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all users with pagination. Newest first.
   * Excludes passwordHash from the response (select projection).
   */
  async findAllUsers(pagination: PaginationDto): Promise<PaginatedUsers> {
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          plan: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return { users: users as any, total, page, pageSize };
  }

  /**
   * Promote or demote a user's role.
   *
   * Refuses to:
   * - change the caller's own role (self-demotion lockout)
   * - demote the last remaining admin (locks the system out)
   */
  async updateUserRole(
    userId: string,
    role: Role,
    callerId: string,
  ): Promise<{ id: string; role: Role; email: string; name: string | null }> {
    if (userId === callerId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (user.role === 'ADMIN' && role !== 'ADMIN') {
      const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the last remaining admin');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    return updated as any;
  }

  /**
   * Hard-delete a user.
   *
   * Refuses to:
   * - delete the caller
   * - delete the last remaining admin
   */
  async deleteUser(
    userId: string,
    callerId: string,
  ): Promise<{ id: string; email: string }> {
    if (userId === callerId) {
      throw new BadRequestException('You cannot delete yourself');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    if (user.role === 'ADMIN') {
      const adminCount = await this.prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last remaining admin');
      }
    }

    const deleted = await this.prisma.user.delete({
      where: { id: userId },
      select: { id: true, email: true },
    });

    return deleted;
  }
}
