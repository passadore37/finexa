// app/api/mercadopago/webhook/route.ts — processar notificações do MercadoPago
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // MercadoPago envia notificações de pagamento
    if (type === 'payment' && data?.id) {
      const payment = await new Payment(mp).get({ id: data.id });

      if (payment.status === 'approved') {
        const ref = payment.external_reference ?? '';
        const [family_id, plano_id] = ref.split('|');

        if (family_id && plano_id) {
          const agora = new Date();
          const fim   = new Date(agora);
          fim.setMonth(fim.getMonth() + 1);

          await getAdmin().from('familias').update({
            assinatura_status: 'ativa',
            plano:             plano_id,
            assinatura_inicio: agora.toISOString(),
            assinatura_fim:    fim.toISOString(),
          }).eq('id', family_id);
        }
      }

      // Pagamento recusado ou reembolsado
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
