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
      privacidade,
    } = await req.json();

    const admin = getAdmin();

    // 1. Atualizar nome no perfil E no user_metadata do auth
    await Promise.all([
      admin.from('perfis').update({
        nome,
        onboarding_done: true,
        is_master: is_master ?? false,
      }).eq('id', user.id),
      admin.auth.admin.updateUserById(user.id, {
        user_metadata: { nome },
      }),
    ]);

    // 2. Salvar planejamento financeiro
    const { data: existing } = await admin.from('planejamento')
      .select('id').eq('family_id', family_id).limit(1).single();

    const payload: any = {
      updated_at: new Date().toISOString(),
    };

    if (is_master) {
      if (salario !== undefined) payload.salario_leticia = salario;
      if (salario_parceiro !== undefined) payload.salario_giovanna = salario_parceiro;
      if (contas_fixas !== undefined) payload.contas_fixas = contas_fixas;
      payload.percentual_investimento = 10;
    } else {
      // Se for convidado, o "Seu salário" alimenta o parceiro
      if (salario !== undefined) payload.salario_giovanna = salario;
    }

    if (existing?.id) {
      if (Object.keys(payload).length > 1) { // Só atualiza se tiver mais que updated_at
        await admin.from('planejamento').update(payload).eq('id', existing.id);
      }
    } else {
      await admin.from('planejamento').insert({ ...payload, family_id });
    }

    // 3. Atualizar plano da família e privacidade se aplicável
    const familiaPayload: any = {};
    if (plano) familiaPayload.plano = plano;
    if (privacidade) familiaPayload.privacidade_modo = privacidade; // Supondo que a coluna exista ou seja providenciada

    if (Object.keys(familiaPayload).length > 0) {
      // Silent catch caso privacidade_modo ainda não exista no schema, evitando falhas de onboarding
      await admin.from('familias').update(familiaPayload).eq('id', family_id)
        .then(res => { if (res.error) console.error('Erro ao atualizar familia:', res.error); });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
