// middleware.ts — proteção de rotas + verificação de trial/assinatura
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { checkRateLimit } from '@/lib/rate-limit';

const AUTH_ROUTES = ['/login', '/cadastro'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // FIX #6/#7 — Rate limit real via Upstash Redis (persiste entre instâncias serverless)
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/convite')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    const allowed = await checkRateLimit(`auth:${ip}`, 10, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde um momento.' },
        { status: 429 }
      );
    }
  }

  // Rotas de arquivos estáticos e API — deixar passar
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, opts) => { res.cookies.set({ name, value, ...opts }); },
        remove: (name, opts) => { res.cookies.set({ name, value: '', ...opts }); },
    }},
  );

  // FIX #11 — usar getUser() em vez de getSession() para validar token server-side
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user } : null;

  // Redirecionar /planejamento para /dashboard (aba removida) — antes de qualquer outra checagem
  if (pathname.startsWith('/planejamento')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/lancar') ||
                     pathname.startsWith('/metas')      || pathname.startsWith('/onboarding');

  // FIX #3 — Proteger rotas /admin: exige sessão autenticada
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, req.url));
    }
    return res;
  }

  // Página raiz sempre livre
  if (pathname === '/') return res;

  // 1. Rota do app sem sessão → login
  if (isAppRoute && !session) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
  }

  // 2. Já logado tentando acessar login/cadastro → dashboard
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // 3. Rota do app com sessão → verificar email + assinatura
  if (isAppRoute && session) {
    const { data: familia } = await supabase
      .from('familias').select('assinatura_status, trial_ends_at, plano')
      .eq('id', session.user.user_metadata?.family_id ?? '')
      .single();

    // Email não confirmado
    if (!session.user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/verificar-email', req.url));
    }

    if (familia) {
      const { assinatura_status, trial_ends_at } = familia;
      const trialExpirou = assinatura_status === 'trial' &&
        trial_ends_at && new Date(trial_ends_at) < new Date();
      const assinaturaExpirou = assinatura_status === 'expirada' || assinatura_status === 'cancelada';

      if (trialExpirou || assinaturaExpirou) {
        if (!pathname.startsWith('/plano')) {
          return NextResponse.redirect(new URL(`/plano?id=${familia.plano}&expired=true`, req.url));
        }
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};