import { createClient } from '@supabase/supabase-js';

// Replace with your project URL: https://<project-ref>.supabase.co
// (or set VITE_SUPABASE_URL in .env). The bare "https://supabase.co" is not a
// valid project endpoint, so requests will fail until it is replaced.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_lJ4ccZGCJfFCr7e2mMlfbQ_OWisKFKY';

export const isSupabaseConfigured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(SUPABASE_URL);

if (!isSupabaseConfigured) {
  console.warn(
    '[drovex] Supabase URL is not set to a project endpoint (https://<project-ref>.supabase.co). ' +
      'Copy .env.example to .env and fill it in.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const PLATFORMS = ['Facebook', 'Instagram', 'Telegram', 'WhatsApp', 'LinkedIn'];
