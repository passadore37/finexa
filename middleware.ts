// middleware.ts — proteção de rotas + propagação de sessão Supabase
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: getUser() renova o token se necessário
  // Não usar getSession() aqui — é menos seguro
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Arquivos estáticos — liberar sempre sem verificação
  const isStatic =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/public/') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml)$/.test(pathname);

  if (isStatic) return supabaseResponse;

  // Rotas públicas de marketing — liberar sempre
  const isMarketing =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/cadastro') ||
    pathname.startsWith('/plano') ||
    pathname.startsWith('/termos') ||
    pathname.startsWith('/privacidade');

  if (isMarketing) return supabaseResponse;

  // API routes — verificar sessão e adicionar family_id no header
  if (pathname.startsWith('/api/')) {
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      );
    }
    // Propagar user id para as API routes via header
    supabaseResponse.headers.set('x-user-id', user.id);
    return supabaseResponse;
  }

  // Todas as outras rotas (dashboard, lancar, metas, planejamento) — exigir sessão
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Proteger tudo exceto arquivos estáticos do Next.js
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
