import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: Request) {
  const { family_id, user, error } = await authGuard(req);
  if (error) return error;
  try {
    const { searchParams } = new URL(req.url);
    const incluirAportes = searchParams.get('aportes') === 'true';

    const { data: metas, error: err } = await getAdmin()
      .from('metas').select('*')
      .eq('family_id', family_id)
      .order('created_at', { ascending: false });
    if (err) throw err;

    if (!incluirAportes) return NextResponse.json({ success: true, data: metas || [] });

    // Buscar aportes de todas as metas
    const { data: aportes } = await getAdmin()
      .from('meta_aportes').select('*')
      .eq('family_id', family_id)
      .order('ano', { ascending: true })
      .order('mes', { ascending: true });

    return NextResponse.json({ success: true, data: metas || [], aportes: aportes || [] });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao buscar metas' }, { status: 500 }); }
}

export async function POST(req: Request) {
  const { family_id, user, error } = await authGuard(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { data, error: err } = await getAdmin().from('metas')
      .insert({ ...body, family_id })
      .select().single();
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao criar meta' }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { id, ...updates } = await req.json();
    const { data, error: err } = await getAdmin().from('metas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).eq('family_id', family_id).select().single();
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    await getAdmin().from('metas').delete().eq('id', id).eq('family_id', family_id);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 }); }
}
