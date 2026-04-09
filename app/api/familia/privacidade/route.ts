// app/api/familia/privacidade/route.ts — configurar visibilidade por membro
import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// PATCH — atualizar permissões de um membro
export async function PATCH(req: Request) {
  const { family_id, user, error } = await authGuard(req);
  if (error) return error;

  try {
    const admin = getAdmin();

    // Verificar se é master
    const { data: perfil } = await admin.from('perfis')
      .select('is_master').eq('id', user.id).single();

    if (!perfil?.is_master) {
      return NextResponse.json({ error: 'Apenas o mestre pode configurar privacidade' }, { status: 403 });
    }

    const { membro_id, pode_ver_geral, pode_ver_membros } = await req.json();

    await admin.from('perfis').update({
      pode_ver_geral,
      pode_ver_membros: pode_ver_membros ?? [],
    }).eq('id', membro_id).eq('family_id', family_id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
