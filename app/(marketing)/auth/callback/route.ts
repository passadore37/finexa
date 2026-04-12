// app/(marketing)/auth/callback/route.ts
// Processa o token do Supabase após confirmação de email
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const url          = new URL(req.url);
  const code         = url.searchParams.get('code');
  const token_hash   = url.searchParams.get('token_hash');
  const type         = url.searchParams.get('type');
  const next         = url.searchParams.get('next') ?? '/onboarding';

  const cookieStore  = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()                { return cookieStore.getAll(); },
        setAll(cookiesToSet)    {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  if (code) {
    // OAuth / magic link com code
    await supabase.auth.exchangeCodeForSession(code);
  } else if (token_hash && type) {
    // Email confirmation com token_hash
    await supabase.auth.verifyOtp({ token_hash, type: type as any });
  }

  return NextResponse.redirect(new URL(next, req.url));
}
