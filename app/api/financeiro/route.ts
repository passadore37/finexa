import { NextResponse } from 'next/server';
import { fetchDadosPlanilha, gerarDadosDemo } from '@/lib/supabase-data';
import { calcularTodosIndicadores } from '@/lib/indicadores';

export async function GET() {
  try {
    const hasCredentials = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    const dados = hasCredentials ? await fetchDadosPlanilha() : gerarDadosDemo();
    const indicadores = calcularTodosIndicadores(dados);
    return NextResponse.json(
      { success: true, dados, indicadores },
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
