// lib/auth-guard.ts — verifica sessão nas API routes
// O middleware já bloqueou requisições sem sessão antes de chegar aqui.
// O auth-guard busca o family_id do perfil para filtrar dados por família.

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export interface AuthResult {
  user: { id: string; email: string } | null;
  family_id: string | null;
  error: NextResponse | null;
}

export async function authGuard(req: Request): Promise<AuthResult> {
  // Tentar pegar user_id do header injetado pelo middleware (mais confiável)
  const userIdFromHeader = (req as any).headers?.get?.('x-user-id');

  // Fallback: ler cookie diretamente
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader
    .split(';')
    .map(c => {
      const [name, ...v] = c.trim().split('=');
      return { name: name.trim(), value: v.join('=') };
    })
    .filter(c => c.name);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookies, setAll: () => {} } }
  );

  let userId = userIdFromHeader;

  if (!userId) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        user: null,
        family_id: null,
        error: NextResponse.json(
          { success: false, error: 'Não autorizado. Faça login para continuar.' },
          { status: 401 }
        ),
      };
    }
    userId = user.id;
  }

  // Buscar family_id do perfil
  const { data: perfil } = await supabase
    .from('perfis')
    .select('family_id, email')
    .eq('id', userId)
    .single();

  if (!perfil?.family_id) {
    return {
      user: null,
      family_id: null,
      error: NextResponse.json(
        { success: false, error: 'Perfil não encontrado. Configure sua conta.' },
        { status: 403 }
      ),
    };
  }

  return {
    user: { id: userId, email: perfil.email },
    family_id: perfil.family_id,
    error: null,
  };
}
