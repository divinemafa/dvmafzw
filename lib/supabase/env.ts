export const SUPABASE_PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_PUBLIC_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_CONFIG_MISSING_MESSAGE =
  'Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before using Supabase features.';

export const isSupabaseConfigured = Boolean(
  SUPABASE_PUBLIC_URL && SUPABASE_PUBLIC_ANON_KEY,
);

export const getSupabaseConfigMessage = (context?: string) => (
  context
    ? `${SUPABASE_CONFIG_MISSING_MESSAGE} ${context}`
    : SUPABASE_CONFIG_MISSING_MESSAGE
);
