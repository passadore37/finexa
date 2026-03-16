import { NextResponse } from 'next/server'
import { fetchDadosPlanilha, gerarDadosDemo } from '@/lib/supabase-data'
import { calcularTodosIndicadores } from '@/lib/indicadores'
import { supabase } from '@/lib/supabase'

export async function GET() {

  try {

    const hasCredentials =
      !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)

    const dados = hasCredentials
      ? await fetchDadosPlanilha()
      : gerarDadosDemo()

    const indicadores = calcularTodosIndicadores(dados)

    const { data: limitesData } = await supabase
      .from('limites')
      .select('*')

    const limites = {
      leticia:
        limitesData?.find((l) => l.perfil === 'leticia')?.limite ?? 0,
      giovanna:
        limitesData?.find((l) => l.perfil === 'giovanna')?.limite ?? 0,
    }

    return NextResponse.json(
      {
        success: true,
        dados,
        indicadores,
        limites
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    )

  } catch (error) {

    console.error('Erro:', error)

    const dados = gerarDadosDemo()
    const indicadores = calcularTodosIndicadores(dados)

    return NextResponse.json(
      {
        success: true,
        dados,
        indicadores,
        limites: {
          leticia: 0,
          giovanna: 0
        },
        demo: true
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' }
      }
    )

  }

}
