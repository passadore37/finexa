// app/api/onboarding/route.ts — salvar dados do onboarding
import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: Request) {
  const { family_id, user, error } = await authGuard(req);
  if (error) return error;

  try {
    const {
      nome,
      salario,
      salario_parceiro,
      contas_fixas,
      plano,
      is_master,
    } = await req.json();

    const admin = getAdmin();

    // 1. Atualizar nome e marcar onboarding como feito
    await admin.from('perfis').update({
      nome,
      onboarding_done: true,
      is_master: is_master ?? false,
    }).eq('id', user.id);

    // 2. Salvar planejamento financeiro
    const { data: existing } = await admin.from('planejamento')
      .select('id').eq('family_id', family_id).limit(1).single();

    const payload = {
      salario_leticia:  salario ?? 0,
      salario_giovanna: salario_parceiro ?? 0,
      percentual_investimento: 10,
      contas_fixas: contas_fixas ?? [],
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      await admin.from('planejamento').update(payload).eq('id', existing.id);
    } else {
      await admin.from('planejamento').insert({ ...payload, family_id });
    }

    // 3. Atualizar plano da família se fornecido
    if (plano) {
      await admin.from('familias').update({ plano }).eq('id', family_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
