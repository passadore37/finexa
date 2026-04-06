// app/api/convite/route.ts — criar e aceitar convites de membros
import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';
import { enviarEmailConvite } from '@/lib/resend';
import { randomUUID } from 'crypto';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// POST /api/convite — criar convite e enviar email
export async function POST(req: Request) {
  const { family_id, user, error } = await authGuard(req);
  if (error) return error;
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });

    const admin = getAdmin();

    // Buscar dados da família
    const { data: familia } = await admin.from('familias').select('nome, plano').eq('id', family_id).single();

    // Verificar limite de membros do plano
    const { count } = await admin.from('perfis').select('*', { count: 'exact', head: true }).eq('family_id', family_id);
    const limites: Record<string, number> = { individual: 1, casal: 2, familia: 4 };
    const limite = limites[familia?.plano ?? 'casal'] ?? 2;
    if ((count ?? 0) >= limite) {
      return NextResponse.json({ error: `Plano ${familia?.plano} permite no máximo ${limite} membros` }, { status: 400 });
    }

    const token = randomUUID();
    const conviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/convite/${token}`;

    await admin.from('convites').insert({ family_id, email, token });

    const nomeQuemConvidou = user.user_metadata?.nome ?? 'sua parceira';
    await enviarEmailConvite(email, familia?.nome ?? 'Finexa', nomeQuemConvidou, conviteUrl);

    return NextResponse.json({ ok: true, token, url: conviteUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/convite?token=xxx — validar token antes de aceitar
export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 });

    const { data, error } = await getAdmin().from('convites')
      .select('*, familias(nome, plano)')
      .eq('token', token).eq('usado', false).single();

    if (error || !data) return NextResponse.json({ error: 'Convite inválido ou expirado' }, { status: 404 });
    if (new Date(data.expira_em) < new Date()) return NextResponse.json({ error: 'Convite expirado' }, { status: 410 });

    return NextResponse.json({ ok: true, familia: (data as any).familias, email: data.email });
  } catch {
    return NextResponse.json({ error: 'Erro ao validar convite' }, { status: 500 });
  }
}

// PATCH /api/convite — aceitar convite (associar usuário recém-criado à família)
export async function PATCH(req: Request) {
  try {
    const { token, user_id } = await req.json();
    if (!token || !user_id) return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 });

    const admin = getAdmin();
    const { data: convite } = await admin.from('convites')
      .select('*').eq('token', token).eq('usado', false).single();

    if (!convite) return NextResponse.json({ error: 'Convite inválido' }, { status: 404 });
    if (new Date(convite.expira_em) < new Date()) return NextResponse.json({ error: 'Expirado' }, { status: 410 });

    // Atualizar perfil do novo usuário com o family_id do convite
    await admin.from('perfis').update({ family_id: convite.family_id }).eq('id', user_id);

    // Marcar convite como usado
    await admin.from('convites').update({ usado: true }).eq('token', token);

    return NextResponse.json({ ok: true, family_id: convite.family_id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
