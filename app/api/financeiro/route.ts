import { NextResponse } from 'next/server'
import { fetchDadosPlanilha } from '@/lib/supabase-data'
import { calcularTodosIndicadores } from '@/lib/indicadores'
import { supabase } from '@/lib/supabase'

export async function GET() {

  const dados = await fetchDadosPlanilha()

  const indicadores = calcularTodosIndicadores(dados)

  const { data: limites } = await supabase
    .from('limites')
    .select('*')

  const limitesObj = {
    leticia: limites?.find(l => l.perfil === 'leticia')?.limite ?? 0,
    giovanna: limites?.find(l => l.perfil === 'giovanna')?.limite ?? 0
  }

  return NextResponse.json({
    success: true,
    dados,
    indicadores,
    limites: limitesObj
  })

}
