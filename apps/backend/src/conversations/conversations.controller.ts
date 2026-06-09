import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/v1/conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    return this.conversations.create({ ...dto, userId: req.user.id });
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.conversations.findByUser(req.user.id);
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string, @Req() req: any) {
    return this.conversations.getMessages(id, req.user.id);
  }

  @Post(':id/messages')
  async sendMessage(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    return this.conversations.sendMessage({ ...dto, conversationId: id });
  }

  @Patch(':id/close')
  async close(@Param('id') id: string, @Req() req: any) {
    return this.conversations.close(id, req.user.id);
  }
}
