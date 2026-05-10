// app/api/push/inativo/route.ts
// Cron: "0 18 * * *" — todo dia às 18h, notifica quem está 3+ dias sem lançar
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarPush } from '@/lib/push';

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

  const admin  = getAdmin();
  const limite = new Date();
  limite.setDate(limite.getDate() - 3); // 3 dias atrás
  const limiteStr = limite.toISOString().split('T')[0];

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, family_id');

  if (!subs?.length) return NextResponse.json({ ok: true, enviados: 0 });

  // Última transação de cada família
  const { data: ultimas } = await admin
    .from('transacoes')
    .select('family_id, data')
    .order('data', { ascending: false });

  // Mapear última data por família
  const ultimaData: Record<string, string> = {};
  for (const t of ultimas ?? []) {
    if (!ultimaData[t.family_id]) ultimaData[t.family_id] = t.data;
  }

  let enviados = 0;

  for (const sub of subs) {
    const ultima = ultimaData[sub.family_id];
    // Notificar se nunca lançou ou se o último foi há 3+ dias
    if (!ultima || ultima <= limiteStr) {
      const dias = ultima
        ? Math.floor((Date.now() - new Date(ultima).getTime()) / 86400000)
        : null;

      const body = dias
        ? `Faz ${dias} dias sem lançamento. Que tal atualizar agora? 👀`
        : 'Você ainda não registrou nenhum gasto. Comece agora, leva menos de 1 minuto!';

      const ok = await enviarPush(sub, {
        title: '📋 Seu controle precisa de você',
        body,
        url: '/lancar',
      });
      if (ok) enviados++;
    }
  }

  return NextResponse.json({ ok: true, enviados });
}

export async function GET(req: Request) { return POST(req); }