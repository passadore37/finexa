import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { data, error: err } = await getAdmin()
      .from('perfis')
      .select('id, nome, role, email')
      .eq('family_id', family_id)
      .order('criado_em', { ascending: true });
    if (err) throw err;
    return NextResponse.json({ success: true, data: data || [] });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar perfis' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { user, error } = await authGuard(req);
  if (error) return error;
  try {
    const { cor } = await req.json();
    const CORES_VALIDAS = ['#82a1fd', '#ff64ca', '#01b695', '#ffa857'];
    if (!cor || !CORES_VALIDAS.includes(cor))
      return NextResponse.json({ error: 'Cor inválida' }, { status: 400 });
    const { error: err } = await getAdmin()
      .from('perfis').update({ cor }).eq('id', user!.id);
    if (err) throw err;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar cor' }, { status: 500 });
  }
}