// middleware.ts — proteção de rotas + verificação de trial/assinatura
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Rate limit simples em memória — max 10 req/min por IP em rotas de auth
const rateLimitMap = new Map<string, { count: number; reset: number }>();
function checkRateLimit(ip: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

const PUBLIC_ROUTES  = ['/', '/login', '/cadastro', '/plano', '/convite', '/termos', '/privacidade', '/auth/callback', '/verificar-email', '/nova-senha'];
const AUTH_ROUTES    = ['/login', '/cadastro'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limit em rotas de autenticação
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/convite')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    if (!checkRateLimit(ip)) {
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

  const { data: { session } } = await supabase.auth.getSession();
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/lancar') ||
                     pathname.startsWith('/metas')      || pathname.startsWith('/onboarding');

  // Redirecionar /planejamento para /dashboard (aba removida)
  if (pathname.startsWith('/planejamento')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Página raiz sempre livre — não redirecionar mesmo logado
  if (pathname === '/') return res;

  // 1. Rota do app sem sessão → login
  if (isAppRoute && !session) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));
  }

  // 2. Já logado tentando acessar login/cadastro → dashboard
  // Não redirecionar '/' — permite que usuário logado acesse a landing (ex: após logout)
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

    // Trial ou assinatura expirada
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
