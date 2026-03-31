import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authGuard } from '@/lib/auth-guard';

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { data, error: err } = await supabase.from('metas').select('*')
      .eq('family_id', family_id).order('created_at', { ascending: false });
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao buscar metas' }, { status: 500 }); }
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { data, error: err } = await supabase.from('metas').insert({ ...body, family_id }).select().single();
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao criar meta' }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { id, ...updates } = await req.json();
    const { data, error: err } = await supabase.from('metas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id).eq('family_id', family_id).select().single();
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao atualizar meta' }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    await supabase.from('metas').delete().eq('id', id).eq('family_id', family_id);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 }); }
}
