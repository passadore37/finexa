import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export interface AuthResult {
  user: { id: string; email: string; user_metadata?: any } | null;
  family_id: string | null;
  error: NextResponse | null;
}

export async function authGuard(req: Request): Promise<AuthResult> {
  // Tenta cookies() do next/headers primeiro (mais confiável no App Router)
  let allCookies: { name: string; value: string }[] = [];
  try {
    const { cookies } = await import('next/headers');
    const store = await cookies();
    allCookies = store.getAll().map((c: any) => ({ name: c.name, value: c.value }));
  } catch {}

  // Fallback: lê do header da request diretamente
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
    console.log('[authGuard] Sem sessão:', authError?.message);
    return {
      user: null, family_id: null,
      error: NextResponse.json(
        { success: false, error: 'Não autorizado.' },
        { status: 401 }
      ),
    };
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: perfil, error: perfilError } = await admin
    .from('perfis')
    .select('family_id, email, nome, role')
    .eq('id', user.id)
    .single();

  if (perfilError || !perfil?.family_id) {
    return {
      user: null, family_id: null,
      error: NextResponse.json(
        { success: false, error: 'Perfil não encontrado.' },
        { status: 403 }
      ),
    };
  }

  return {
    user: { id: user.id, email: user.email!, user_metadata: user.user_metadata },
    family_id: perfil.family_id,
    error: null,
  };
}
