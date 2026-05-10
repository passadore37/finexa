// app/api/auth/cadastro/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// FIX #9 — Verificar se senha foi vazada via HaveIBeenPwned (API gratuita)
// Usa k-anonymity: envia apenas os 5 primeiros chars do hash SHA1, nunca a senha
async function senhaFoiVazada(senha: string): Promise<boolean> {
  try {
    const hash   = crypto.createHash('sha1').update(senha).digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(3000), // timeout de 3s para não travar o cadastro
    });

    if (!res.ok) return false; // se a API falhar, não bloquear o cadastro

    const text = await res.text();
    return text.split('\n').some(line => line.trim().startsWith(suffix));
  } catch {
    // Em caso de timeout ou erro de rede, não bloquear
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { email, senha, nome, plano, is_invitee } = await req.json();

    if (!email || !senha || !nome || !plano)
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });

    // Validação: tamanho mínimo
    if (senha.length < 8)
      return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 });

    // Validação: letras e números
    const temNumero = /\d/.test(senha);
    const temLetra  = /[a-zA-Z]/.test(senha);
    if (!temNumero || !temLetra)
      return NextResponse.json({ error: 'Senha deve conter letras e números' }, { status: 400 });

    // FIX #9 — Verificar se senha está em listas de vazamentos conhecidos
    if (await senhaFoiVazada(senha))
      return NextResponse.json(
        { error: 'Essa senha já foi encontrada em vazamentos de dados. Escolha uma senha diferente.' },
        { status: 400 }
      );

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
        return NextResponse.json({ success: true, user_id: null });
      }
      return NextResponse.json({ error: 'Erro ao criar conta. Tente novamente.' }, { status: 400 });
    }

    const userId = data.user?.id;
    if (!userId)
      return NextResponse.json({ error: 'Erro ao obter ID do usuário.' }, { status: 500 });

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