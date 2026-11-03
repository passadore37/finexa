import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authGuard } from '@/lib/auth-guard';

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data, error: err } = await admin
      .from('cartoes')
      .select('id, nome, dia_fechamento, dia_vencimento, perfil_dono')
      .eq('family_id', family_id)
      .order('created_at', { ascending: true });
    if (err) throw err;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('[GET /api/cartoes]', err);
    return NextResponse.json({ success: false, error: 'Erro ao buscar cartões' }, { status: 500 });
  }
}
