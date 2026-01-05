import { createClient } from '@supabase/supabase-js';

function getEnv(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const anonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const safeUrl = url ?? 'https://example.supabase.co';
const safeKey = anonKey ?? 'invalid';

export const supabase = createClient(safeUrl, safeKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
