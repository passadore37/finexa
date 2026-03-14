import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('planejamento')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao buscar planejamento' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salario_leticia, salario_giovanna, percentual_investimento, contas_fixas, reserva_atual, meta_economia_leticia, meta_economia_giovanna } = body;

    // Buscar ID do registro existente
    const { data: existing } = await supabase
      .from('planejamento')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing?.id) {
      result = await supabase
        .from('planejamento')
        .update({ salario_leticia, salario_giovanna, percentual_investimento, contas_fixas, reserva_atual: reserva_atual || 0, meta_economia_leticia: meta_economia_leticia || 0, meta_economia_giovanna: meta_economia_giovanna || 0, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('planejamento')
        .insert({ salario_leticia, salario_giovanna, percentual_investimento, contas_fixas, reserva_atual: reserva_atual || 0, meta_economia_leticia: meta_economia_leticia || 0, meta_economia_giovanna: meta_economia_giovanna || 0 })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao salvar planejamento' }, { status: 500 });
  }
}
