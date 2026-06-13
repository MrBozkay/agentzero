import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '@/lib/api';

const BASE = 'http://localhost:4000/api/v1';

function mockJsonResponse(data: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(data), text: () => Promise.resolve(JSON.stringify(data)) };
}

function mockTextResponse(text: string, status: number) {
  return { ok: false, status, json: () => Promise.resolve({}), text: () => Promise.resolve(text) };
}

describe('ApiClient - Auth', () => {

  describe('login', () => {
    it('should POST /auth/login with email and password', async () => {
      const client = new ApiClient();
      client.baseUrl = BASE;

      const mockResponse = {
        accessToken: 'jwt-token',
        user: { id: '1', email: 'test@example.com', name: 'Test' },
      };
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockJsonResponse(mockResponse) as any);

      const result = await client.auth.login({ email: 'test@example.com', password: 'secret123' });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'test@example.com', password: 'secret123' }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw on API error', async () => {
      const client = new ApiClient();
      client.baseUrl = BASE;

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockTextResponse('Invalid credentials', 401) as any);

      await expect(
        client.auth.login({ email: 'bad@email.com', password: 'wrong' }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should POST /auth/register with email, password, and name', async () => {
      const client = new ApiClient();
      client.baseUrl = BASE;

      const mockResponse = {
        accessToken: 'jwt-token',
        user: { id: '1', email: 'new@example.com', name: 'New User' },
      };
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockJsonResponse(mockResponse) as any);

      const result = await client.auth.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/auth/register`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'new@example.com', password: 'password123', name: 'New User' }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw on validation error', async () => {
      const client = new ApiClient();
      client.baseUrl = BASE;

      vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockTextResponse('Email and password are required', 400) as any);

      await expect(
        client.auth.register({ email: '', password: '' }),
      ).rejects.toThrow('Email and password are required');
    });
  });

  describe('googleAuth', () => {
    it('should POST /auth/google with googleIdToken', async () => {
      const client = new ApiClient();
      client.baseUrl = BASE;

      const mockResponse = {
        accessToken: 'jwt-token',
        user: { id: '1', email: 'google@example.com', name: 'Google User' },
      };
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockJsonResponse(mockResponse) as any);

      const result = await client.auth.googleAuth({ googleIdToken: 'google-id-token-123' });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/auth/google`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ googleIdToken: 'google-id-token-123' }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('supabaseAuth', () => {
    it('should POST /auth/supabase with Supabase access token', async () => {
      const client = new ApiClient();
      client.baseUrl = BASE;

      const mockResponse = {
        accessToken: 'jwt-token',
        user: { id: '1', email: 'supabase@example.com', name: 'Supabase User' },
      };
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockJsonResponse(mockResponse) as any);

      const result = await client.auth.supabaseAuth({ accessToken: 'supabase-session-token' });

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE}/auth/supabase`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ accessToken: 'supabase-session-token' }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('setToken', () => {
    it('should send Authorization header when token is set', async () => {
      const client = new ApiClient();
      client.baseUrl = BASE;
      client.setToken('my-jwt');

      const spy = vi.spyOn(global, 'fetch').mockResolvedValue(
        mockJsonResponse({ accessToken: 'new-jwt', user: { id: '1', email: 'a@b.com', name: 'A' } }) as any,
      );

      await client.auth.login({ email: 'a@b.com', password: 'pwd' });

      expect(spy).toHaveBeenCalledWith(
        `${BASE}/auth/login`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-jwt',
          }),
        }),
      );
    });
  });
});
