// app/api/auth/cadastro/route.ts
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

    // Validação de senha robusta
    if (senha.length < 8)
      return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 });

    const temNumero = /\d/.test(senha);
    const temLetra  = /[a-zA-Z]/.test(senha);
    if (!temNumero || !temLetra)
      return NextResponse.json({ error: 'Senha deve conter letras e números' }, { status: 400 });

    const admin = getAdmin();

    // FIX #12 — email_confirm: false exige confirmação real via e-mail
    // FIX #13 — resposta genérica para e-mail duplicado (evita user enumeration)
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: false,
      user_metadata: {
        nome,
        plano,
        role: 'membro',
        is_invitee: is_invitee ?? false,
      },
    });

    if (error) {
      if (
        error.message.includes('already registered') ||
        error.message.includes('already been registered')
      ) {
        // Retornar sucesso falso para impedir user enumeration
        return NextResponse.json({ success: true, user_id: null });
      }
      return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 400 });
    }

    const userId = data.user?.id;
    if (!userId)
      return NextResponse.json({ error: 'Erro ao obter ID do usuário.' }, { status: 500 });

    // Criar família para usuários master (não convidados)
    let familyId: string | null = null;

    if (!is_invitee) {
      const { data: novaFamilia, error: familiaErr } = await admin
        .from('familias')
        .insert({
          nome: `Finexa · ${nome}`,
          plano,
          assinatura_status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('id')
        .single();

      if (familiaErr) {
        console.error('[cadastro] Erro ao criar família:', familiaErr.message);
      } else {
        familyId = novaFamilia?.id ?? null;
      }
    }

    // Criar perfil na tabela `perfis`
    const { error: perfilErr } = await admin.from('perfis').upsert(
      {
        id: userId,
        email,
        nome,
        role: is_invitee ? 'membro' : 'master',
        is_master: !is_invitee,
        family_id: familyId,
        onboarding_done: false,
        plano: is_invitee ? null : plano,
      },
      { onConflict: 'id' }
    );

    if (perfilErr) {
      console.error('[cadastro] Erro ao criar perfil:', perfilErr.message);
    }

    return NextResponse.json({ success: true, user_id: userId });
  } catch {
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}