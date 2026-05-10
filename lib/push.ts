// lib/push.ts — envio de push notifications via Web Push
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Gerar header VAPID Authorization
async function gerarVapidAuth(endpoint: string): Promise<string> {
  const vapidPublic  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY!;
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://finexa-one.vercel.app';

  // Importar chave privada VAPID
  const privateKeyBuffer = Buffer.from(vapidPrivate, 'base64');
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const origin = new URL(endpoint).origin;
  const exp    = Math.floor(Date.now() / 1000) + 12 * 3600; // 12h

  const header  = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ aud: origin, exp, sub: `mailto:contato@finexa.app` })).toString('base64url');
  const signing = `${header}.${payload}`;

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signing)
  );

  const sig = Buffer.from(signature).toString('base64url');
  return `vapid t=${signing}.${sig},k=${vapidPublic}`;
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
    const authorization = await gerarVapidAuth(subscription.endpoint);

    const res = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': authorization,
        'TTL':           '86400',
      },
      body: JSON.stringify(payload),
    });

    // 404/410 = subscription expirada — remover do banco
    if (res.status === 404 || res.status === 410) {
      await getAdmin()
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);
      return false;
    }

    return res.ok;
  } catch (err: any) {
    console.error('[push] Erro ao enviar:', err.message);
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
  const admin = getAdmin();
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('family_id', family_id);

  if (!subs?.length) return { enviados: 0, falhas: 0 };

  const resultados = await Promise.all(
    subs.map(s => enviarPush(s, payload))
  );

  return {
    enviados: resultados.filter(Boolean).length,
    falhas:   resultados.filter(r => !r).length,
  };
}

/**
 * Envia push para todos os usuários (broadcast)
 * Usado para anúncios de novas funcionalidades
 */
export async function enviarPushBroadcast(
  payload: PushPayload,
  filtro?: { assinatura_status?: string }
): Promise<{ enviados: number; falhas: number }> {
  const admin = getAdmin();

  let query = admin.from('push_subscriptions').select('endpoint, p256dh, auth, family_id');

  // Filtrar por status de assinatura se necessário
  if (filtro?.assinatura_status) {
    const { data: familias } = await admin
      .from('familias')
      .select('id')
      .eq('assinatura_status', filtro.assinatura_status);

    const ids = (familias ?? []).map((f: any) => f.id);
    if (!ids.length) return { enviados: 0, falhas: 0 };
    query = query.in('family_id', ids);
  }

  const { data: subs } = await query;
  if (!subs?.length) return { enviados: 0, falhas: 0 };

  const resultados = await Promise.all(
    subs.map((s: any) => enviarPush(s, payload))
  );

  return {
    enviados: resultados.filter(Boolean).length,
    falhas:   resultados.filter(r => !r).length,
  };
}