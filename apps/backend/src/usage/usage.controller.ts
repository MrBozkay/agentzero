import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UsageService } from './usage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/usage')
@UseGuards(JwtAuthGuard)
export class UsageController {
  constructor(private readonly usage: UsageService) {}

  @Post()
  async logUsage(@Body() dto: any, @Req() req: any) {
    return this.usage.logUsage({ ...dto, userId: req.user.id });
  }

  @Get()
  async getUsage(@Req() req: any) {
    return this.usage.getUserUsage(req.user.id);
  }

  @Get('total')
  async getTotal(@Req() req: any) {
    return this.usage.getUserTotalUsage(req.user.id);
  }
}
