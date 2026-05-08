// lib/rate-limit.ts — Rate limit com Upstash Redis
// Se UPSTASH_REDIS_REST_URL não estiver configurado, cai para limitador em memória (dev only)
//
// Setup:
//   1. Crie um banco Redis em https://console.upstash.com
//   2. Adicione ao .env.local:
//      UPSTASH_REDIS_REST_URL=https://...upstash.io
//      UPSTASH_REDIS_REST_TOKEN=...

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Fallback em memória — funciona apenas em desenvolvimento (1 instância)
const memoryStore = new Map<string, { count: number; reset: number }>();

async function incrementRedis(key: string, windowSec: number): Promise<number> {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, windowSec],
    ]),
  });
  const data = await res.json();
  return data[0]?.result ?? 1;
}

/**
 * Verifica e incrementa o rate limit para um identificador.
 * @param identifier - IP ou user ID
 * @param max - máximo de requisições na janela
 * @param windowSec - janela em segundos (padrão: 60)
 * @returns true se permitido, false se bloqueado
 */
export async function checkRateLimit(
  identifier: string,
  max = 10,
  windowSec = 60
): Promise<boolean> {
  const key = `rl:${identifier}`;

  // Usar Redis se disponível
  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      const count = await incrementRedis(key, windowSec);
      return count <= max;
    } catch (err) {
      // Se Redis falhar, permitir a requisição (fail open) mas logar
      console.error('[rate-limit] Erro ao consultar Redis:', err);
      return true;
    }
  }

  // Fallback em memória (desenvolvimento)
  const now = Date.now();
  const entry = memoryStore.get(key);
  if (!entry || now > entry.reset) {
    memoryStore.set(key, { count: 1, reset: now + windowSec * 1000 });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}
