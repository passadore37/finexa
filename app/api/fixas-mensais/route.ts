import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Secret opcional — obrigatório apenas para chamadas externas (cron)
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    if (secret && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const hoje = new Date();
    const mesAtual = `${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][hoje.getMonth()]}-${String(hoje.getFullYear()).slice(2)}`;
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];

    // Buscar planejamento
    const { data: planejamento } = await supabase
      .from('planejamento')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (!planejamento?.contas_fixas?.length) {
      return NextResponse.json({ success: true, message: 'Nenhuma conta fixa configurada', inseridas: 0 });
    }

    // Verificar quais fixas já existem este mês
    const { data: existentes } = await supabase
      .from('transacoes')
      .select('descricao')
      .eq('data', primeiroDia)
      .eq('recorrente', true);

    const descricoesExistentes = new Set(
      (existentes || []).map((t: any) => t.descricao.toLowerCase().trim())
    );

    // Montar inserções apenas das que não existem ainda
    const novas = planejamento.contas_fixas
      .filter((c: any) => !descricoesExistentes.has(c.descricao.toLowerCase().trim()))
      .map((c: any) => ({
        data: primeiroDia,
        valor: Number(c.valor),
        categoria: c.categoria,
        descricao: c.descricao,
        perfil: 'casal',
        divisao: '50/50',
        parcela_atual: 1,
        total_parcelas: 1,
        recorrente: true,
      }));

    if (novas.length === 0) {
      return NextResponse.json({ success: true, message: 'Contas fixas já existem este mês', inseridas: 0 });
    }

    const { error } = await supabase.from('transacoes').insert(novas);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `${novas.length} conta(s) fixa(s) inserida(s) para ${mesAtual}`,
      inseridas: novas.length,
      contas: novas.map((c: any) => c.descricao),
    });
  } catch (error) {
    console.error('Erro ao inserir fixas mensais:', error);
    return NextResponse.json({ success: false, error: 'Erro ao inserir contas fixas' }, { status: 500 });
  }
}

// GET para verificar status sem inserir
export async function GET() {
  try {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];

    const { data: planejamento } = await supabase
      .from('planejamento')
      .select('contas_fixas')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    const { data: existentes } = await supabase
      .from('transacoes')
      .select('descricao, valor')
      .eq('recorrente', true)
      .gte('data', primeiroDia);

    return NextResponse.json({
      success: true,
      configuradas: planejamento?.contas_fixas?.length || 0,
      inseridas_este_mes: existentes?.length || 0,
      transacoes: existentes || [],
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro ao verificar' }, { status: 500 });
  }
}
