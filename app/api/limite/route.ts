import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authGuard } from '@/lib/auth-guard';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;

  try {
    const { perfil, limite } = await req.json();
    if (!perfil || limite === undefined || limite === null)
      return NextResponse.json({ error: 'Dados obrigatórios' }, { status: 400 });

    const admin = getAdmin();

    // Verificar se já existe
    const { data: existing } = await admin
      .from('limites_financeiros')
      .select('perfil')
      .eq('perfil', perfil)
      .eq('family_id', family_id)
      .maybeSingle();

    if (existing) {
      // UPDATE
      const { error: updateError } = await admin
        .from('limites_financeiros')
        .update({ limite, atualizado_em: new Date().toISOString() })
        .eq('perfil', perfil)
        .eq('family_id', family_id);

      if (updateError) throw updateError;
    } else {
      // INSERT
      const { error: insertError } = await admin
        .from('limites_financeiros')
        .insert({ perfil, limite, family_id });

      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, perfil, limite, family_id });
  } catch (err: any) {
    console.error('[/api/limite]', err.message);
    return NextResponse.json({ error: 'Erro ao salvar limite.' }, { status: 500 });
  }
}
