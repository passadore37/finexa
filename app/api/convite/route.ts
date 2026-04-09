import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';
import { enviarEmailConvite } from '@/lib/mailer';
import { randomUUID } from 'crypto';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: Request) {
  const { family_id, user, error } = await authGuard(req);
  if (error) return error;
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });

    const admin = getAdmin();

    const { data: familia } = await admin.from('familias')
      .select('nome, plano').eq('id', family_id).single();

    // Verificar limite de membros
    const { count } = await admin.from('perfis')
      .select('*', { count: 'exact', head: true }).eq('family_id', family_id);
    const limites: Record<string, number> = { individual: 1, casal: 2, familia: 4 };
    const limite = limites[familia?.plano ?? 'casal'] ?? 2;
    if ((count ?? 0) >= limite) {
      return NextResponse.json({
        error: `Plano ${familia?.plano} permite no máximo ${limite} membros`
      }, { status: 400 });
    }

    const token      = randomUUID();
    const conviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/convite/${token}`;

    await admin.from('convites').insert({ family_id, email, token });

    // Tentar enviar email — mas retornar o link independente do resultado
    try {
      const nomeQuemConvidou = user.user_metadata?.nome ?? 'um membro';
      await enviarEmailConvite(email, familia?.nome ?? 'Finexa', nomeQuemConvidou, conviteUrl);
    } catch (emailErr) {
      console.error('Erro ao enviar email de convite:', emailErr);
      // Continua — link ainda é gerado e retornado
    }

    return NextResponse.json({ ok: true, token, url: conviteUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

export async function PATCH(req: Request) {
  try {
    const { token, user_id } = await req.json();
    if (!token || !user_id) return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 });

    const admin = getAdmin();
    const { data: convite } = await admin.from('convites')
      .select('*').eq('token', token).eq('usado', false).single();

    if (!convite) return NextResponse.json({ error: 'Convite inválido' }, { status: 404 });
    if (new Date(convite.expira_em) < new Date()) return NextResponse.json({ error: 'Expirado' }, { status: 410 });

    await admin.from('perfis').update({ family_id: convite.family_id }).eq('id', user_id);
    await admin.from('convites').update({ usado: true }).eq('token', token);

    return NextResponse.json({ ok: true, family_id: convite.family_id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
