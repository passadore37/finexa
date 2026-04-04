import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authGuard } from '@/lib/auth-guard';

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
    const { data, error: err } = await supabase.from('transacoes').select('*')
      .eq('family_id', family_id)
      .gte('data', inicio).lte('data', fim)
      .order('data', { ascending: false }).limit(200);
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao buscar' }, { status: 500 }); }
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { valor, categoria, descricao, perfil, divisao, parcela_atual, total_parcelas, recorrente, tipo, data, responsavel } = body;
    if (!valor || !categoria) return NextResponse.json({ success: false, error: 'Valor e categoria obrigatórios' }, { status: 400 });
    const { data: result, error: err } = await supabase.from('transacoes').insert({
      data: data || (() => {
        // Usar data local (não UTC) para evitar bug de timezone
        const agora = new Date();
        const ano = agora.getFullYear();
        const mes = String(agora.getMonth() + 1).padStart(2, '0');
        const dia = String(agora.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
      })(),
      valor: Number(valor), categoria,
      descricao: descricao || categoria,
      perfil: perfil || 'casal',
      divisao: divisao || '50/50',
      parcela_atual: parcela_atual || 1,
      total_parcelas: total_parcelas || 1,
      recorrente: recorrente || false,
      tipo: tipo || 'despesa',
      responsavel: responsavel || null,
      family_id,
    }).select().single();
    if (err) throw err;
    return NextResponse.json({ success: true, data: result });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao salvar' }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { id, valor, categoria, descricao } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    const { data, error: err } = await supabase.from('transacoes')
      .update({ valor: Number(valor), categoria, descricao })
      .eq('id', id).eq('family_id', family_id)
      .select().single();
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    await supabase.from('transacoes').delete().eq('id', id).eq('family_id', family_id);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 }); }
}
