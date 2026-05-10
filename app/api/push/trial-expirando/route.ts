// app/api/push/trial-expirando/route.ts
// Cron: "0 10 * * *" — todo dia às 10h, avisa quem expira em 3 dias
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

  // Famílias com trial expirando nos próximos 3 dias
  const em3dias = new Date();
  em3dias.setDate(em3dias.getDate() + 3);
  const em3diasStr = em3dias.toISOString().split('T')[0];

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const amanhaStr = amanha.toISOString().split('T')[0];

  const hoje = new Date().toISOString().split('T')[0];

  const { data: familias } = await admin
    .from('familias')
    .select('id, trial_ends_at, plano')
    .eq('assinatura_status', 'trial')
    .gte('trial_ends_at', hoje)
    .lte('trial_ends_at', em3diasStr);

  if (!familias?.length) return NextResponse.json({ ok: true, enviados: 0 });

  let enviados = 0;

  for (const familia of familias) {
    const expira = new Date(familia.trial_ends_at).toISOString().split('T')[0];
    const diasRestantes = Math.ceil(
      (new Date(familia.trial_ends_at).getTime() - Date.now()) / 86400000
    );

    let title = '';
    let body  = '';

    if (expira === hoje) {
      title = '⏰ Seu trial expira hoje!';
      body  = 'Assine agora para não perder o acesso ao Finexa.';
    } else if (expira === amanhaStr) {
      title = '⏰ Trial expira amanhã';
      body  = 'Último dia! Assine para continuar usando o Finexa.';
    } else {
      title = `⏰ ${diasRestantes} dias de trial restantes`;
      body  = 'Aproveite enquanto dura — assine para garantir seu acesso.';
    }

    await enviarPushFamilia(familia.id, { title, body, url: `/plano?id=${familia.plano}&expired=false` });
    enviados++;
  }

  return NextResponse.json({ ok: true, enviados });
}

export async function GET(req: Request) { return POST(req); }