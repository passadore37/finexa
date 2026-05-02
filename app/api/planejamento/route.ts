import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { data, error: err } = await getAdmin()
      .from('planejamento').select('*')
      .eq('family_id', family_id)
      .order('updated_at', { ascending: false })
      .limit(1).single();
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao buscar planejamento' }, { status: 500 }); }
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { salario_membro0, salario_membro1, percentual_investimento, contas_fixas,
            reserva_atual, meta_economia_membro0, meta_economia_membro1, 
            limite_gasto_mensal } = body;
    const { data: existing } = await getAdmin().from('planejamento')
      .select('id').eq('family_id', family_id).limit(1).single();
    const payload = {
      salario_membro0, salario_membro1, percentual_investimento, contas_fixas,
      reserva_atual: reserva_atual || 0,
      meta_economia_membro0: meta_economia_membro0 || 0,
      meta_economia_membro1: meta_economia_membro1 || 0,
      limite_gasto_mensal: limite_gasto_mensal || 9000,
      updated_at: new Date().toISOString(),
    };
    const result = existing?.id
      ? await getAdmin().from('planejamento').update(payload).eq('id', existing.id).select().single()
      : await getAdmin().from('planejamento').insert({ ...payload, family_id }).select().single();
    if (result.error) throw result.error;
    return NextResponse.json({ success: true, data: result.data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao salvar' }, { status: 500 }); }
}
