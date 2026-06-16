'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function NavBar() {
  const { user, loading, logout } = useUser();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/auth');
    router.refresh();
  }

  // shadcn/ui base-ui Button does not support `asChild`, so we render
  // anchor-styled <Link> elements directly with the same visual treatment.
  const linkClass = cn(
    'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium',
    'h-9 px-3 transition-colors hover:bg-accent hover:text-accent-foreground',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">🤖</span>
          <span>AgentZero</span>
        </Link>

        <nav className="flex items-center gap-2">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading session" />
          )}

          {!loading && !user && (
            <Link href="/auth" className={linkClass} data-testid="sign-in-link">
              Sign in
            </Link>
          )}

          {!loading && user && (
            <div className="flex items-center gap-2">
              {user.role === 'ADMIN' && (
                <Link href="/admin/users" className={linkClass}>
                  <Shield className="mr-1 h-4 w-4" />
                  Admin
                </Link>
              )}

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                <span data-testid="user-email">{user.email}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <LogOut className="mr-1 h-4 w-4" />
                Log out
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
