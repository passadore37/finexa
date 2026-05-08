'use client';

import Link from 'next/link';
import { Navbar, Footer } from '@/components/landing-layout';
import {
  BarChart3, Target, Wallet, Users, Shield, Zap,
  TrendingUp, PieChart, CalendarCheck, ChevronDown, Check, Star
} from 'lucide-react';

// ─── Seção Hero ───────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-[92vh] flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 relative overflow-hidden">
      {/* Fundo decorativo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#5330ff]/8 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-[#ff64ca]/6 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-[#01b695]/6 blur-3xl" />
      </div>

      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#5330ff]/30 bg-[#5330ff]/10 text-[#5330ff] text-xs font-black uppercase tracking-widest mb-6">
        <Zap className="h-3 w-3" />
        Beta aberto — 14 dias grátis
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-tight max-w-3xl mb-6">
        Seu dinheiro,{' '}
        <span style={{ color: '#5330ff' }}>com clareza.</span>
      </h1>

      <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
        O controle financeiro feito para casais e famílias. Veja para onde vai cada real,
        divida as contas com justiça e alcance suas metas juntos.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/cadastro">
          <button
            className="nb-btn px-8 py-4 text-base font-black text-white"
            style={{ background: '#5330ff', borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}
          >
            Começar grátis →
          </button>
        </Link>
        <a href="#como-funciona">
          <button className="nb-btn px-8 py-4 text-base font-black bg-card text-foreground">
            Ver como funciona
          </button>
        </a>
      </div>

      <p className="text-xs text-muted-foreground mt-5">
        Sem cartão de crédito · 14 dias grátis · Cancele quando quiser
      </p>

      {/* Preview do dashboard */}
      <div className="mt-16 w-full max-w-3xl mx-auto rounded-2xl border-2 border-border bg-card overflow-hidden shadow-2xl"
        style={{ boxShadow: '8px 8px 0 #5330ff20' }}>
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-secondary/30">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-muted-foreground font-medium">finexa.app/dashboard</span>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Saldo do mês', valor: 'R$ 4.820', cor: '#01b695', icon: TrendingUp },
            { label: 'Gastos totais', valor: 'R$ 9.380', cor: '#5330ff', icon: BarChart3 },
            { label: 'Meta atingida', valor: '68%', cor: '#ffa857', icon: Target },
          ].map(({ label, valor, cor, icon: Icon }) => (
            <div key={label} className="p-4 rounded-xl border-2 border-border bg-background">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4" style={{ color: cor }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
              </div>
              <p className="text-xl font-black text-foreground">{valor}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Como funciona ────────────────────────────────────────────────────────────
function ComoFunciona() {
  const passos = [
    {
      num: '01',
      titulo: 'Cadastre-se em 1 minuto',
      desc: 'Crie sua conta, escolha seu plano e convide seu parceiro(a). Sem burocracia.',
      cor: '#5330ff',
    },
    {
      num: '02',
      titulo: 'Lance seus gastos',
      desc: 'Registre transações rapidamente. O Finexa classifica e divide tudo automaticamente.',
      cor: '#ff64ca',
    },
    {
      num: '03',
      titulo: 'Acompanhe em tempo real',
      desc: 'Veja seu saldo disponível, evolução mensal e alertas quando estiver perto do limite.',
      cor: '#01b695',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-[#5330ff] mb-3">Como funciona</p>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">
            Simples do começo ao fim
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {passos.map(({ num, titulo, desc, cor }) => (
            <div key={num} className="nb-card bg-card p-7 relative">
              <span className="text-5xl font-black opacity-10 absolute top-4 right-5" style={{ color: cor }}>
                {num}
              </span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm mb-4"
                style={{ background: cor, boxShadow: `3px 3px 0 ${cor}40` }}>
                {num}
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">{titulo}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Diferenciais ─────────────────────────────────────────────────────────────
function Diferenciais() {
  const items = [
    { icon: PieChart,      cor: '#5330ff', titulo: 'Divisão proporcional',   desc: 'Divide as despesas proporcionalmente ao salário de cada um. Justo para todos.' },
    { icon: Target,        cor: '#ff64ca', titulo: 'Metas de poupança',       desc: 'Defina objetivos financeiros e acompanhe o progresso mês a mês.' },
    { icon: CalendarCheck, cor: '#01b695', titulo: 'Orçamento semanal',       desc: 'Saiba exatamente quanto pode gastar em cada semana do mês.' },
    { icon: BarChart3,     cor: '#ffa857', titulo: 'Evolução histórica',      desc: 'Gráficos de evolução mensal para entender seus padrões de gasto.' },
    { icon: Shield,        cor: '#5330ff', titulo: 'Privacidade por membro',  desc: 'Controle quem vê o quê. Cada membro vê apenas o que você autorizar.' },
    { icon: Users,         cor: '#ff64ca', titulo: 'Até 4 membros',           desc: 'Individual, casal ou família inteira. Um plano para cada momento de vida.' },
  ];

  return (
    <section id="diferenciais" className="py-20 px-4 bg-secondary/20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-[#5330ff] mb-3">Diferenciais</p>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">
            Feito para a vida real
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Não é só planilha. É um sistema que entende como casais e famílias realmente gastam.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, cor, titulo, desc }) => (
            <div key={titulo} className="bg-card border-2 border-border rounded-2xl p-6 hover:border-[#5330ff]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${cor}15`, border: `2px solid ${cor}30` }}>
                <Icon className="h-5 w-5" style={{ color: cor }} />
              </div>
              <h3 className="text-sm font-black text-foreground mb-1.5">{titulo}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Planos ───────────────────────────────────────────────────────────────────
function Planos() {
  const planos = [
    {
      id: 'individual', nome: 'Individual', preco: 19, cor: '#01b695', destaque: false,
      features: ['Dashboard pessoal completo', 'Metas de poupança', 'Orçamento semanal', 'Relatórios mensais'],
    },
    {
      id: 'casal', nome: 'Casal', preco: 29, cor: '#5330ff', destaque: true,
      features: ['Tudo do Individual', 'Divisão proporcional ao salário', 'Dashboard consolidado do casal', 'Convite para 1 parceiro(a)'],
    },
    {
      id: 'familia', nome: 'Família', preco: 39, cor: '#ffa857', destaque: false,
      features: ['Tudo do Casal', 'Até 4 membros inclusos', 'Controle de privacidade', 'R$7 por membro extra'],
    },
  ];

  return (
    <section id="planos" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-[#5330ff] mb-3">Planos</p>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">
            Comece grátis por 14 dias
          </h2>
          <p className="text-muted-foreground mt-3">Sem cartão de crédito. Cancele quando quiser.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {planos.map(({ id, nome, preco, cor, destaque, features }) => (
            <div key={id}
              className="rounded-2xl border-2 bg-card p-7 relative transition-transform hover:-translate-y-1"
              style={{
                borderColor: destaque ? cor : 'var(--border)',
                boxShadow: destaque ? `6px 6px 0 ${cor}30` : undefined,
              }}>
              {destaque && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest"
                  style={{ background: cor }}>
                  Mais popular
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${cor}20` }}>
                  <Star className="h-4 w-4" style={{ color: cor }} />
                </div>
                <h3 className="text-lg font-black text-foreground">{nome}</h3>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black text-foreground">R${preco}</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: cor }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={`/cadastro?plano=${id}`}>
                <button className="w-full py-3 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-90"
                  style={{ background: cor }}>
                  Começar grátis →
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const perguntas = [
    {
      q: 'Precisa de cartão de crédito para testar?',
      a: 'Não. Os 14 dias de trial são completamente gratuitos, sem necessidade de dados de pagamento.',
    },
    {
      q: 'Como funciona a divisão proporcional?',
      a: 'O Finexa calcula automaticamente a porcentagem de cada pessoa com base nos salários cadastrados. Quem ganha mais contribui proporcionalmente mais.',
    },
    {
      q: 'Meu parceiro(a) precisa ter uma conta?',
      a: 'Sim, nos planos Casal e Família você convida as pessoas por e-mail. Cada membro tem seu próprio login e visualização.',
    },
    {
      q: 'Os dados são seguros?',
      a: 'Sim. Utilizamos Supabase com criptografia em repouso e em trânsito, autenticação segura e políticas de acesso por família (RLS).',
    },
    {
      q: 'Posso cancelar a qualquer momento?',
      a: 'Sim. Sem fidelidade, sem multa. Se cancelar, sua conta fica ativa até o fim do período pago.',
    },
  ];

  return (
    <section id="faq" className="py-20 px-4 bg-secondary/20">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-black uppercase tracking-widest text-[#5330ff] mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">Dúvidas frequentes</h2>
        </div>
        <div className="space-y-3">
          {perguntas.map(({ q, a }) => (
            <details key={q} className="group nb-card bg-card p-5 cursor-pointer">
              <summary className="flex items-center justify-between font-black text-sm text-foreground list-none">
                {q}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180 flex-shrink-0 ml-3" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="nb-card bg-card p-12"
          style={{ boxShadow: '6px 6px 0 #5330ff30' }}>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
            Comece hoje, gratuitamente.
          </h2>
          <p className="text-muted-foreground mb-8">
            14 dias para experimentar tudo. Sem cartão, sem compromisso.
          </p>
          <Link href="/cadastro">
            <button
              className="nb-btn px-10 py-4 text-base font-black text-white"
              style={{ background: '#5330ff', borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}
            >
              Criar conta grátis →
            </button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Já tem conta?{' '}
            <Link href="/login" className="font-bold text-[#5330ff] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Page principal ───────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ComoFunciona />
        <Diferenciais />
        <Planos />
        <FAQ />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}