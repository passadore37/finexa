// middleware.ts — proteção de rotas + CSP com nonce + rate limiting
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { checkRateLimit } from '@/lib/rate-limit';

const AUTH_ROUTES = ['/login', '/cadastro'];

const DATA_ROUTES = [
  '/api/financeiro', '/api/transacoes', '/api/planejamento',
  '/api/metas', '/api/evolucao', '/api/perfis', '/api/reserva',
];

const ALLOWED_ORIGINS = [
  'https://finexa-one.vercel.app',
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

// FIX #7 — Gerar nonce aleatório e injetar no CSP via header
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `connect-src 'self' ${ALLOWED_ORIGINS.join(' ')} https://*.supabase.co wss://*.supabase.co https://api.resend.com https://api.anthropic.com`,
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate limit — rotas de autenticação (por IP)
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/convite')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    const allowed = await checkRateLimit(`auth:${ip}`, 10, 60);
    if (!allowed)
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 });
  }

  // Rate limit — rotas de dados sensíveis (por IP)
  if (DATA_ROUTES.some(r => pathname.startsWith(r))) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    const allowed = await checkRateLimit(`data:${ip}`, 120, 60);
    if (!allowed)
      return NextResponse.json({ error: 'Limite de requisições atingido.' }, { status: 429 });
  }

  // Rotas estáticas e de API — aplicar CSP e passar
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    const res = NextResponse.next();
    const nonce = generateNonce();
    res.headers.set('Content-Security-Policy', buildCsp(nonce));
    res.headers.set('x-nonce', nonce); // disponibiliza o nonce para Server Components
    return res;
  }

  const nonce = generateNonce();
  const res = NextResponse.next();

  // FIX #7 — Injetar CSP com nonce em todas as respostas HTML
  res.headers.set('Content-Security-Policy', buildCsp(nonce));
  res.headers.set('x-nonce', nonce);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, opts) => { res.cookies.set({ name, value, ...opts }); },
        remove: (name, opts) => { res.cookies.set({ name, value: '', ...opts }); },
    }},
  );

  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user } : null;

  // Redirecionar /planejamento → /dashboard
  if (pathname.startsWith('/planejamento'))
    return NextResponse.redirect(new URL('/dashboard', req.url));

  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/lancar') ||
                     pathname.startsWith('/metas')      || pathname.startsWith('/onboarding');

  // Proteger /admin
  if (pathname.startsWith('/admin')) {
    if (!session)
      return NextResponse.redirect(new URL('/login?redirect=' + pathname, req.url));
    return res;
  }

  if (pathname === '/') return res;

  if (isAppRoute && !session)
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, req.url));

  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));
  if (isAuthRoute && session)
    return NextResponse.redirect(new URL('/dashboard', req.url));

  if (isAppRoute && session) {
    const { data: familia } = await supabase
      .from('familias').select('assinatura_status, trial_ends_at, plano')
      .eq('id', session.user.user_metadata?.family_id ?? '')
      .single();

    if (!session.user.email_confirmed_at)
      return NextResponse.redirect(new URL('/verificar-email', req.url));

    if (familia) {
      const { assinatura_status, trial_ends_at } = familia;
      const trialExpirou = assinatura_status === 'trial' &&
        trial_ends_at && new Date(trial_ends_at) < new Date();
      const assinaturaExpirou = assinatura_status === 'expirada' || assinatura_status === 'cancelada';
      if ((trialExpirou || assinaturaExpirou) && !pathname.startsWith('/plano'))
        return NextResponse.redirect(new URL(`/plano?id=${familia.plano}&expired=true`, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};