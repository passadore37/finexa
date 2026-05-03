import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export interface AuthResult {
  user: { id: string; email: string; user_metadata?: any } | null;
  family_id: string | null;
  error: NextResponse | null;
}

export async function authGuard(req: Request): Promise<AuthResult> {
  let allCookies: { name: string; value: string }[] = [];

  try {
    const { cookies } = await import('next/headers');
    const store = await cookies();
    allCookies = store.getAll().map((c: any) => ({ name: c.name, value: c.value }));
  } catch {}

  if (allCookies.length === 0) {
    const cookieHeader = req.headers.get('cookie') || '';
    allCookies = cookieHeader
      .split(';')
      .map(c => {
        const [name, ...v] = c.trim().split('=');
        return { name: name.trim(), value: v.join('=') };
      })
      .filter(c => c.name);
  }

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return allCookies; }, setAll() {} } }
  );

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return {
      user: null, family_id: null,
      error: NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 }),
    };
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: perfil } = await admin
    .from('perfis')
    .select('family_id')
    .eq('id', user.id)
    .single();

  if (!perfil?.family_id) {
    // Novo usuário sem família ainda (veio direto do cadastro/onboarding) — criar família agora
    // Em vez de 403, criamos a estrutura mínima para o dashboard carregar dados reais
    const plano = user.user_metadata?.plano ?? 'individual';
    const { data: novaFamilia } = await admin.from('familias').insert({
      nome: `Finexa · ${user.user_metadata?.nome ?? user.email}`,
      plano,
      assinatura_status: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }).select('id').single();

    const familyId = novaFamilia?.id ?? null;

    if (familyId) {
      await admin.from('perfis').upsert({
        id: user.id,
        family_id: familyId,
        email: user.email,
        nome: user.user_metadata?.nome ?? '',
        role: 'master',
        is_master: true,
        plano,
        onboarding_done: false,
      }, { onConflict: 'id' });

      return {
        user: { id: user.id, email: user.email!, user_metadata: user.user_metadata },
        family_id: familyId,
        error: null,
      };
    }

    return {
      user: null, family_id: null,
      error: NextResponse.json({ success: false, error: 'Perfil não encontrado.' }, { status: 403 }),
    };
  }

  return {
    user: { id: user.id, email: user.email!, user_metadata: user.user_metadata },
    family_id: perfil.family_id,
    error: null,
  };
}