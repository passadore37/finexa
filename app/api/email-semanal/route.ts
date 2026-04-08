// app/api/email-semanal/route.ts — cron toda segunda 08h
// Vercel Cron: "0 8 * * 1"
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarEmailSemanal } from '@/lib/mailer';

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret') ?? new URL(req.url).searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const admin = getAdmin();

  // Buscar todos os beta users ativos
  const { data: familias } = await admin.from('familias')
    .select('id, nome').eq('beta_user', true).eq('assinatura_status', 'trial');

  if (!familias?.length) return NextResponse.json({ ok: true, enviados: 0 });

  // Calcular semana passada
  const hoje     = new Date();
  const semanaStr = `${hoje.getDate().toString().padStart(2,'0')}/${(hoje.getMonth()+1).toString().padStart(2,'0')}`;
  const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - 7);

  let enviados = 0;
  const erros: string[] = [];

  for (const familia of familias) {
    try {
      // Buscar perfil principal
      const { data: perfil } = await admin.from('perfis')
        .select('email, nome').eq('family_id', familia.id).order('criado_em').limit(1).single();

      if (!perfil?.email) continue;

      // Buscar transações da semana passada
      const { data: transacoes } = await admin.from('transacoes')
        .select('data, valor, perfil')
        .eq('family_id', familia.id)
        .gte('data', inicioSemana.toISOString().split('T')[0])
        .lt('data', hoje.toISOString().split('T')[0]);

      // Calcular métricas
      const diasAtivos = new Set((transacoes || []).map((t: any) => t.data)).size;
      const totalGastos = (transacoes || []).reduce((acc: number, t: any) => acc + Number(t.valor), 0);
      const totalLancamentos = (transacoes || []).length;

      // Buscar aportes de metas da semana
      const { count: metasAtualizadas } = await admin.from('meta_aportes')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familia.id)
        .gte('criado_em', inicioSemana.toISOString());

      await enviarEmailSemanal(perfil.email, perfil.nome, {
        diasAtivos,
        totalGastos,
        totalLancamentos,
        metasAtualizadas: metasAtualizadas ?? 0,
        semana: semanaStr,
      });

      enviados++;
    } catch (e: any) {
      erros.push(`${familia.id}: ${e.message}`);
    }
  }

  return NextResponse.json({ ok: true, enviados, erros });
}

// Suporte a GET para Vercel Cron
export async function GET(req: Request) { return POST(req); }
