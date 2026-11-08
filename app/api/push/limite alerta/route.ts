// app/api/push/limite-alerta/route.ts
// Cron: "0 23 * * *" — todo dia às 20h (BRT), alerta 80% e 100% do limite
// Envia apenas UMA VEZ por threshold — não repete até passar para o próximo
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarPushFamilia } from '@/lib/push';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function isCronAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  return req.headers.get('x-admin-secret') === process.env.CRON_SECRET;
}

export async function POST(req: Request) {
  if (!isCronAuthorized(req))
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const admin = getAdmin();
  const hoje  = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
  const fim    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

  const { data: limites } = await admin
    .from('limites_financeiros')
    .select('family_id, limite_mensal, alerta_80_enviado, alerta_100_enviado, alerta_mes');

  if (!limites?.length) return NextResponse.json({ ok: true, enviados: 0 });

  let enviados = 0;

  for (const limite of limites) {
    if (!limite.limite_mensal) continue;

    // Se os alertas são de um mês anterior, resetar
    const mesDoAlerta = limite.alerta_mes ?? '';
    const alertaReset = mesDoAlerta !== mesAtual;

    const { data: transacoes } = await admin
      .from('transacoes')
      .select('valor')
      .eq('family_id', limite.family_id)
      .gte('data', inicio)
      .lte('data', fim);

    const totalGasto = (transacoes ?? []).reduce((acc: number, t: any) => acc + Number(t.valor), 0);
    const percentual = (totalGasto / limite.limite_mensal) * 100;

    // --- Alerta de 100% ---
    const ja100 = !alertaReset && limite.alerta_100_enviado;
    if (percentual >= 100 && !ja100) {
      await enviarPushFamilia(limite.family_id, {
        title: '🚨 Limite de gastos atingido!',
        body:  `Você gastou R$${totalGasto.toFixed(0)} — ultrapassou o limite de R$${limite.limite_mensal}.`,
        url:   '/dashboard',
      });
      await admin.from('limites_financeiros').update({
        alerta_100_enviado: true,
        alerta_mes: mesAtual,
      }).eq('family_id', limite.family_id);
      enviados++;
      continue; // já notificou 100%, não notificar 80% também
    }

    // --- Alerta de 80% ---
    const ja80 = !alertaReset && limite.alerta_80_enviado;
    if (percentual >= 80 && percentual < 100 && !ja80) {
      await enviarPushFamilia(limite.family_id, {
        title: '⚠️ Atenção ao limite de gastos',
        body:  `Você usou ${percentual.toFixed(0)}% do orçamento. Restam R$${(limite.limite_mensal - totalGasto).toFixed(0)} este mês.`,
        url:   '/dashboard',
      });
      await admin.from('limites_financeiros').update({
        alerta_80_enviado: true,
        alerta_mes: mesAtual,
        // resetar 100 se voltou abaixo (ex: estorno)
        alerta_100_enviado: false,
      }).eq('family_id', limite.family_id);
      enviados++;
    }

    // --- Reset se voltou abaixo de 80% (ex: estorno) ---
    if (percentual < 80 && (alertaReset || limite.alerta_80_enviado)) {
      await admin.from('limites_financeiros').update({
        alerta_80_enviado: false,
        alerta_100_enviado: false,
        alerta_mes: mesAtual,
      }).eq('family_id', limite.family_id);
    }
  }

  return NextResponse.json({ ok: true, enviados });
}

export async function GET(req: Request) { return POST(req); }