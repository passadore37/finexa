// app/api/push/lembrete-diario/route.ts
// Cron: "0 21 * * *" — todo dia às 21h (horário UTC-3 = 00h UTC)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarPush } from '@/lib/push';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function isCronAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  const admin = req.headers.get('x-admin-secret');
  return admin === process.env.CRON_SECRET;
}

const FRASES = [
  { title: '💸 Lembrete do dia', body: 'Não esquece de registrar os gastos de hoje!' },
  { title: '📊 Hora de atualizar', body: 'Como foram os gastos hoje? Lança aí no Finexa!' },
  { title: '🎯 Foco no controle', body: 'Matenha os registros em dia. 1 minuto agora vale muito no fim do mês.' },
  { title: '📱 Finexa te lembra', body: 'Tudo que você gastou hoje já está na memória. Bora registrar no Finexa?' },
  { title: '💡 Dica do dia', body: 'Registrar gastos no fim do dia é o hábito mais poderoso do controle financeiro.' },
];

export async function POST(req: Request) {
  if (!isCronAuthorized(req))
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const admin = getAdmin();
  const hoje = new Date().toISOString().split('T')[0];

  // Buscar usuários que NÃO lançaram nada hoje
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, family_id');

  if (!subs?.length) return NextResponse.json({ ok: true, enviados: 0 });

  // Para cada subscription, verificar se a família lançou hoje
  const { data: lancamentos } = await admin
    .from('transacoes')
    .select('family_id')
    .eq('data', hoje);

  const familiasComLancamento = new Set((lancamentos ?? []).map((t: any) => t.family_id));

  // Enviar só para quem não lançou
  const frase = FRASES[new Date().getDay() % FRASES.length];
  let enviados = 0;

  for (const sub of subs) {
    if (familiasComLancamento.has(sub.family_id)) continue; // já lançou hoje

    const ok = await enviarPush(sub, { ...frase, url: '/lancar' });
    if (ok) enviados++;
  }

  return NextResponse.json({ ok: true, enviados });
}

export async function GET(req: Request) { return POST(req); }