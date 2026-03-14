import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { valor, categoria, descricao, perfil, divisao, parcela_atual, total_parcelas } = body;
    if (!valor || !categoria) return NextResponse.json({ success: false, error: 'Valor e categoria obrigatórios' }, { status: 400 });
    const { data, error } = await supabase.from('transacoes').insert({
      data: new Date().toISOString().split('T')[0],
      valor: Number(valor), categoria,
      descricao: descricao || categoria,
      perfil: perfil || 'casal',
      divisao: divisao || '50/50',
      parcela_atual: parcela_atual || 1,
      total_parcelas: total_parcelas || 1,
      recorrente: false,
    }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erro ao salvar' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, valor, categoria, descricao } = body;
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    const { data, error } = await supabase.from('transacoes')
      .update({ valor: Number(valor), categoria, descricao })
      .eq('id', id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    await supabase.from('transacoes').delete().eq('id', id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
    const { data, error } = await supabase.from('transacoes').select('*')
      .gte('data', inicio).lte('data', fim)
      .order('data', { ascending: false }).limit(200);
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Erro ao buscar' }, { status: 500 });
  }
}
