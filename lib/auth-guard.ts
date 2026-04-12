// lib/auth-guard.ts
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Importar cookies do next/headers

export interface AuthResult {
  user: { id: string; email: string } | null;
  family_id: string | null;
  error: NextResponse | null;
}

export async function authGuard(req: Request): Promise<AuthResult> {
  const cookieStore = cookies(); // Usar cookies() do next/headers

  // Cliente com cookie da sessão — para verificar quem está logado
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
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

  // ... (restante do código permanece o mesmo)
}