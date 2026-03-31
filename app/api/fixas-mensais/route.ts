import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authGuard } from '@/lib/auth-guard';

export async function POST(req: Request) {
  // Cron externo usa ?secret=... — não precisa de sessão
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  if (secret) {
    if (secret !== process.env.CRON_SECRET)
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  } else {
    const { error } = await authGuard(req);
    if (error) return error;
  }

  try {
    const hoje = new Date();
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const mesAtual = `${meses[hoje.getMonth()]}-${String(hoje.getFullYear()).slice(2)}`;
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];

    // Para cron sem sessão, busca todos os planejamentos ativos
    const { data: planejamentos } = await supabase
      .from('planejamento').select('*').order('updated_at', { ascending: false });

    if (!planejamentos?.length)
      return NextResponse.json({ success: true, message: 'Nenhum planejamento encontrado', inseridas: 0 });

    let totalInseridas = 0;

    for (const planejamento of planejamentos) {
      if (!planejamento?.contas_fixas?.length) continue;

      const salLet = Number(planejamento.salario_leticia || 0);
      const salGio = Number(planejamento.salario_giovanna || 0);
      const total = salLet + salGio;
      const propLet = total > 0 ? Math.round((salLet / total) * 100) : 50;
      const divisaoReal = `${propLet}/${100 - propLet}`;

      const { data: existentes } = await supabase.from('transacoes').select('descricao')
        .eq('family_id', planejamento.family_id).eq('data', primeiroDia).eq('recorrente', true);

      const descricoesExistentes = new Set((existentes || []).map((t: any) => t.descricao.toLowerCase().trim()));

      const novas = planejamento.contas_fixas
        .filter((c: any) => !descricoesExistentes.has(c.descricao.toLowerCase().trim()))
        .map((c: any) => ({
          data: primeiroDia, valor: Number(c.valor), categoria: c.categoria,
          descricao: c.descricao, perfil: 'casal', divisao: divisaoReal,
          parcela_atual: 1, total_parcelas: 1, recorrente: true,
          family_id: planejamento.family_id,
        }));

      if (novas.length > 0) {
        await supabase.from('transacoes').insert(novas);
        totalInseridas += novas.length;
      }
    }

    return NextResponse.json({ success: true, message: `${totalInseridas} conta(s) inserida(s) para ${mesAtual}`, inseridas: totalInseridas });
  } catch (err) {
    console.error('Erro fixas-mensais:', err);
    return NextResponse.json({ success: false, error: 'Erro ao inserir despesas fixas' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const { data: planejamento } = await supabase.from('planejamento').select('contas_fixas')
      .eq('family_id', family_id).order('updated_at', { ascending: false }).limit(1).single();
    const { data: existentes } = await supabase.from('transacoes').select('descricao, valor')
      .eq('family_id', family_id).eq('recorrente', true).gte('data', primeiroDia);
    return NextResponse.json({ success: true, configuradas: planejamento?.contas_fixas?.length || 0, inseridas_este_mes: existentes?.length || 0, transacoes: existentes || [] });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao verificar' }, { status: 500 }); }
}
