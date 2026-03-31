'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Lock, ArrowLeft, Shield, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const Logo = () => (
  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-lg"
    style={{ background: '#5330ff', border: '2px solid #82a1fd', boxShadow: '2px 2px 0px 0px #82a1fd' }}>
    F
  </div>
);

const PLANOS: Record<string, any> = {
  individual: {
    nome: 'Individual', preco_mensal: 24, preco_anual: 20, cor: '#01b695',
    features: ['1 usuário', 'Dashboard completo', 'Metas pessoais', 'Histórico 12 meses', 'PWA nativo'],
  },
  casal: {
    nome: 'Casal', preco_mensal: 34, preco_anual: 28, cor: '#5330ff',
    features: ['2 usuários', 'Divisão proporcional ao salário', 'Dashboard individual + geral', 'Metas conjuntas', 'Orçamento semanal', 'Telegram'],
  },
  familia: {
    nome: 'Família', preco_mensal: 44, preco_anual: 36, cor: '#ffa857',
    features: ['Até 4 usuários', 'Tudo do plano Casal', 'Perfis independentes', 'Visão consolidada', '+R$7/mês por extra'],
  },
};

function PlanoForm() {
  const params = useSearchParams();
  const planoId = params.get('id') || 'casal';
  const cicloInicial = (params.get('ciclo') as 'mensal' | 'anual') || 'mensal';
  const plano = PLANOS[planoId] || PLANOS.casal;

  const [ciclo, setCiclo]         = useState<'mensal' | 'anual'>(cicloInicial);
  const [loading, setLoading]     = useState(false);
  const [autenticado, setAutenticado] = useState<boolean | null>(null);

  const preco = ciclo === 'anual' ? plano.preco_anual : plano.preco_mensal;
  const economia = (plano.preco_mensal - plano.preco_anual) * 12;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAutenticado(!!session);
    });
  }, []);

  async function handleAssinar() {
    if (!autenticado) {
      window.location.href = `/login?redirect=/plano?id=${planoId}&ciclo=${ciclo}`;
      return;
    }
    setLoading(true);
    try {
      // TODO: Stripe Checkout
      // const res = await fetch('/api/stripe/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ plano: planoId, ciclo }),
      // });
      // const { url } = await res.json();
      // window.location.href = url;
      await new Promise(r => setTimeout(r, 1200));
      window.location.href = '/dashboard';
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#5330ff]/8 rounded-full blur-[120px] -z-10" />

      <div className="max-w-5xl mx-auto">
        <Link href="/cadastro" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-8 transition-colors text-sm">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <div className="flex items-center gap-3 mb-10">
          <Logo />
          <div>
            <h1 className="text-2xl font-black text-foreground">Assinar plano {plano.nome}</h1>
            <p className="text-sm text-muted-foreground">14 dias grátis · Cancele quando quiser</p>
          </div>
        </div>

        {/* Aviso se não autenticado */}
        {autenticado === false && (
          <div className="nb-card bg-[#fff245] border-foreground mb-6 p-4 flex items-center gap-3"
            style={{ boxShadow: '4px 4px 0 var(--foreground)' }}>
            <LogIn size={20} className="text-foreground flex-shrink-0" />
            <div>
              <p className="font-black text-sm text-foreground">Você precisa estar logado para assinar</p>
              <p className="text-xs text-foreground/70">Clique em "Começar 14 dias grátis" para ser redirecionada.</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Resumo */}
          <div className="nb-card bg-card p-8">
            <h2 className="text-xl font-black text-foreground mb-6">Resumo do pedido</h2>

            <div className="flex gap-3 mb-8">
              {(['mensal', 'anual'] as const).map(c => (
                <button key={c} onClick={() => setCiclo(c)}
                  className="flex-1 py-3 rounded-xl border-2 font-black text-sm uppercase tracking-wide transition-all cursor-pointer"
                  style={{
                    borderColor: ciclo === c ? plano.cor : 'var(--border)',
                    background: ciclo === c ? `${plano.cor}15` : 'transparent',
                    color: ciclo === c ? plano.cor : 'var(--muted-foreground)',
                    boxShadow: ciclo === c ? `3px 3px 0 ${plano.cor}40` : 'none',
                    transform: ciclo === c ? 'translate(-1px,-1px)' : 'none',
                  }}>
                  {c === 'mensal' ? 'Mensal' : 'Anual −20%'}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl border-2 mb-6"
              style={{ borderColor: plano.cor, background: `${plano.cor}08` }}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-black text-lg text-foreground">Finexa {plano.nome}</span>
                <div className="text-right">
                  <span className="font-black text-2xl text-foreground">R${preco}</span>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>
              </div>
              {ciclo === 'anual' && (
                <span className="text-xs font-black bg-[#01b695] text-white px-2 py-0.5 rounded-full">
                  VOCÊ ECONOMIZA R${economia}/ANO
                </span>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {plano.features.map((f: string) => (
                <li key={f} className="flex items-center gap-3 text-sm font-medium text-foreground">
                  <Check size={16} className="flex-shrink-0" style={{ color: plano.cor }} />{f}
                </li>
              ))}
            </ul>

            <div className="p-4 bg-[#fff245] border-2 border-foreground rounded-xl">
              <p className="font-black text-sm text-foreground">✦ 14 dias completamente grátis</p>
              <p className="text-xs text-foreground/70 mt-1">
                Não cobramos nada hoje. O plano começa após o trial.
              </p>
            </div>
          </div>

          {/* Pagamento */}
          <div className="nb-card bg-card p-8">
            <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-2">
              <Lock size={18} className="text-[#5330ff]" /> Dados de pagamento
            </h2>

            <div className="p-6 bg-secondary border-2 border-dashed border-border rounded-xl mb-6 text-center">
              <Lock size={28} className="mx-auto mb-3 text-muted-foreground" />
              <p className="font-bold text-muted-foreground text-sm">Pagamento processado pelo Stripe</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Ambiente seguro com SSL e criptografia</p>
            </div>

            <div className="flex flex-col gap-4 mb-6 opacity-50 pointer-events-none">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Número do cartão</label>
                <input type="text" placeholder="1234 5678 9012 3456" disabled
                  className="w-full bg-secondary border-2 border-border rounded-xl px-4 py-3.5 text-muted-foreground font-medium cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Validade</label>
                  <input type="text" placeholder="MM/AA" disabled
                    className="w-full bg-secondary border-2 border-border rounded-xl px-4 py-3.5 text-muted-foreground font-medium cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">CVV</label>
                  <input type="text" placeholder="123" disabled
                    className="w-full bg-secondary border-2 border-border rounded-xl px-4 py-3.5 text-muted-foreground font-medium cursor-not-allowed" />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center mb-4">
              Integração Stripe em desenvolvimento. O acesso é liberado após o cadastro.
            </p>

            <button onClick={handleAssinar} disabled={loading || autenticado === null}
              className="nb-btn bg-[#5330ff] text-white py-4 font-black text-base w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
              {loading ? 'Processando...' : autenticado === false
                ? <><LogIn size={18} /> Entrar para assinar</>
                : <><Shield size={18} /> Começar 14 dias grátis</>
              }
            </button>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground/40 flex-wrap">
              <span className="flex items-center gap-1"><Lock size={11} /> SSL</span>
              <span>·</span><span>Stripe Payments</span>
              <span>·</span><span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlanoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PlanoForm />
    </Suspense>
  );
}
