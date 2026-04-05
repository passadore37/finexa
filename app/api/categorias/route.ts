import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/categorias — buscar todas as categorias da família
export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { data, error: err } = await getAdmin()
      .from('categorias_customizadas')
      .select('*')
      .eq('family_id', family_id)
      .order('criado_em', { ascending: true });
    if (err) throw err;
    return NextResponse.json({ success: true, data: data || [] });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao buscar categorias' }, { status: 500 }); }
}

// POST /api/categorias — criar nova categoria
export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { nome, cor, perfis, criada_por } = await req.json();
    if (!nome?.trim()) return NextResponse.json({ success: false, error: 'Nome obrigatório' }, { status: 400 });

    const { data, error: err } = await getAdmin()
      .from('categorias_customizadas')
      .insert({ nome: nome.trim(), cor: cor || '#666666', perfis: perfis || [], criada_por: criada_por || 'casal', family_id })
      .select().single();
    if (err) {
      if (err.code === '23505') return NextResponse.json({ success: false, error: 'Categoria já existe' }, { status: 409 });
      throw err;
    }
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao criar categoria' }, { status: 500 }); }
}

// DELETE /api/categorias?id=xxx — remover categoria customizada
export async function DELETE(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    await getAdmin().from('categorias_customizadas').delete().eq('id', id).eq('family_id', family_id);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 }); }
}
