// app/api/onboarding/route.ts — salvar dados do onboarding
// BUG-04 fix: não depende mais do authGuard; faz auth manual com fallback de criação de família
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

async function getUserAndFamily(req: Request): Promise<{ userId: string | null; familyId: string | null; error: NextResponse | null }> {
  let allCookies: { name: string; value: string }[] = [];
  try {
    const { cookies } = await import('next/headers');
    const store = await cookies();
    allCookies = store.getAll().map((c: any) => ({ name: c.name, value: c.value }));
  } catch {}

  if (allCookies.length === 0) {
    const cookieHeader = req.headers.get('cookie') || '';
    allCookies = cookieHeader.split(';')
      .map(c => { const [name, ...v] = c.trim().split('='); return { name: name.trim(), value: v.join('=') }; })
      .filter(c => c.name);
  }

  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return allCookies; }, setAll() {} } }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) {
    return { userId: null, familyId: null, error: NextResponse.json({ error: 'Não autorizado.' }, { status: 401 }) };
  }

  const admin = getAdmin();
  const { data: perfil } = await admin.from('perfis').select('family_id').eq('id', user.id).single();

  let familyId = perfil?.family_id ?? null;

  // BUG-04: Se family_id ausente, criar família e perfil agora
  if (!familyId) {
    const planoCriacao = user.user_metadata?.plano ?? 'individual';
    const { data: novaFamilia } = await admin.from('familias').insert({
      nome: `Finexa · ${user.user_metadata?.nome ?? user.email}`,
      plano: planoCriacao,
      assinatura_status: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }).select('id').single();

    familyId = novaFamilia?.id ?? null;

    if (familyId) {
      await admin.from('perfis').upsert({
        id: user.id,
        family_id: familyId,
        email: user.email,
        nome: user.user_metadata?.nome ?? '',
        role: 'membro',
      }, { onConflict: 'id' });
    }
  }

  if (!familyId) {
    return { userId: user.id, familyId: null, error: NextResponse.json({ error: 'Não foi possível determinar a família.' }, { status: 403 }) };
  }

  return { userId: user.id, familyId, error: null };
}

export async function POST(req: Request) {
  const { userId, familyId, error } = await getUserAndFamily(req);
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
      limite_gasto_mensal,
      reserva_emergencia,
    } = await req.json();

    const admin = getAdmin();

    // 1. Atualizar perfil + user_metadata
    const perfilUpdate: any = { onboarding_done: true, is_master: is_master ?? false };
    if (nome) perfilUpdate.nome = nome;

    await Promise.all([
      admin.from('perfis').update(perfilUpdate).eq('id', userId),
      nome ? admin.auth.admin.updateUserById(userId!, { user_metadata: { nome } }) : Promise.resolve(),
    ]);

    // 2. Salvar planejamento financeiro
    const { data: existing } = await admin.from('planejamento')
      .select('id').eq('family_id', familyId).limit(1).single();

    const payload: any = { updated_at: new Date().toISOString() };

    if (is_master) {
      if (salario !== undefined)         payload.salario_leticia  = salario;
      if (salario_parceiro !== undefined) payload.salario_giovanna = salario_parceiro;
      if (contas_fixas !== undefined)     payload.contas_fixas = contas_fixas;
      if (limite_gasto_mensal !== undefined) payload.limite_gasto_mensal = limite_gasto_mensal;
      if (reserva_emergencia !== undefined) payload.reserva_emergencia = reserva_emergencia;
      payload.percentual_investimento = 0;
    } else {
      // Convidado: seu salário entra como salario_giovanna para divisão proporcional
      if (salario !== undefined) payload.salario_giovanna = salario;
      if (reserva_emergencia !== undefined) payload.reserva_emergencia = reserva_emergencia;
    }

    if (existing?.id) {
      if (Object.keys(payload).length > 1) {
        await admin.from('planejamento').update(payload).eq('id', existing.id);
      }
    } else {
      // Garantir campos mínimos para não criar linha incompleta
      await admin.from('planejamento').insert({
        salario_leticia: 0,
        salario_giovanna: 0,
        percentual_investimento: 0,
        contas_fixas: [],
        limite_gasto_mensal: 9000,
        reserva_emergencia: 0,
        ...payload,
        family_id: familyId,
      });
    }

    // 3. Atualizar plano + privacidade da família
    const familiaPayload: any = {};
    if (plano) familiaPayload.plano = plano;
    if (privacidade) familiaPayload.privacidade_modo = privacidade;

    if (Object.keys(familiaPayload).length > 0) {
      await admin.from('familias').update(familiaPayload).eq('id', familyId)
        .then(res => { if (res.error) console.error('[onboarding] Erro ao atualizar familia:', res.error.message); });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
