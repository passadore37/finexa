import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authGuard } from '@/lib/auth-guard';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;

  try {
    const { perfil, limite } = await req.json();
    if (!perfil || limite === undefined)
      return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 });

    await getAdmin()
      .from('limites_financeiros')
      .upsert({ perfil, limite, family_id }, { onConflict: 'perfil,family_id' });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao salvar limite.' }, { status: 500 });
  }
}
