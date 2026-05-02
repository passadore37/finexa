import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Criar usuário já confirmado — sem email de verificação
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // ← confirma direto, sem precisar de email
      user_metadata: { nome, plano, role: 'membro', is_invitee: is_invitee ?? false },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered'))
        return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
      return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}
