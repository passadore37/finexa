import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authGuard } from '@/lib/auth-guard';

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  const { perfil, limite } = await req.json();
  await supabase.from('limites_financeiros').upsert({ perfil, limite, family_id }, { onConflict: 'perfil,family_id' });
  return NextResponse.json({ success: true });
}
