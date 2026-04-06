import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { tipo, mensagem, pagina, perfil } = await req.json();
    if (!tipo || !mensagem?.trim())
      return NextResponse.json({ error: 'Tipo e mensagem obrigatórios' }, { status: 400 });

    await getAdmin().from('feedback').insert({ family_id, perfil, tipo, mensagem: mensagem.trim(), pagina });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Apenas admins — protegido pelo secret
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data } = await getAdmin().from('feedback')
    .select('*, familias(nome)').order('criado_em', { ascending: false });
  return NextResponse.json({ ok: true, data: data || [] });
}
