import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let prisma: PrismaService;

  const mockPrisma = {
    conversation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockConversation = {
    id: 'conv-1',
    agentId: 'agent-1',
    userId: 'user-1',
    channel: 'web',
    status: 'ACTIVE',
    createdAt: new Date(),
  };

  describe('create', () => {
    it('should create a conversation', async () => {
      mockPrisma.conversation.create.mockResolvedValue(mockConversation);

      const result = await service.create({
        agentId: 'agent-1',
        userId: 'user-1',
        channel: 'web',
      });

      expect(result.id).toBe('conv-1');
      expect(result.status).toBe('ACTIVE');
    });
  });

  describe('findByUser', () => {
    it('should return conversations for a user', async () => {
      mockPrisma.conversation.findMany.mockResolvedValue([mockConversation]);

      const result = await service.findByUser('user-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        }),
      );
    });
  });

  describe('sendMessage', () => {
    it('should add a message to a conversation', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrisma.message.create.mockResolvedValue({
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        tokensUsed: null,
        createdAt: new Date(),
      });

      const result = await service.sendMessage({
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
      });

      expect(result.role).toBe('user');
      expect(result.content).toBe('Hello');
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage({
          conversationId: 'conv-999',
          role: 'user',
          content: 'Hello',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMessages', () => {
    it('should return messages for a conversation', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrisma.message.findMany.mockResolvedValue([
        { id: 'msg-1', role: 'user', content: 'Hi', createdAt: new Date() },
        { id: 'msg-2', role: 'assistant', content: 'Hello!', createdAt: new Date() },
      ]);

      const result = await service.getMessages('conv-1', 'user-1');

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('user');
      expect(result[1].role).toBe('assistant');
    });

    it('should throw NotFoundException if conversation does not exist', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(null);

      await expect(
        service.getMessages('conv-999', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('close', () => {
    it('should mark conversation as CLOSED', async () => {
      mockPrisma.conversation.findUnique.mockResolvedValue(mockConversation);
      mockPrisma.conversation.update.mockResolvedValue({
        ...mockConversation,
        status: 'CLOSED',
      });

      const result = await service.close('conv-1', 'user-1');

      expect(result.status).toBe('CLOSED');
    });
  });
});
