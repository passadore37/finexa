import { NextResponse } from 'next/server';
import { fetchDadosPlanilha, gerarDadosDemo } from '@/lib/supabase-data';
import { calcularTodosIndicadores } from '@/lib/indicadores';
import { supabase } from '@/lib/supabase';
import { authGuard } from '@/lib/auth-guard';

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const dados = await fetchDadosPlanilha(family_id!);
    const indicadores = calcularTodosIndicadores(dados);

    const { data: limitesData } = await supabase
      .from('limites_financeiros').select('*').eq('family_id', family_id);

    const limites = {
      leticia: limitesData?.find(l => l.perfil === 'leticia')?.limite ?? 0,
      giovanna: limitesData?.find(l => l.perfil === 'giovanna')?.limite ?? 0,
    };

    return NextResponse.json(
      { success: true, dados, indicadores, limites },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err) {
    console.error('Erro /api/financeiro:', err);
    const dados = gerarDadosDemo();
    const indicadores = calcularTodosIndicadores(dados);
    return NextResponse.json(
      { success: true, dados, indicadores, limites: { leticia: 0, giovanna: 0 }, demo: true },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
