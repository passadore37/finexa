// lib/supabase.ts
// Exporta DUAS formas de cliente para compatibilidade:
//
// 1. `supabase` — instância com service_role para API Routes (server-side)
//    Usado pelos arquivos existentes: import { supabase } from '@/lib/supabase'
//
// 2. `createClient` — função que cria cliente browser com @supabase/ssr
//    Usado pelas novas páginas de auth: import { createClient } from '@/lib/supabase'

import { createClient as createBrowserClient } from '@supabase/ssr';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// ── Cliente server-side com service_role (API Routes) ──────────────────────
// Mantém compatibilidade com todos os arquivos existentes
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function createSupabaseStub() {
  const dummyResponse = { data: null, error: null };
  const chain: any = {};
  const noopChain = () => chain;
  const asyncDummy = async () => dummyResponse;
  chain.from = noopChain;
  chain.select = noopChain;
  chain.gte = noopChain;
  chain.lte = noopChain;
  chain.order = noopChain;
  chain.eq = noopChain;
  chain.limit = noopChain;
  chain.single = asyncDummy;
  chain.insert = asyncDummy;
  chain.update = asyncDummy;
  chain.delete = asyncDummy;
  return chain;
}

export const supabase = (supabaseUrl && supabaseKey)
  ? createServiceClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  : createSupabaseStub();

// ── Cliente browser-side com @supabase/ssr (Auth nas páginas) ─────────────
// Usado pelas páginas de login, cadastro, plano e hook useAuth
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
