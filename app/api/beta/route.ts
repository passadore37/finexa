// app/api/beta/route.ts — gerenciar convites beta
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// POST /api/beta — gerar link de convite beta (só você usa)
export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const { email, nome } = await req.json();
    const token = randomUUID();
    await getAdmin().from('beta_convites').insert({ token, email: email || null, nome: nome || null });
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/beta/${token}`;
    return NextResponse.json({ ok: true, token, url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/beta?token=xxx — validar token beta
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 });

  const { data, error } = await getAdmin().from('beta_convites')
    .select('*').eq('token', token).eq('usado', false).single();

  if (error || !data) return NextResponse.json({ error: 'Convite inválido ou já utilizado' }, { status: 404 });
  return NextResponse.json({ ok: true, nome: data.nome, email: data.email });
}

// PATCH /api/beta — marcar convite como usado + ativar beta_user
export async function PATCH(req: Request) {
  try {
    const { token, family_id } = await req.json();
    if (!token || !family_id) return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 });

    const admin = getAdmin();
    const { data: convite } = await admin.from('beta_convites')
      .select('*').eq('token', token).eq('usado', false).single();

    if (!convite) return NextResponse.json({ error: 'Convite inválido' }, { status: 404 });

    await Promise.all([
      admin.from('beta_convites').update({ usado: true, usado_em: new Date().toISOString(), usado_por: family_id }).eq('token', token),
      admin.from('familias').update({
        beta_user:        true,
        beta_token:       token,
        assinatura_status: 'trial',   // 14 dias grátis primeiro
      }).eq('id', family_id),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
