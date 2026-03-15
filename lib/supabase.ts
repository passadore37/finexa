import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
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
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  : createSupabaseStub();
