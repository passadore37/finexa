import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarEmailBoasVindas } from '@/lib/resend';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const { email, senha, nome, plano, is_invitee } = await req.json();
    if (!email || !senha || !nome || !plano)
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    if (senha.length < 8)
      return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 });

    const admin = getAdmin();

    // Criar usuário sem disparar email automático do Supabase
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: false,
      user_metadata: { nome, plano, role: 'membro', is_invitee: is_invitee ?? false },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered'))
        return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
      throw error;
    }

    // Gerar link de confirmação
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/onboarding` },
    });

    if (!linkError && linkData?.properties?.action_link) {
      await enviarEmailBoasVindas(email, nome, linkData.properties.action_link);
    }

    return NextResponse.json({ success: true, user_id: data.user?.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
