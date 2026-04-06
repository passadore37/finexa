'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { getPlano } from '@/lib/planos';

function PlanoForm() {
  const params   = useSearchParams();
  const planoId  = params.get('id') || 'casal';
  const expired  = params.get('expired') === 'true';
  const pendente = params.get('pendente') === 'true';
  const plano    = getPlano(planoId);

  const [loading, setLoading]         = useState(false);
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [erro, setErro]               = useState('');

  useEffect(() => {
    createClient().auth.getSession()
      .then(({ data: { session } }) => setAutenticado(!!session));
  }, []);

  async function handleAssinar() {
    if (!autenticado) {
      window.location.href = `/login?redirect=/plano?id=${planoId}`;
      return;
    }
    setLoading(true);
    setErro('');
    try {
      const res  = await fetch('/api/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano_id: planoId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErro(data.error ?? 'Erro ao criar pagamento. Tente novamente.');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] -z-10"
        style={{ background: `${plano.cor}15` }} />

      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors">
          <ArrowLeft size={16} /> Voltar
        </Link>

        {/* Banners de status */}
        {expired && (
          <div className="p-4 rounded-xl border border-[#EF9F27]/30 bg-[#EF9F27]/10 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#EF9F27] flex-shrink-0" />
            <p className="text-sm text-[#EF9F27] font-bold">Seu trial expirou. Assine para continuar usando o Finexa.</p>
          </div>
        )}
        {pendente && (
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
            <p className="text-sm text-primary font-bold">Pagamento em análise. Você receberá um email de confirmação.</p>
          </div>
        )}

        {/* Card do plano */}
        <div className="p-6 rounded-2xl border-2 border-border bg-card space-y-5"
          style={{ borderColor: `${plano.cor}30` }}>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Assinar agora</p>
            <h1 className="text-2xl font-black" style={{ color: plano.cor }}>Finexa {plano.nome}</h1>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black text-foreground">R${plano.preco}</span>
              <span className="text-base font-medium text-muted-foreground">/mês</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">14 dias grátis · Cancele quando quiser</p>
          </div>

          {/* Features */}
          <ul className="space-y-2 py-2 border-t border-border">
            {plano.features.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${plano.cor}20` }}>
                  <Check className="h-2.5 w-2.5" style={{ color: plano.cor }} />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {/* Métodos aceitos */}
          <div className="p-3 rounded-xl bg-secondary/50 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Formas de pagamento aceitas</p>
            <div className="flex items-center gap-3 flex-wrap">
              {['PIX', 'Visa', 'Mastercard', 'Elo', 'American Express'].map(m => (
                <span key={m} className="text-xs font-bold text-foreground bg-secondary px-2 py-1 rounded-lg border border-border">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Processado com segurança pelo MercadoPago</p>
          </div>

          {erro && (
            <div className="p-3 rounded-xl border border-red-400/30 bg-red-50 dark:bg-red-900/20">
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{erro}</p>
            </div>
          )}

          <button onClick={handleAssinar} disabled={loading || autenticado === null}
            className="w-full py-4 rounded-xl font-black text-base text-white transition-all
                       disabled:opacity-60 flex items-center justify-center gap-2 active:scale-95"
            style={{ background: plano.cor, boxShadow: `4px 4px 0 ${plano.cor}50` }}>
            {loading
              ? <><Loader2 className="h-5 w-5 animate-spin" />Redirecionando...</>
              : `Assinar Plano ${plano.nome} →`
            }
          </button>

          {!autenticado && autenticado !== null && (
            <p className="text-center text-xs text-muted-foreground">
              Você será redirecionada para criar sua conta antes do pagamento.
            </p>
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground">🔒 Pagamento 100% seguro via MercadoPago</p>
          <p className="text-xs text-muted-foreground">Sem fidelidade · Cancele com 1 clique</p>
        </div>

        {/* Trocar plano */}
        <div className="flex justify-center gap-4">
          {['individual', 'casal', 'familia'].filter(p => p !== planoId).map(p => (
            <Link key={p} href={`/plano?id=${p}`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors capitalize">
              Ver plano {p === 'familia' ? 'Família' : p.charAt(0).toUpperCase() + p.slice(1)}
            </Link>
          ))}
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
