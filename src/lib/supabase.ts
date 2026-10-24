import { createClient } from '@supabase/supabase-js';

// Read credentials from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verify whether valid credentials have been supplied
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project') &&
    supabaseUrl.startsWith('https://')
);

if (!isSupabaseConfigured) {
  console.info(
    '[farmin] Supabase credentials not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or Vercel Environment Variables to enable live cloud database storage and authentication.'
  );
}

// Fallback client to prevent runtime crash when keys aren't set yet
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
