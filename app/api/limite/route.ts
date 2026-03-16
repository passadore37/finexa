import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {

  const { perfil, limite } = await req.json()

  await supabase
    .from('limites')
    .upsert({
      perfil,
      limite
    })

  return NextResponse.json({ success: true })

}
