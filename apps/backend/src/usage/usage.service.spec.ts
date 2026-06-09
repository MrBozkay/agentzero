import { Test, TestingModule } from '@nestjs/testing';
import { UsageService } from './usage.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsageService', () => {
  let service: UsageService;
  let prisma: PrismaService;

  const mockPrisma = {
    usageLog: {
      findMany: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsageService>(UsageService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logUsage', () => {
    it('should create a usage log entry', async () => {
      mockPrisma.usageLog.create.mockResolvedValue({
        id: 'log-1',
        userId: 'user-1',
        agentId: 'agent-1',
        tokensInput: 100,
        tokensOutput: 50,
        costUsd: 0.003,
        createdAt: new Date(),
      });

      const result = await service.logUsage({
        userId: 'user-1',
        agentId: 'agent-1',
        tokensInput: 100,
        tokensOutput: 50,
        costUsd: 0.003,
      });

      expect(result.tokensInput).toBe(100);
      expect(result.costUsd).toBe(0.003);
    });
  });

  describe('getUserUsage', () => {
    it('should return usage logs for a user', async () => {
      mockPrisma.usageLog.findMany.mockResolvedValue([
        { id: 'log-1', tokensInput: 100, tokensOutput: 50, costUsd: 0.003 },
      ]);

      const result = await service.getUserUsage('user-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.usageLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });

  describe('getUserTotalUsage', () => {
    it('should return aggregated usage', async () => {
      mockPrisma.usageLog.aggregate.mockResolvedValue({
        _sum: { tokensInput: 1000, tokensOutput: 500, costUsd: 0.03 },
      });

      const result = await service.getUserTotalUsage('user-1');

      expect(result.totalTokensInput).toBe(1000);
      expect(result.totalTokensOutput).toBe(500);
      expect(result.totalCostUsd).toBe(0.03);
    });
  });
});
