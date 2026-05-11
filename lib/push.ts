// lib/push.ts — envio de push notifications via Web Push
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Converte base64url para Uint8Array
 */
function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const raw = Buffer.from(base64, 'base64');
  return new Uint8Array(raw);
}

/**
 * Importa chave privada VAPID raw (32 bytes) para CryptoKey
 * A chave gerada pelo nosso script é o escalar bruto P-256
 */
async function importarChavePrivadaVapid(privKeyBase64url: string): Promise<CryptoKey> {
  const rawKey = base64urlToUint8Array(privKeyBase64url);

  // Montar JWK a partir da chave raw P-256
  // Precisamos também da chave pública para montar o JWK completo
  const pubKeyBase64url = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const pubKeyBytes = base64urlToUint8Array(pubKeyBase64url);

  // pubKeyBytes = 04 || x (32 bytes) || y (32 bytes)
  const x = Buffer.from(pubKeyBytes.slice(1, 33)).toString('base64url');
  const y = Buffer.from(pubKeyBytes.slice(33, 65)).toString('base64url');
  const d = Buffer.from(rawKey).toString('base64url');

  const jwk = { kty: 'EC', crv: 'P-256', x, y, d };

  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

/**
 * Gera header VAPID Authorization para o endpoint
 */
async function gerarVapidAuth(endpoint: string): Promise<string> {
  const vapidPublic  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY!;

  if (!vapidPublic || !vapidPrivate) {
    throw new Error('VAPID keys não configuradas');
  }

  const privateKey = await importarChavePrivadaVapid(vapidPrivate);
  const origin     = new URL(endpoint).origin;
  const exp        = Math.floor(Date.now() / 1000) + 12 * 3600;

  const header  = Buffer.from(JSON.stringify({ typ: 'JWT', alg: 'ES256' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    aud: origin,
    exp,
    sub: `mailto:contato@finexa.app`,
  })).toString('base64url');

  const signing   = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signing)
  );

  const sig = Buffer.from(signature).toString('base64url');
  return `vapid t=${signing}.${sig},k=${vapidPublic}`;
}

/**
 * Serializa payload para formato Web Push (JSON como texto)
 */
function serializarPayload(payload: PushPayload): string {
  return JSON.stringify(payload);
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
    const body          = serializarPayload(payload);

    const res = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': authorization,
        'TTL':           '86400',
      },
      body,
    });

    // 404/410 = subscription expirada — remover do banco
    if (res.status === 404 || res.status === 410) {
      console.log('[push] Subscription expirada, removendo:', subscription.endpoint.slice(0, 50));
      await getAdmin()
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);
      return false;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[push] Erro ao enviar:', res.status, errText.slice(0, 200));
      return false;
    }

    return true;
  } catch (err: any) {
    console.error('[push] Exceção ao enviar:', err.message);
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

  let query = admin.from('push_subscriptions').select('endpoint, p256dh, auth, family_id');

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

  const resultados = await Promise.all(subs.map((s: any) => enviarPush(s, payload)));
  return {
    enviados: resultados.filter(Boolean).length,
    falhas:   resultados.filter(r => !r).length,
  };
}