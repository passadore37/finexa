// app/api/push/broadcast/route.ts
// Envio manual de notificação para todos os usuários (novas funcionalidades, avisos)
import { NextResponse } from 'next/server';
import { enviarPushBroadcast } from '@/lib/push';

function isAdminAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization');
  if (auth === `Bearer ${process.env.CRON_SECRET}`) return true;
  return req.headers.get('x-admin-secret') === process.env.CRON_SECRET;
}

export async function POST(req: Request) {
  if (!isAdminAuthorized(req))
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const { title, body, url, apenas_trial } = await req.json();

    if (!title || !body)
      return NextResponse.json({ error: 'title e body obrigatórios' }, { status: 400 });

    const resultado = await enviarPushBroadcast(
      { title, body, url: url ?? '/dashboard' },
      apenas_trial ? { assinatura_status: 'trial' } : undefined
    );

    return NextResponse.json({ ok: true, ...resultado });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}