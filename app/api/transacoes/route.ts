import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authGuard } from '@/lib/auth-guard';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function dataLocalHoje() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth()+1).padStart(2,'0')}-${String(agora.getDate()).padStart(2,'0')}`;
}

// FIX #8 — helper para parsear inteiro com fallback seguro
function parseIntSafe(val: string | null, fallback: number): number {
  if (val === null) return fallback;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { searchParams } = new URL(req.url);
    const hoje = new Date();

    // FIX #8 — parseIntSafe evita NaN em parâmetros inválidos
    const mes = parseIntSafe(searchParams.get('mes'), hoje.getMonth());
    const ano = parseIntSafe(searchParams.get('ano'), hoje.getFullYear());

    // Validação de range
    if (mes < 0 || mes > 11)
      return NextResponse.json({ success: false, error: 'Mês inválido (0-11)' }, { status: 400 });
    if (ano < 2000 || ano > 2100)
      return NextResponse.json({ success: false, error: 'Ano inválido' }, { status: 400 });

    const inicio = new Date(ano, mes, 1).toISOString().split('T')[0];
    const fim    = new Date(ano, mes + 1, 0).toISOString().split('T')[0];

    const { data, error: err } = await getAdmin().from('transacoes').select('*')
      .eq('family_id', family_id)
      .gte('data', inicio).lte('data', fim)
      .order('data', { ascending: false }).limit(500);

    if (err) throw err;

    const dataTratada = data?.map(t => ({
      ...t,
      categoria: t.recorrente ? 'Despesas Fixas' : t.categoria
    })) || [];

    return NextResponse.json({ success: true, data: dataTratada });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao buscar' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const body = await req.json();
    const { valor, categoria, descricao, perfil, divisao, parcela_atual, total_parcelas, recorrente, data } = body;

    if (!valor || !categoria)
      return NextResponse.json({ success: false, error: 'Valor e categoria obrigatórios' }, { status: 400 });

    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum <= 0)
      return NextResponse.json({ success: false, error: 'Valor inválido' }, { status: 400 });

    const { data: result, error: err } = await getAdmin().from('transacoes').insert({
      data: data || dataLocalHoje(),
      valor: valorNum,
      categoria,
      descricao: descricao || categoria,
      perfil: perfil || 'casal',
      divisao: divisao || '50/50',
      parcela_atual: parcela_atual || 1,
      total_parcelas: total_parcelas || 1,
      recorrente: recorrente || false,
      family_id,
    }).select().single();

    if (err) throw err;

    if (recorrente) {
      const { data: plan } = await getAdmin().from('planejamento')
        .select('id, contas_fixas').eq('family_id', family_id)
        .order('updated_at', { ascending: false }).limit(1).single();

      if (plan) {
        const fixas = Array.isArray(plan.contas_fixas) ? [...plan.contas_fixas] : [];
        fixas.push({ id: result.id, descricao: descricao || categoria, valor: valorNum, categoria });
        await getAdmin().from('planejamento')
          .update({ contas_fixas: fixas, updated_at: new Date().toISOString() })
          .eq('id', plan.id);
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao salvar' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { id, valor, categoria, descricao } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });

    const valorNum = Number(valor);
    if (isNaN(valorNum) || valorNum <= 0)
      return NextResponse.json({ success: false, error: 'Valor inválido' }, { status: 400 });

    const { data, error: err } = await getAdmin().from('transacoes')
      .update({ valor: valorNum, categoria, descricao })
      .eq('id', id).eq('family_id', family_id).select().single();

    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 });
    await getAdmin().from('transacoes').delete().eq('id', id).eq('family_id', family_id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao deletar' }, { status: 500 });
  }
}