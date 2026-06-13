import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeAll(() => {
    process.env.SUPABASE_URL = 'https://testproject.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupabaseService],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create Supabase clients with env config', () => {
      expect(service).toBeDefined();
      expect(service.getClient()).toBeDefined();
      expect(service.getAdminClient()).toBeDefined();
    });

    it('should throw if SUPABASE_URL is missing', () => {
      delete process.env.SUPABASE_URL;
      expect(() => new SupabaseService()).toThrow('SUPABASE_URL is required');
      process.env.SUPABASE_URL = 'https://testproject.supabase.co';
    });

    it('should throw if SUPABASE_ANON_KEY is missing', () => {
      delete process.env.SUPABASE_ANON_KEY;
      expect(() => new SupabaseService()).toThrow('SUPABASE_ANON_KEY is required');
      process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    });
  });

  describe('getClient', () => {
    it('should return the public (anon) Supabase client', () => {
      const client = service.getClient();
      expect(client).toBeDefined();
      // Client should have auth property
      expect(client.auth).toBeDefined();
    });
  });

  describe('getAdminClient', () => {
    it('should return the admin (service_role) Supabase client', () => {
      const adminClient = service.getAdminClient();
      expect(adminClient).toBeDefined();
      expect(adminClient.auth).toBeDefined();
    });
  });

  describe('signInWithGoogle', () => {
    it('should return a Google OAuth URL', async () => {
      const result = await service.signInWithGoogle('http://localhost:3001/auth/callback');
      expect(result).toHaveProperty('url');
      expect(result.url).toContain('supabase.co/auth/v1/authorize?provider=google');
    });
  });

  describe('getUserBySupabaseId', () => {
    it('should return null for non-existent user', async () => {
      const result = await service.getUserBySupabaseId('non-existent-id');
      expect(result).toBeNull();
    });
  });
});
