import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AgentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: {
      name: string;
      description?: string;
      type: string;
      systemPrompt?: string;
    },
  ) {
    return this.prisma.agent.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description || null,
        type: dto.type,
        systemPrompt: dto.systemPrompt || null,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.agent.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    if (agent.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return agent;
  }

  async update(id: string, userId: string, dto: Partial<{ name: string; description: string; systemPrompt: string; isActive: boolean }>) {
    await this.findOne(id, userId);
    return this.prisma.agent.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.agent.delete({ where: { id } });
  }
}
