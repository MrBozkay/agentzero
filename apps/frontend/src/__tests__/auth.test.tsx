import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthPage from '@/app/auth/page';

// Mock Google OAuth
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => children,
  GoogleLogin: ({ onSuccess, onError }: { onSuccess: (r: any) => void; onError: () => void }) => (
    <button
      data-testid="google-login-btn"
      onClick={() => onSuccess({ credential: 'mock-google-token' })}
    >
      Sign in with Google
    </button>
  ),
}));

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    auth: {
      login: vi.fn(),
      register: vi.fn(),
      googleAuth: vi.fn(),
      supabaseAuth: vi.fn(),
    },
    setToken: vi.fn(),
  },
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  }),
}));

import { api } from '@/lib/api';

describe('AuthPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render login form by default', () => {
    render(<AuthPage />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in$/i })).toBeInTheDocument();
  });

  it('should toggle to register form', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);

    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
  });

  it('should show validation error on empty submit', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);

    // HTML5 validation prevents empty submit — just check required attrs
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('should call api.auth.login on form submit', async () => {
    const user = userEvent.setup();
    (api.auth.login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: 'jwt-123',
      user: { id: '1', email: 'test@test.com', name: 'Test' },
    });

    render(<AuthPage />);

    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in$/i }));

    await waitFor(() => {
      expect(api.auth.login).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('should call api.auth.register when in register mode', async () => {
    const user = userEvent.setup();
    (api.auth.register as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      accessToken: 'jwt-456',
      user: { id: '2', email: 'new@test.com', name: 'New' },
    });

    render(<AuthPage />);

    // Switch to register
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await user.type(screen.getByPlaceholderText('Your name'), 'New User');
    await user.type(screen.getByPlaceholderText('you@example.com'), 'new@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(api.auth.register).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
      });
    });
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    (api.auth.login as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Invalid credentials'),
    );

    render(<AuthPage />);

    await user.type(screen.getByPlaceholderText('you@example.com'), 'bad@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should render Google login button', () => {
    render(<AuthPage />);
    expect(screen.getByTestId('google-login-btn')).toBeInTheDocument();
  });

  it('should render Supabase Google button', () => {
    render(<AuthPage />);
    expect(screen.getByRole('button', { name: /continue with google \(supabase\)/i })).toBeInTheDocument();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<AuthPage />);

    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye icon button (next to password input)
    const toggleBtn = passwordInput.parentElement!.querySelector('button')!;
    await user.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
