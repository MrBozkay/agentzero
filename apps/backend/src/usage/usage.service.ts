import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsageService {
  constructor(private readonly prisma: PrismaService) {}

  async logUsage(dto: {
    userId: string;
    agentId?: string;
    tokensInput: number;
    tokensOutput: number;
    costUsd: number;
  }) {
    return this.prisma.usageLog.create({
      data: {
        userId: dto.userId,
        agentId: dto.agentId || null,
        tokensInput: dto.tokensInput,
        tokensOutput: dto.tokensOutput,
        costUsd: dto.costUsd,
      },
    });
  }

  async getUserUsage(userId: string) {
    return this.prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getUserTotalUsage(userId: string) {
    const result = await this.prisma.usageLog.aggregate({
      where: { userId },
      _sum: {
        tokensInput: true,
        tokensOutput: true,
        costUsd: true,
      },
    });

    return {
      totalTokensInput: result._sum.tokensInput || 0,
      totalTokensOutput: result._sum.tokensOutput || 0,
      totalCostUsd: result._sum.costUsd || 0,
    };
  }
}
