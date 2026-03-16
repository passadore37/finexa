import { NextResponse } from 'next/server';
import { fetchDadosPlanilha, gerarDadosDemo } from '@/lib/supabase-data';
import { calcularTodosIndicadores } from '@/lib/indicadores';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {

    const hasCredentials = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

    const dados = hasCredentials
      ? await fetchDadosPlanilha()
      : gerarDadosDemo();

    const indicadores = calcularTodosIndicadores(dados);

    // buscar limites
    const { data: limites } = await supabase
      .from('limites_financeiros')
      .select('*');

    const limitesPerfis = {
      leticia: limites?.find(l => l.perfil === 'leticia')?.limite ?? 3500,
      giovanna: limites?.find(l => l.perfil === 'giovanna')?.limite ?? 3500
    };

    return NextResponse.json(
      {
        success: true,
        dados,
        indicadores,
        limites: limitesPerfis
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );

  } catch (error) {

    console.error('Erro:', error);

    const dados = gerarDadosDemo();
    const indicadores = calcularTodosIndicadores(dados);

    return NextResponse.json(
      { success: true, dados, indicadores, demo: true },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );

  }
}
