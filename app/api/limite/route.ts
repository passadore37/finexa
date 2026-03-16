import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {

  const { perfil, limite } = await req.json()

  const { error } = await supabase
    .from('limites_financeiros')
    .upsert({
      perfil,
      limite,
      atualizado_em: new Date()
    })

  if (error) {
    return NextResponse.json({ success: false, error })
  }

  return NextResponse.json({ success: true })

}
