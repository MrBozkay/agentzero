import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// We test the hook in two states:
// (a) no token in localStorage → user stays null, no fetch
// (b) token in localStorage → fetch /auth/me → user populated

// vi.mock factories are hoisted to the top of the file, so any variables
// they reference must be hoisted too. vi.hoisted gives us a hoisted scope.
const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    setToken: vi.fn(),
    auth: {
      me: vi.fn(),
    },
  },
}));

vi.mock('@/lib/api', () => ({
  api: mockApi,
}));

import { useUser } from '@/hooks/useUser';

describe('useUser', () => {
  beforeEach(() => {
    localStorage.clear();
    mockApi.setToken.mockClear();
    mockApi.auth.me.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 🔴🔴 RED→GREEN — Slice 4: useUser() reads token, fetches /me, returns { user, loading, error }

  it('returns null user and loading=false when no token in localStorage', () => {
    const { result } = renderHook(() => useUser());

    // No token → no fetch, immediate null
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockApi.auth.me).not.toHaveBeenCalled();
  });

  it('fetches /auth/me when a token is in localStorage and returns the user', async () => {
    localStorage.setItem('token', 'jwt-123');
    mockApi.auth.me.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      role: 'USER',
      plan: 'FREE',
    });

    const { result } = renderHook(() => useUser());

    // Initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    expect(result.current.user).toEqual({
      id: 'u1',
      email: 'a@a.com',
      role: 'USER',
      plan: 'FREE',
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockApi.auth.me).toHaveBeenCalledOnce();
  });

  it('clears the token and sets error when /auth/me fails with 401', async () => {
    localStorage.setItem('token', 'expired-jwt');
    mockApi.auth.me.mockRejectedValue(new Error('API 401: Unauthorized'));

    const { result } = renderHook(() => useUser());

    // Wait until the error state has been set (not just user=null, which is
    // the initial state and would pass waitFor immediately).
    await waitFor(() => {
      expect(result.current.error).toBe('API 401: Unauthorized');
    });

    expect(result.current.user).toBeNull();
    expect(mockApi.setToken).toHaveBeenCalledWith(null);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('keeps the token but surfaces error when /auth/me fails with non-401 error', async () => {
    localStorage.setItem('token', 'valid-jwt');
    mockApi.auth.me.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    expect(result.current.user).toBeNull();
    // Non-401 errors should NOT auto-logout — the token might still be valid
    // and the network might come back.
    expect(mockApi.setToken).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('valid-jwt');
  });

  it('exposes a logout function that clears the token and user state', async () => {
    localStorage.setItem('token', 'jwt-123');
    mockApi.auth.me.mockResolvedValue({
      id: 'u1',
      email: 'a@a.com',
      role: 'USER',
      plan: 'FREE',
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.user).not.toBeNull();
    });

    act(() => {
      result.current.logout();
    });

    expect(mockApi.setToken).toHaveBeenCalledWith(null);
    expect(result.current.user).toBeNull();
  });
});

