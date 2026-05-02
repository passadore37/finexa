// app/api/admin/beta/route.ts — gerenciar geração de links beta (apenas admin)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

// POST /api/admin/beta — gerar novo link de beta (requer admin_token)
export async function POST(req: Request) {
  const adminToken = req.headers.get('x-admin-token');
  if (adminToken !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { email, nome } = await req.json();
    const token = randomUUID();
    
    // Inserir novo convite beta
    const { data, error } = await getAdmin().from('beta_tokens').insert({
      token,
      email: email || null,
      nome: nome || null,
      criado_em: new Date().toISOString(),
      usado: false,
    }).select().single();

    if (error) throw error;

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/beta/${token}`;
    
    return NextResponse.json({
      success: true,
      token,
      url,
      data: {
        ...data,
        link: url,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET /api/admin/beta — listar todos os links beta (requer admin_token)
export async function GET(req: Request) {
  const adminToken = req.headers.get('x-admin-token');
  if (adminToken !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { data, error } = await getAdmin()
      .from('beta_tokens')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      total: data?.length || 0,
      tokens: data?.map(t => ({
        ...t,
        link: `${process.env.NEXT_PUBLIC_APP_URL}/beta/${t.token}`,
      })) || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/admin/beta/:token — atualizar status de um link (requer admin_token)
export async function PATCH(req: Request) {
  const adminToken = req.headers.get('x-admin-token');
  if (adminToken !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { token, email, nome, usado } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 });
    }

    const payload: any = {};
    if (email !== undefined) payload.email = email;
    if (nome !== undefined) payload.nome = nome;
    if (usado !== undefined) payload.usado = usado;

    const { data, error } = await getAdmin()
      .from('beta_tokens')
      .update(payload)
      .eq('token', token)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/beta/${data.token}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/beta/:token — deletar um link beta (requer admin_token)
export async function DELETE(req: Request) {
  const adminToken = req.headers.get('x-admin-token');
  if (adminToken !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 });
    }

    const { error } = await getAdmin()
      .from('beta_tokens')
      .delete()
      .eq('token', token);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
