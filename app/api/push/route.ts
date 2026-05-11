import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authGuard } from '@/lib/auth-guard';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;

  try {
    const { subscription, perfil } = await req.json();

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Subscription inválida' }, { status: 400 });
    }

    const { error: dbError } = await getAdmin()
      .from('push_subscriptions')
      .upsert({
        perfil:    perfil ?? 'membro',
        endpoint:  subscription.endpoint,
        p256dh:    subscription.keys.p256dh,
        auth:      subscription.keys.auth,
        family_id,
      }, { onConflict: 'endpoint' });

    if (dbError) {
      console.error('[push] Erro ao salvar subscription:', dbError.message);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[push] Erro interno:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { error } = await authGuard(req);
  if (error) return error;

  try {
    const { endpoint } = await req.json();
    if (!endpoint)
      return NextResponse.json({ error: 'endpoint obrigatório' }, { status: 400 });

    await getAdmin()
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}