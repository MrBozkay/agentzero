import { createClient, SupabaseClient } from '@supabase/supabase-js';

function createSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build/SSR without env vars, create a dummy client to avoid crashes
  // Real client is created lazily on first browser use
  return createClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-key',
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    },
  );
}

export const supabase = createSupabaseClient();

export function getSupabaseClient(): SupabaseClient {
  return supabase;
}
