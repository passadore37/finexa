import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;

  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: pl } = await adminClient.from('planejamento')
      .select('salario_leticia, salario_giovanna')
      .eq('family_id', family_id)
      .order('updated_at', { ascending: false }).limit(1).single();

    const salarioTotal = Number(pl?.salario_leticia || 0) + Number(pl?.salario_giovanna || 0);

    const { data: transacoes } = await adminClient.from('transacoes')
      .select('data, valor, tipo')
      .eq('family_id', family_id)
      .order('data', { ascending: true });

    if (!transacoes?.length) return NextResponse.json({ evolucao: [] });

    const mesesMap: Record<string, { mes: number; ano: number; despesas: number }> = {};

    transacoes.forEach(t => {
      const d = new Date(t.data + 'T12:00:00');
      const mes = d.getMonth();
      const ano = d.getFullYear();
      const key = `${ano}-${String(mes).padStart(2,'0')}`;
      if (!mesesMap[key]) mesesMap[key] = { mes, ano, despesas: 0 };
      if (t.tipo !== 'receita') mesesMap[key].despesas += Number(t.valor);
    });

    const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

    const evolucao = Object.entries(mesesMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({
        mes: v.mes, ano: v.ano,
        label: `${MESES[v.mes]}/${String(v.ano).slice(2)}`,
        receitas: salarioTotal,
        despesas: v.despesas,
        saldo: salarioTotal - v.despesas,
      }));

    return NextResponse.json({ evolucao });
  } catch (err) {
    console.error('Erro /api/evolucao:', err);
    return NextResponse.json({ evolucao: [] });
  }
}
