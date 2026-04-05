import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth-guard';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const { data, error: err } = await getAdmin()
      .from('reservas_emergencia').select('*')
      .eq('family_id', family_id)
      .order('ano').order('mes');
    if (err) throw err;
    return NextResponse.json({ success: true, data: data || [] });
  } catch { return NextResponse.json({ success: false, error: 'Erro' }, { status: 500 }); }
}

export async function POST(req: Request) {
  const { family_id, error } = await authGuard(req);
  if (error) return error;
  try {
    const hoje = new Date();
    const { perfil, saldo, mes = hoje.getMonth(), ano = hoje.getFullYear() } = await req.json();
    if (!perfil || saldo === undefined)
      return NextResponse.json({ success: false, error: 'Perfil e saldo obrigatórios' }, { status: 400 });

    const { data, error: err } = await getAdmin().from('reservas_emergencia')
      .upsert({ family_id, perfil, saldo: Number(saldo), mes, ano },
        { onConflict: 'family_id,perfil,mes,ano' })
      .select().single();
    if (err) throw err;
    return NextResponse.json({ success: true, data });
  } catch { return NextResponse.json({ success: false, error: 'Erro ao salvar reserva' }, { status: 500 }); }
}
