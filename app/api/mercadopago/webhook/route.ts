// app/api/mercadopago/webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function validarAssinaturaMP(req: Request, dataId: string): boolean {
  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[webhook] MERCADOPAGO_WEBHOOK_SECRET não configurado');
    return false;
  }

  // Se não há headers de assinatura, é simulação do painel — permitir apenas em sandbox
  if (!xSignature || !xRequestId) {
    const isLiveMode = true; // assumir produção por segurança
    try {
      // live_mode vem no body — já parseado antes desta função ser chamada
      return false; // sem assinatura = rejeitar sempre
    } catch {
      return false;
    }
  }

  const parts = Object.fromEntries(xSignature.split(',').map(p => p.split('=')));
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  const manifest = `id=${dataId};request-id=${xRequestId};ts=${ts};`;
  const hmac = crypto.createHmac('sha256', webhookSecret).update(manifest).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const { type, data, live_mode } = body;

    if (type === 'payment' && data?.id) {
      // Simulações do painel do MP têm live_mode: false — retornar 200 sem processar
      if (live_mode === false) {
        console.log('[webhook] Simulação detectada (live_mode: false) — ignorando');
        return NextResponse.json({ ok: true, simulated: true });
      }

      // Em produção, exigir assinatura válida
      if (!validarAssinaturaMP(req, String(data.id))) {
        console.warn('[webhook] Assinatura inválida — requisição rejeitada');
        return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
      }

      let payment;
      try {
        payment = await new Payment(mp).get({ id: data.id });
      } catch (err: any) {
        // Pagamento não encontrado na API (ex: ID inválido ou de outro ambiente)
        console.error('[webhook] Erro ao buscar pagamento:', err.message);
        return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
      }

      if (payment.status === 'approved') {
        const ref = payment.external_reference ?? '';
        const [family_id, plano_id] = ref.split('|');
        if (family_id && plano_id) {
          const agora = new Date();
          const fim = new Date(agora);
          fim.setMonth(fim.getMonth() + 1);
          await getAdmin().from('familias').update({
            assinatura_status: 'ativa',
            plano: plano_id,
            assinatura_inicio: agora.toISOString(),
            assinatura_fim: fim.toISOString(),
          }).eq('id', family_id);
        }
      }

      if (['rejected', 'refunded', 'cancelled'].includes(payment.status ?? '')) {
        const ref = payment.external_reference ?? '';
        const [family_id] = ref.split('|');
        if (family_id) {
          await getAdmin().from('familias')
            .update({ assinatura_status: 'expirada' })
            .eq('id', family_id);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}