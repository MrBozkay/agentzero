import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AuthCallbackPage from '@/app/auth/callback/page';

// Mock Supabase
const mockExchangeCode = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: (...args: any[]) => mockExchangeCode(...args),
    },
  },
}));

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      supabaseAuth: vi.fn(),
    },
    setToken: vi.fn(),
  },
}));

// Mock router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

import { api } from '@/lib/api';

describe('AuthCallbackPage', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockExchangeCode.mockReset();
  });

  it('should show loading state initially', () => {
    mockExchangeCode.mockReturnValue(new Promise(() => {})); // never resolves
    render(<AuthCallbackPage />);
    expect(screen.getByText('Completing sign-in...')).toBeInTheDocument();
  });

  it('should exchange code and redirect to dashboard on success', async () => {
    mockExchangeCode.mockResolvedValueOnce({
      data: {
        session: { access_token: 'supabase-token-123' },
      },
      error: null,
    });
    (api.auth.supabaseAuth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: 'backend-jwt',
    });

    render(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mockExchangeCode).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(api.auth.supabaseAuth).toHaveBeenCalledWith({ accessToken: 'supabase-token-123' });
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error and redirect to /auth on failure', async () => {
    mockExchangeCode.mockResolvedValueOnce({
      data: null,
      error: new Error('Invalid code'),
    });

    render(<AuthCallbackPage />);

    await waitFor(
      () => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Should redirect to /auth after 3 seconds
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/auth');
      },
      { timeout: 5000 },
    );
  });

  it('should show error when no session returned', async () => {
    mockExchangeCode.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    render(<AuthCallbackPage />);

    await waitFor(
      () => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
