// lib/auth-guard.ts
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export interface AuthResult {
  user: { id: string; email: string } | null;
  family_id: string | null;
  error: NextResponse | null;
}

export async function authGuard(req: Request): Promise<AuthResult> {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader
    .split(';')
    .map(c => {
      const [name, ...v] = c.trim().split('=');
      return { name: name.trim(), value: v.join('=') };
    })
    .filter(c => c.name);

  // Cliente com cookie da sessão — para verificar quem está logado
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookies, setAll: () => {} } }
  );

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    console.log('[authGuard] Sem sessão:', authError?.message);
    return {
      user: null, family_id: null,
      error: NextResponse.json(
        { success: false, error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      ),
    };
  }

  console.log('[authGuard] Usuário logado:', user.id, user.email);

  // Usar service_role para buscar o perfil — bypassa RLS completamente
  // Assim não depende de políticas para funcionar
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: perfil, error: perfilError } = await supabaseAdmin
    .from('perfis')
    .select('family_id, email, nome, role')
    .eq('id', user.id)
    .single();

  console.log('[authGuard] Perfil:', perfil, 'Erro:', perfilError?.message);

  if (perfilError || !perfil?.family_id) {
    return {
      user: null, family_id: null,
      error: NextResponse.json(
        { success: false, error: 'Perfil não encontrado. Configure sua conta.' },
        { status: 403 }
      ),
    };
  }

  return {
    user: { id: user.id, email: user.email! },
    family_id: perfil.family_id,
    error: null,
  };
}
