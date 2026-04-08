// app/api/auth/reset-senha/route.ts — enviar email de reset via Resend
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarEmailSenha } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // Buscar nome do usuário
    const { data: users } = await admin.auth.admin.listUsers();
    const user = users?.users?.find(u => u.email === email);

    // Gerar link de reset pelo Supabase
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/nova-senha` },
    });

    if (error || !data?.properties?.action_link) {
      // Não revelar se o email existe ou não
      return NextResponse.json({ ok: true });
    }

    const nome = user?.user_metadata?.nome ?? 'usuária';
    await enviarEmailSenha(email, nome, data.properties.action_link);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // sempre retorna ok para não vazar emails
  }
}
