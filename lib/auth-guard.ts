// lib/auth-guard.ts — verifica sessão e retorna family_id nas API routes
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export interface AuthResult {
  user: { id: string; email: string } | null;
  family_id: string | null;
  error: NextResponse | null;
}

export async function authGuard(req: Request): Promise<AuthResult> {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(c => {
    const [name, ...v] = c.trim().split('=');
    return { name: name.trim(), value: v.join('=') };
  }).filter(c => c.name);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookies, setAll: () => {} } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null, family_id: null,
      error: NextResponse.json(
        { success: false, error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      ),
    };
  }

  const { data: perfil } = await supabase
    .from('perfis').select('family_id').eq('id', user.id).single();

  if (!perfil?.family_id) {
    return {
      user: null, family_id: null,
      error: NextResponse.json(
        { success: false, error: 'Perfil não encontrado.' },
        { status: 403 }
      ),
    };
  }

  return { user: { id: user.id, email: user.email! }, family_id: perfil.family_id, error: null };
}
