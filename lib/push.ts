// lib/push.ts — envio de push notifications via web-push
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function configurarVapid() {
  const pub  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) throw new Error('VAPID keys não configuradas');
  webpush.setVapidDetails('mailto:contato@finexa.app', pub, priv);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Envia push para uma subscription individual
 */
export async function enviarPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  try {
    configurarVapid();

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      { TTL: 86400 }
    );

    return true;
  } catch (err: any) {
    // 404/410 = subscription expirada — remover do banco
    if (err.statusCode === 404 || err.statusCode === 410) {
      console.log('[push] Subscription expirada, removendo');
      await getAdmin()
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);
      return false;
    }
    console.error('[push] Erro ao enviar:', err.statusCode, err.body ?? err.message);
    return false;
  }
}

/**
 * Envia push para toda uma família
 */
export async function enviarPushFamilia(
  family_id: string,
  payload: PushPayload
): Promise<{ enviados: number; falhas: number }> {
  const { data: subs } = await getAdmin()
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('family_id', family_id);

  if (!subs?.length) return { enviados: 0, falhas: 0 };

  const resultados = await Promise.all(subs.map(s => enviarPush(s, payload)));
  return {
    enviados: resultados.filter(Boolean).length,
    falhas:   resultados.filter(r => !r).length,
  };
}

/**
 * Envia push para todos os usuários (broadcast)
 */
export async function enviarPushBroadcast(
  payload: PushPayload,
  filtro?: { assinatura_status?: string }
): Promise<{ enviados: number; falhas: number }> {
  const admin = getAdmin();
  let query   = admin.from('push_subscriptions').select('endpoint, p256dh, auth, family_id');

  if (filtro?.assinatura_status) {
    const { data: familias } = await admin
      .from('familias').select('id')
      .eq('assinatura_status', filtro.assinatura_status);

    const ids = (familias ?? []).map((f: any) => f.id);
    if (!ids.length) return { enviados: 0, falhas: 0 };
    query = query.in('family_id', ids);
  }

  const { data: subs } = await query;
  if (!subs?.length) return { enviados: 0, falhas: 0 };

  const resultados = await Promise.all(subs.map((s: any) => enviarPush(s, payload)));
  return {
    enviados: resultados.filter(Boolean).length,
    falhas:   resultados.filter(r => !r).length,
  };
}