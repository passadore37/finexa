// app/api/auth/cadastro/route.ts
// Cria usuário no Supabase Auth + perfil na tabela `perfis` imediatamente.
// Isso garante diferenciação de perfis no banco desde o momento do cadastro,
// sem depender do onboarding para criar o registro.
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

    // 1. Criar usuário no Supabase Auth já confirmado
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        nome,
        plano,
        role: 'membro',
        is_invitee: is_invitee ?? false,
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered'))
        return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
      return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 400 });
    }

    const userId = data.user?.id;
    if (!userId)
      return NextResponse.json({ error: 'Erro ao obter ID do usuário.' }, { status: 500 });

    // 2. Criar família para usuários master (não convidados)
    //    Convidados serão vinculados à família existente via /api/convite (PATCH)
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
        // Não bloquear o cadastro por falha de família — onboarding vai recriar
        console.error('[cadastro] Erro ao criar família:', familiaErr.message);
      } else {
        familyId = novaFamilia?.id ?? null;
      }
    }

    // 3. Criar perfil na tabela `perfis` imediatamente
    //    Isso garante que cada usuário tenha um registro identificável no banco
    //    desde o momento do cadastro, possibilitando diferenciação por:
    //    - role: 'master' (criador) ou 'membro' (convidado)
    //    - is_master: boolean
    //    - family_id: vínculo com a família (null para convidados até aceitar convite)
    //    - onboarding_done: false até completar o fluxo de onboarding
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
      // Não bloquear — o onboarding tem fallback para criar o perfil
    }

    // Retornar user_id para que o frontend possa associar convite se necessário
    return NextResponse.json({ success: true, user_id: userId });
  } catch {
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 });
  }
}