import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

interface AuthedRequest extends Request {
  user: { id: string; email: string; role: Role };
}

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  /**
   * GET /api/v1/admin/users?page=1&pageSize=20
   * Paginated user list, newest first.
   */
  @Get('users')
  async listUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.admin.findAllUsers({ page, pageSize });
  }

  /**
   * PATCH /api/v1/admin/users/:id/role
   * Body: { role: 'USER' | 'ADMIN' }
   */
  @Patch('users/:id/role')
  async updateRole(
    @Param('id') userId: string,
    @Body() body: { role: Role },
    @Req() req: AuthedRequest,
  ) {
    return this.admin.updateUserRole(userId, body.role, req.user.id);
  }

  /**
   * DELETE /api/v1/admin/users/:id
   */
  @Delete('users/:id')
  async deleteUser(@Param('id') userId: string, @Req() req: AuthedRequest) {
    return this.admin.deleteUser(userId, req.user.id);
  }
}
