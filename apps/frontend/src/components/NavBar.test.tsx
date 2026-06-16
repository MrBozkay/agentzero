import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NavBar } from '@/components/NavBar';

const { mockUseUser } = vi.hoisted(() => ({
  mockUseUser: vi.fn(),
}));

vi.mock('@/hooks/useUser', () => ({
  useUser: mockUseUser,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

describe('NavBar', () => {
  beforeEach(() => {
    mockUseUser.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 🔴🔴 RED→GREEN — Slice 4: NavBar renders different states based on user

  it('shows Sign In link when there is no logged-in user', () => {
    mockUseUser.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      logout: vi.fn(),
    });

    render(<NavBar />);

    // Default: a link to /auth (rendered as a plain <Link>, not a button)
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/auth');
  });

  it('shows a loading indicator while useUser is loading', () => {
    mockUseUser.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      logout: vi.fn(),
    });

    render(<NavBar />);

    // We can render either a spinner or a non-committal placeholder
    // The test just needs to assert that Sign In is NOT yet visible.
    expect(screen.queryByRole('link', { name: /sign in/i })).toBeNull();
  });

  it('shows user email and Logout button when logged in as USER', async () => {
    const logout = vi.fn();
    mockUseUser.mockReturnValue({
      user: { id: 'u1', email: 'user@x.com', role: 'USER', plan: 'FREE' },
      loading: false,
      error: null,
      logout,
    });

    render(<NavBar />);

    expect(screen.getByText(/user@x\.com/)).toBeInTheDocument();
    const logoutBtn = screen.getByRole('button', { name: /log out|sign out/i });
    expect(logoutBtn).toBeInTheDocument();

    // No admin link for non-admins
    expect(screen.queryByRole('link', { name: /admin/i })).toBeNull();
  });

  it('shows an Admin link only when the user has role=ADMIN', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'a1', email: 'admin@x.com', role: 'ADMIN', plan: 'SCALE' },
      loading: false,
      error: null,
      logout: vi.fn(),
    });

    render(<NavBar />);

    const adminLink = screen.getByRole('link', { name: /admin/i });
    expect(adminLink).toBeInTheDocument();
    expect(adminLink).toHaveAttribute('href', '/admin/users');
  });

  it('calls logout when the Logout button is clicked', async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    mockUseUser.mockReturnValue({
      user: { id: 'u1', email: 'user@x.com', role: 'USER', plan: 'FREE' },
      loading: false,
      error: null,
      logout,
    });

    render(<NavBar />);
    await user.click(screen.getByRole('button', { name: /log out|sign out/i }));

    expect(logout).toHaveBeenCalledOnce();
  });
});
