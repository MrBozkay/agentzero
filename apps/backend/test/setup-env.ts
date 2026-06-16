// E2E test setup — sets required env vars before any module is loaded.
// Without this, services that read process.env in their constructors throw.

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-google-client-id';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
