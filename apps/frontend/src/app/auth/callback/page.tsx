'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase PKCE flow: exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error) throw error;

        if (!data.session?.access_token) {
          throw new Error('No session returned from Supabase');
        }

        // Send Supabase token to our backend
        const result = await api.auth.supabaseAuth({
          accessToken: data.session.access_token,
        });

        api.setToken(result.accessToken);
        router.push('/dashboard');
        router.refresh();
      } catch (err: unknown) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setTimeout(() => router.push('/auth'), 3000);
      }
    }

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Authentication failed: {error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
        <p className="text-muted-foreground">Completing sign-in...</p>
      </div>
    </div>
  );
}
