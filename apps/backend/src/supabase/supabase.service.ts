import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const anonKey = process.env.SUPABASE_ANON_KEY || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }
    if (!anonKey) {
      throw new Error('SUPABASE_ANON_KEY is required');
    }

    this.client = createClient(supabaseUrl, anonKey);

    if (serviceRoleKey) {
      this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  getAdminClient(): SupabaseClient {
    return this.adminClient || this.client;
  }

  async signInWithGoogle(redirectTo: string) {
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  }

  async exchangeSession(authCode: string) {
    const { data, error } = await this.client.auth.exchangeCodeForSession(authCode);
    if (error) throw error;
    return data;
  }

  async getUserBySupabaseId(supabaseUserId: string) {
    // In production, this would query the Prisma DB
    // For now, return null as the Supabase module doesn't manage local users directly
    return null;
  }

  async verifySession(accessToken: string) {
    const { data, error } = await this.client.auth.getUser(accessToken);
    if (error) throw error;
    return data.user;
  }
}
