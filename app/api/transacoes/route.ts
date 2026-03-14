import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { valor, categoria, descricao, perfil, divisao, parcela_atual, total_parcelas } = body;

    if (!valor || !categoria) {
      return NextResponse.json({ success: false, error: 'Valor e categoria são obrigatórios' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('transacoes')
      .insert({
        data: new Date().toISOString().split('T')[0],
        valor: Number(valor),
        categoria,
        descricao: descricao || categoria,
        perfil: perfil || 'casal',
        divisao: divisao || '50/50',
        parcela_atual: parcela_atual || 1,
        total_parcelas: total_parcelas || 1,
        recorrente: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao salvar transação:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro ao salvar' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('mes');

    let query = supabase.from('transacoes').select('*').order('data', { ascending: false });

    if (mes) {
      const [m, a] = mes.split('-');
      const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      const mesNum = meses.indexOf(m);
      if (mesNum >= 0) {
        const ano = parseInt(`20${a}`);
        const inicio = new Date(ano, mesNum, 1).toISOString().split('T')[0];
        const fim = new Date(ano, mesNum + 1, 0).toISOString().split('T')[0];
        query = query.gte('data', inicio).lte('data', fim);
      }
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao buscar transações' }, { status: 500 });
  }
}
