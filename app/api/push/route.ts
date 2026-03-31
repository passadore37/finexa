import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authGuard } from '@/lib/auth-guard';

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { subscription, perfil } = await req.json();
    await supabase.from('push_subscriptions').upsert({
      perfil, endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh, auth: subscription.keys.auth,
      family_id,
    }, { onConflict: 'endpoint' });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false }, { status: 500 }); }
}
