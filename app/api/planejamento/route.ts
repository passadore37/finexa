import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authGuard } from '@/lib/auth-guard';

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { data, error: err } = await supabase.from('planejamento').select('*')
      .eq('family_id', family_id).order('updated_at', { ascending: false }).limit(1).single();
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao buscar planejamento' }, { status: 500 }); }
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { salario_leticia, salario_giovanna, percentual_investimento, contas_fixas, reserva_atual, meta_economia_leticia, meta_economia_giovanna } = body;
    const { data: existing } = await supabase.from('planejamento').select('id').eq('family_id', family_id).limit(1).single();
    const payload = { salario_leticia, salario_giovanna, percentual_investimento, contas_fixas, reserva_atual: reserva_atual || 0, meta_economia_leticia: meta_economia_leticia || 0, meta_economia_giovanna: meta_economia_giovanna || 0, updated_at: new Date().toISOString() };
    let result;
    if (existing?.id) {
      result = await supabase.from('planejamento').update(payload).eq('id', existing.id).select().single();
    } else {
      result = await supabase.from('planejamento').insert({ ...payload, family_id }).select().single();
    }
    if (result.error) throw result.error;
    return NextResponse.json({ success: true, data: result.data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao salvar planejamento' }, { status: 500 }); }
}
