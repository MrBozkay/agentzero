import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AgentsService', () => {
  let service: AgentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    agent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockAgent = {
    id: 'agent-1',
    userId: 'user-1',
    name: 'Sales Bot',
    description: 'Handles sales queries',
    type: 'chat',
    llmProvider: 'anthropic',
    model: 'claude-sonnet-4',
    systemPrompt: 'You are a sales assistant',
    tools: null,
    config: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create', () => {
    it('should create an agent', async () => {
      mockPrisma.agent.create.mockResolvedValue(mockAgent);

      const result = await service.create('user-1', {
        name: 'Sales Bot',
        description: 'Handles sales queries',
        type: 'chat',
        systemPrompt: 'You are a sales assistant',
      });

      expect(result.id).toBe('agent-1');
      expect(result.name).toBe('Sales Bot');
      expect(mockPrisma.agent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            name: 'Sales Bot',
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all agents for a user', async () => {
      mockPrisma.agent.findMany.mockResolvedValue([mockAgent]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Sales Bot');
      expect(mockPrisma.agent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', isActive: true },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an agent by id and userId', async () => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent);

      const result = await service.findOne('agent-1', 'user-1');

      expect(result.name).toBe('Sales Bot');
    });

    it('should throw NotFoundException if agent does not exist', async () => {
      mockPrisma.agent.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('agent-999', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if agent belongs to another user', async () => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent);

      await expect(
        service.findOne('agent-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update an agent', async () => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrisma.agent.update.mockResolvedValue({
        ...mockAgent,
        name: 'Updated Bot',
      });

      const result = await service.update('agent-1', 'user-1', {
        name: 'Updated Bot',
      });

      expect(result.name).toBe('Updated Bot');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent);

      await expect(
        service.update('agent-1', 'other-user', { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete an agent', async () => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrisma.agent.delete.mockResolvedValue(mockAgent);

      const result = await service.remove('agent-1', 'user-1');

      expect(result.id).toBe('agent-1');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockPrisma.agent.findUnique.mockResolvedValue(mockAgent);

      await expect(
        service.remove('agent-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
