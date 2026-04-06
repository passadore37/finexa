// app/api/mercadopago/route.ts — criar preferência de pagamento (PIX + cartão)
import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';
import { getPlano } from '@/lib/planos';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: Request) {
  const { family_id, user, error } = await authGuard(req);
  if (error) return error;
  try {
    const { plano_id, preco_override } = await req.json();
    const plano = getPlano(plano_id);

    // Buscar nome da família
    const { data: familia } = await getAdmin()
      .from('familias').select('nome').eq('id', family_id).single();

    const preference = await new Preference(mp).create({
      body: {
        items: [{
          id:          plano_id,
          title:       `Finexa — Plano ${plano.nome}`,
          description: `Assinatura mensal Finexa ${plano.nome}`,
          quantity:    1,
          currency_id: 'BRL',
          unit_price:  preco_override ?? plano.preco,
        }],
        payer: {
          email: user.email,
          name:  user.user_metadata?.nome ?? familia?.nome ?? '',
        },
        payment_methods: {
          // Aceitar PIX e cartão, excluir boleto por ora
          excluded_payment_types: [{ id: 'ticket' }],
          installments: 1, // sem parcelamento (assinatura mensal)
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?assinatura=sucesso`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/plano?id=${plano_id}&cancelado=true`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/plano?id=${plano_id}&pendente=true`,
        },
        auto_return: 'approved',
        external_reference: `${family_id}|${plano_id}`,
        statement_descriptor: 'FINEXA',
      },
    });

    // Salvar preference_id para rastrear
    await getAdmin().from('familias')
      .update({ openpix_customer_id: preference.id }) // reutilizando coluna
      .eq('id', family_id);

    return NextResponse.json({
      preference_id: preference.id,
      url:           preference.init_point, // URL do checkout MP
      sandbox_url:   preference.sandbox_init_point,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
