'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertTriangle, Sparkles } from 'lucide-react';

export default function BetaPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus]   = useState<'carregando' | 'valido' | 'invalido'>('carregando');
  const [nome, setNome]       = useState('');

  useEffect(() => {
    fetch(`/api/beta?token=${token}`).then(r => r.json()).then(data => {
      if (data.ok) { setNome(data.nome ?? ''); setStatus('valido'); }
      else setStatus('invalido');
    });
  }, [token]);

  if (status === 'carregando') return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (status === 'invalido') return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-[#EF9F27] mx-auto" />
        <h1 className="text-xl font-black text-foreground">Link inválido</h1>
        <p className="text-sm text-muted-foreground">Este link de acesso beta é inválido ou já foi utilizado.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#5330ff]/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#ff64ca]/10 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-3">
          <div className="w-20 h-20 rounded-2xl bg-[#5330ff] flex items-center justify-center font-black text-white text-4xl mx-auto"
            style={{ boxShadow: '6px 6px 0 #82a1fd60' }}>F</div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest"
            style={{ background: '#5330ff15', color: '#5330ff', border: '1px solid #5330ff30' }}>
            <Sparkles className="h-3 w-3" /> Acesso Beta Exclusivo
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-foreground">
            {nome ? `Olá, ${nome}! 👋` : 'Você foi convidada! 👋'}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Você tem acesso exclusivo ao beta do <strong className="text-foreground">Finexa</strong>.
          </p>
        </div>
        <div className="p-5 rounded-2xl border border-border bg-card text-left space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">O que você vai encontrar</p>
          {[
            { emoji: '📊', texto: 'Dashboard com visão individual e geral' },
            { emoji: '⚖️', texto: 'Divisão proporcional automática pelo salário' },
            { emoji: '🎯', texto: 'Metas de poupança com acompanhamento mensal' },
            { emoji: '📅', texto: 'Orçamento semanal para controle diário' },
            { emoji: '💬', texto: 'Canal direto para enviar feedback' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-foreground">
              <span className="text-lg flex-shrink-0">{item.emoji}</span>{item.texto}
            </div>
          ))}
        </div>
        <div className="p-4 rounded-2xl border border-[#5330ff]/20 bg-[#5330ff]/5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Preço especial beta</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-black text-foreground">R$15</span>
            <span className="text-muted-foreground">/mês</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">14 dias grátis para começar · Cancele quando quiser</p>
        </div>
        <a href={`/cadastro?beta=${token}`}
          className="block w-full py-4 rounded-xl font-black text-base text-white"
          style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
          Começar agora — 14 dias grátis →
        </a>
        <p className="text-xs text-muted-foreground">
          Já tem conta? <a href="/login" className="text-[#5330ff] font-bold hover:underline">Entrar</a>
        </p>
      </div>
    </div>
  );
}
