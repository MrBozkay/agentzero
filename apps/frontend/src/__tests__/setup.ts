import '@testing-library/jest-dom/vitest';

// Global fetch mock using Vitest
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/auth',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api/v1';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3001';
