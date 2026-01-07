import { createClient } from '@supabase/supabase-js';

function sanitize(value?: string): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  const unquoted = trimmed.replace(/^['"`]\s*(.*?)\s*['"`]$/, '$1')
  return unquoted
}

const RAW_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const RAW_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
const url = sanitize(RAW_URL);
const anonKey = sanitize(RAW_KEY);

const safeUrl = url ?? 'https://example.supabase.co';
const safeKey = anonKey ?? 'invalid';

export const supabase = createClient(safeUrl, safeKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
