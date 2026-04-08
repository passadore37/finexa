// app/api/auth/reenviar-email/route.ts — reenviar email de confirmação
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarEmailBoasVindas } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard` },
    });

    if (error || !data?.properties?.action_link) {
      return NextResponse.json({ error: 'Erro ao gerar link' }, { status: 500 });
    }

    const { data: users } = await admin.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email);
    const nome = user?.user_metadata?.nome ?? 'usuária';

    await enviarEmailBoasVindas(email, nome, data.properties.action_link);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
