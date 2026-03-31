import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente legado — usado pelas API routes existentes
// import { supabase } from '@/lib/supabase'
export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente browser com SSR — usado pelas novas páginas de auth
// import { createClient } from '@/lib/supabase'
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}