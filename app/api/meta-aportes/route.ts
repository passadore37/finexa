import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// GET /api/meta-aportes?meta_id=xxx — histórico de aportes de uma meta
export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const meta_id = new URL(req.url).searchParams.get('meta_id');
    let query = getAdmin().from('meta_aportes').select('*').eq('family_id', family_id);
    if (meta_id) query = query.eq('meta_id', meta_id);
    const { data, error: err } = await query.order('ano').order('mes');
    if (err) throw err;
    return NextResponse.json({ success: true, data: data || [] });
  } catch { return NextResponse.json({ success: false, error: 'Erro' }, { status: 500 }); }
}

// POST /api/meta-aportes — registrar aporte mensal
export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { meta_id, perfil, valor, mes, ano, observacao } = await req.json();
    if (!meta_id || !valor || mes === undefined || !ano)
      return NextResponse.json({ success: false, error: 'Campos obrigatórios faltando' }, { status: 400 });

    // Upsert — um aporte por membro por mês por meta
    const { data, error: err } = await getAdmin().from('meta_aportes')
      .upsert({ meta_id, family_id, perfil, valor: Number(valor), mes, ano, observacao },
        { onConflict: 'meta_id,mes,ano,perfil' })
      .select().single();
    if (err) throw err;

    // Atualizar valor_atual na meta (soma de todos os aportes)
    const { data: todos } = await getAdmin().from('meta_aportes')
      .select('valor').eq('meta_id', meta_id);
    const totalAcumulado = (todos || []).reduce((acc: number, a: any) => acc + Number(a.valor), 0);
    await getAdmin().from('metas').update({ valor_atual: totalAcumulado, updated_at: new Date().toISOString() })
      .eq('id', meta_id).eq('family_id', family_id);

    return NextResponse.json({ success: true, data, total: totalAcumulado });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao registrar aporte' }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    const { data: aporte } = await getAdmin().from('meta_aportes').select('meta_id').eq('id', id).single();
    await getAdmin().from('meta_aportes').delete().eq('id', id).eq('family_id', family_id);
    if (aporte?.meta_id) {
      const { data: todos } = await getAdmin().from('meta_aportes').select('valor').eq('meta_id', aporte.meta_id);
      const total = (todos || []).reduce((acc: number, a: any) => acc + Number(a.valor), 0);
      await getAdmin().from('metas').update({ valor_atual: total }).eq('id', aporte.meta_id);
    }
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: 'Erro' }, { status: 500 }); }
}
