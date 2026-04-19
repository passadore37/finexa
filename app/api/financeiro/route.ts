import { NextResponse } from 'next/server';
import { fetchDadosPlanilha, gerarDadosDemo } from '@/lib/supabase-data';
import { calcularTodosIndicadores } from '@/lib/indicadores';
import { createClient } from '@supabase/supabase-js';
function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
import { authGuard } from '@/lib/auth-guard';

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { searchParams } = new URL(req.url);
    // Aceita ?mes=2&ano=2026 para buscar mês específico
    const mesParam = searchParams.get('mes');
    const anoParam = searchParams.get('ano');
    const mes = mesParam !== null ? parseInt(mesParam) : undefined;
    const ano = anoParam !== null ? parseInt(anoParam) : undefined;

    const dados = await fetchDadosPlanilha(family_id!, mes, ano);
    const indicadores = calcularTodosIndicadores(dados);

    const [{ data: limitesData }, { data: perfisData }] = await Promise.all([
      getAdmin().from('limites_financeiros').select('*').eq('family_id', family_id),
      getAdmin().from('perfis').select('id, role, nome').eq('family_id', family_id)
        .order('criado_em', { ascending: true }),
    ]);

    // Mapear roles reais para roles lógicos
    const p0role = perfisData?.[0]?.role ?? 'leticia';
    const p1role = perfisData?.[1]?.role ?? 'giovanna';

    const limites = {
      leticia:  limitesData?.find(l => l.perfil === 'leticia' || l.perfil === p0role)?.limite ?? 0,
      giovanna: limitesData?.find(l => l.perfil === 'giovanna' || l.perfil === p1role)?.limite ?? 0,
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
