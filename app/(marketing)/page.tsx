'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Users,
  Target,
  Zap,
  Shield,
  Smartphone,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  TrendingUp,
  PieChart,
  Calendar,
  Star,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────
// HERO
// ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="lp-hero relative overflow-hidden min-h-screen flex items-center">
      {/* Background gradient orbs */}
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />

      {/* Grid pattern overlay */}
      <div className="lp-grid-overlay" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pt-36">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left column */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Novo: Planejamento anual inteligente
            </div>

            <h1 className="lp-headline">
              Seu dinheiro,
              <br />
              <span className="lp-headline-accent">com clareza.</span>
            </h1>

            <p className="lp-subheadline">
              O app financeiro feito para casais e famílias que querem parar de brigar pelo dinheiro e começar a construir juntos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-10">
              <Link
                href="/cadastro"
                id="cta-hero-primary"
                className="lp-btn-primary"
              >
                Começar grátis
                <ArrowRight size={18} />
              </Link>
              <a
                href="#como-funciona"
                id="cta-hero-secondary"
                className="lp-btn-secondary"
              >
                Ver como funciona
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 justify-center lg:justify-start mt-10">
              <div className="flex -space-x-2">
                {['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#0a0a1a] flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: color }}
                  >
                    {['L', 'G', 'R', 'M'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/50 text-xs mt-0.5">Amado por famílias brasileiras</p>
              </div>
            </div>
          </div>

          {/* Right column — Dashboard mockup */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="lp-mockup-frame">
      {/* Window bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-amber-500/80" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <span className="ml-auto text-white/30 text-xs font-mono">finexa.app/dashboard</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Saldo cards row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Receita', value: 'R$ 12.400', color: 'from-indigo-600/40 to-violet-600/20', icon: TrendingUp },
            { label: 'Despesas', value: 'R$ 7.230', color: 'from-rose-600/30 to-pink-600/20', icon: BarChart3 },
            { label: 'Sobra', value: 'R$ 5.170', color: 'from-emerald-600/30 to-teal-600/20', icon: Target },
          ].map((card) => (
            <div key={card.label} className={`bg-gradient-to-br ${card.color} border border-white/10 rounded-xl p-3`}>
              <card.icon size={12} className="text-white/50 mb-1.5" />
              <p className="text-white font-bold text-sm leading-none">{card.value}</p>
              <p className="text-white/50 text-[10px] mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Chart placeholder */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 h-24 flex items-end gap-1">
          {[40, 65, 45, 80, 55, 70, 85, 60, 75, 90, 68, 82].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${h}%`,
                background: i === 11 ? '#6366f1' : `rgba(99,102,241,${0.2 + i * 0.05})`,
              }}
            />
          ))}
        </div>

        {/* Recent transactions */}
        <div className="space-y-1.5">
          {[
            { label: 'Supermercado Zona Sul', cat: 'Alimentação', value: '-R$ 487', color: 'bg-amber-500/20 text-amber-400' },
            { label: 'Salário Letícia', cat: 'Receita', value: '+R$ 6.200', color: 'bg-emerald-500/20 text-emerald-400' },
            { label: 'Nubank — Fatura', cat: 'Fixo', value: '-R$ 1.240', color: 'bg-rose-500/20 text-rose-400' },
          ].map((tx) => (
            <div key={tx.label} className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-2">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${tx.color}`}>{tx.cat}</span>
              <span className="text-white/70 text-xs flex-1 truncate">{tx.label}</span>
              <span className={`text-xs font-bold ${tx.value.startsWith('+') ? 'text-emerald-400' : 'text-white/80'}`}>{tx.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// PROBLEMA
// ────────────────────────────────────────────────────────────
function ProblemaSection() {
  const problemas = [
    {
      emoji: '😰',
      pergunta: '"Quanto gastamos esse mês?"',
      descricao: 'Ninguém sabe ao certo. O dinheiro some e as planilhas ficam pra trás.',
      cor: 'from-rose-500/20 to-pink-500/10',
      borda: 'border-rose-500/30',
    },
    {
      emoji: '🤔',
      pergunta: '"Quem pagou o quê?"',
      descricao: 'Controle manual, desentendimentos e a sensação de que uma pessoa faz mais que a outra.',
      cor: 'from-amber-500/20 to-orange-500/10',
      borda: 'border-amber-500/30',
    },
    {
      emoji: '😤',
      pergunta: '"Por que não sobra nada?"',
      descricao: 'Sem visibilidade, é impossível planejar. A meta fica no sonho e não sai do papel.',
      cor: 'from-violet-500/20 to-indigo-500/10',
      borda: 'border-violet-500/30',
    },
  ];

  return (
    <section className="lp-section bg-[#07070f]">
      <div className="lp-container">
        <div className="text-center mb-14">
          <p className="lp-eyebrow">O Problema</p>
          <h2 className="lp-section-title">
            Reconhece alguma dessas perguntas?
          </h2>
          <p className="lp-section-sub">
            A maioria dos casais e famílias convive com essa névoa financeira todo mês. Não é falta de esforço — é falta de ferramenta certa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problemas.map((p) => (
            <div
              key={p.pergunta}
              className={`bg-gradient-to-br ${p.cor} border ${p.borda} rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300`}
            >
              <div className="text-5xl mb-5">{p.emoji}</div>
              <h3 className="text-xl font-bold text-white mb-3 leading-tight">{p.pergunta}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{p.descricao}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <div className="inline-flex items-center gap-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl px-8 py-5">
            <span className="text-2xl">✨</span>
            <p className="text-white font-semibold">O Finexa resolve os 3 ao mesmo tempo.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// COMO FUNCIONA
// ────────────────────────────────────────────────────────────
function ComoFuncionaSection() {
  const passos = [
    {
      numero: '01',
      icone: Users,
      titulo: 'Crie sua conta familiar',
      descricao: 'Configure os perfis da família — cada pessoa tem seu próprio nome e controle. Leva menos de 2 minutos.',
      cor: 'text-indigo-400',
      bgIcone: 'bg-indigo-500/10 border-indigo-500/30',
    },
    {
      numero: '02',
      icone: Zap,
      titulo: 'Lance suas receitas e despesas',
      descricao: 'Interface rápida e intuitiva. Categorize automaticamente e saiba para onde vai cada centavo.',
      cor: 'text-violet-400',
      bgIcone: 'bg-violet-500/10 border-violet-500/30',
    },
    {
      numero: '03',
      icone: BarChart3,
      titulo: 'Visualize e planeje juntos',
      descricao: 'Dashboard com gráficos claros, planejamento de despesas fixas e metas reais com progresso visual.',
      cor: 'text-emerald-400',
      bgIcone: 'bg-emerald-500/10 border-emerald-500/30',
    },
  ];

  return (
    <section id="como-funciona" className="lp-section">
      <div className="lp-container">
        <div className="text-center mb-14">
          <p className="lp-eyebrow">Como funciona</p>
          <h2 className="lp-section-title">Simples de começar,<br />poderoso pra crescer</h2>
          <p className="lp-section-sub">
            Três passos e você já tem visibilidade total das finanças da sua família.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line desktop */}
          <div className="hidden md:block absolute top-12 left-[calc(16.66%+1px)] right-[calc(16.66%+1px)] h-px bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {passos.map((passo) => {
              const Icon = passo.icone;
              return (
                <div key={passo.numero} className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl border ${passo.bgIcone} flex items-center justify-center mb-5 relative`}>
                    <Icon size={24} className={passo.cor} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0a0a1a] border border-white/20 text-white/50 text-[10px] font-bold flex items-center justify-center">
                      {passo.numero.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{passo.titulo}</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-xs">{passo.descricao}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// DIFERENCIAIS
// ────────────────────────────────────────────────────────────
function DiferenciaisSection() {
  const features = [
    {
      icone: PieChart,
      titulo: 'Divisão proporcional',
      descricao: 'Cada pessoa contribui proporционально ao seu salário. Fim das brigas sobre quem paga mais.',
      tag: 'Exclusivo',
      cor: 'indigo',
    },
    {
      icone: Users,
      titulo: 'Perfis individuais',
      descricao: 'Separe gastos pessoais dos gastos compartilhados. Total privacidade onde quiser.',
      tag: null,
      cor: 'violet',
    },
    {
      icone: Target,
      titulo: 'Metas com progresso',
      descricao: 'Defina sonhos como viagens e compras e veja o progresso real mês a mês.',
      tag: null,
      cor: 'emerald',
    },
    {
      icone: Calendar,
      titulo: 'Planejamento de fixos',
      descricao: 'Cadastre despesas fixas uma vez. O app projeta o impacto delas no seu orçamento mensal.',
      tag: null,
      cor: 'amber',
    },
    {
      icone: Smartphone,
      titulo: 'PWA — instale no celular',
      descricao: 'Funciona como app nativo. Instale direto do navegador, offline-ready, sem precisar da loja.',
      tag: 'PWA',
      cor: 'cyan',
    },
    {
      icone: Zap,
      titulo: 'Lançamento rápido',
      descricao: 'Interface ultra-rápida para registrar um gasto em segundos. Sem formulários chatos.',
      tag: null,
      cor: 'rose',
    },
  ];

  const coreMap: Record<string, string> = {
    indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    violet: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    rose: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
  };

  const tagColorMap: Record<string, string> = {
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  };

  return (
    <section id="diferenciais" className="lp-section bg-[#07070f]">
      <div className="lp-container">
        <div className="text-center mb-14">
          <p className="lp-eyebrow">Recursos</p>
          <h2 className="lp-section-title">Tudo que sua família precisa<br />em um só lugar</h2>
          <p className="lp-section-sub">
            Sem integrações complicadas, sem dados bancários, sem complicação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icone;
            const iconCls = coreMap[f.cor] || coreMap.indigo;
            return (
              <div
                key={f.titulo}
                className="group bg-white/3 border border-white/8 rounded-2xl p-6 hover:bg-white/6 hover:border-white/15 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${iconCls}`}>
                    <Icon size={20} />
                  </div>
                  {f.tag && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tagColorMap[f.cor] || tagColorMap.indigo}`}>
                      {f.tag}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.titulo}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.descricao}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// PLANOS
// ────────────────────────────────────────────────────────────
function PlanosSection() {
  const [anual, setAnual] = useState(false);

  const planos = [
    {
      nome: 'Individual',
      preco: { mensal: 19, anual: 15 },
      descricao: 'Para quem quer controle total das próprias finanças.',
      features: ['1 perfil', 'Gastos ilimitados', 'Dashboard completo', 'Metas financeiras', 'Suporte por email'],
      destaque: false,
      cta: 'Começar grátis',
    },
    {
      nome: 'Casal',
      preco: { mensal: 29, anual: 23 },
      descricao: 'O plano favorito. Feito para 2 pessoas construírem juntas.',
      features: ['2 perfis', 'Gastos ilimitados', 'Divisão proporcional', 'Dashboard compartilhado', 'Metas em conjunto', 'Planejamento de fixos', 'Suporte prioritário'],
      destaque: true,
      cta: 'Começar grátis',
    },
    {
      nome: 'Família',
      preco: { mensal: 39, anual: 31 },
      descricao: 'Para famílias com filhos, agregados ou moradores.',
      features: ['Até 4 perfis', 'Tudo do Casal', 'Relatórios por membro', 'Histórico de 12 meses', 'Suporte VIP'],
      destaque: false,
      cta: 'Fale conosco',
    },
  ];

  return (
    <section id="planos" className="lp-section">
      <div className="lp-container">
        <div className="text-center mb-10">
          <p className="lp-eyebrow">Planos</p>
          <h2 className="lp-section-title">Sem surpresas,<br />sem letras miúdas</h2>
          <p className="lp-section-sub">Cancele quando quiser. 7 dias grátis para testar qualquer plano.</p>

          {/* Toggle mensal/anual */}
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-1 mt-8">
            <button
              id="toggle-mensal"
              onClick={() => setAnual(false)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${!anual ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-white/50 hover:text-white'}`}
            >
              Mensal
            </button>
            <button
              id="toggle-anual"
              onClick={() => setAnual(true)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${anual ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-white/50 hover:text-white'}`}
            >
              Anual
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                −20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {planos.map((plano) => (
            <div
              key={plano.nome}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plano.destaque
                  ? 'bg-indigo-600 border-2 border-indigo-400 shadow-2xl shadow-indigo-900/60 scale-[1.03]'
                  : 'bg-white/4 border border-white/10 hover:border-white/20 transition-colors'
              }`}
            >
              {plano.destaque && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-[#0a0a1a] text-xs font-black px-4 py-1 rounded-full">
                  ⭐ MAIS POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plano.destaque ? 'text-white' : 'text-white'}`}>{plano.nome}</h3>
                <p className={`text-sm ${plano.destaque ? 'text-indigo-200' : 'text-white/50'}`}>{plano.descricao}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-black ${plano.destaque ? 'text-white' : 'text-white'}`}>
                    R$ {anual ? plano.preco.anual : plano.preco.mensal}
                  </span>
                  <span className={`text-sm mb-1.5 ${plano.destaque ? 'text-indigo-200' : 'text-white/50'}`}>/mês</span>
                </div>
                {anual && (
                  <p className={`text-xs mt-1 ${plano.destaque ? 'text-indigo-200' : 'text-white/40'}`}>
                    Cobrado R$ {plano.preco.anual * 12}/ano
                  </p>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plano.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <CheckCircle2 size={16} className={plano.destaque ? 'text-indigo-200 flex-shrink-0' : 'text-indigo-400 flex-shrink-0'} />
                    <span className={plano.destaque ? 'text-white' : 'text-white/70'}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/cadastro"
                id={`cta-plano-${plano.nome.toLowerCase()}`}
                className={`w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all ${
                  plano.destaque
                    ? 'bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg'
                    : 'bg-indigo-600/80 text-white hover:bg-indigo-600 border border-indigo-500/50'
                }`}
              >
                {plano.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// FAQ
// ────────────────────────────────────────────────────────────
function FAQSection() {
  const [aberto, setAberto] = useState<number | null>(null);

  const faqs = [
    {
      q: 'O Finexa tem acesso à minha conta bancária?',
      a: 'Não! O Finexa é 100% manual e intencional. Você lança o que quiser, quando quiser. Nenhum dado bancário é solicitado e nenhuma integração com bancos é feita. Sua privacidade é total.',
    },
    {
      q: 'Posso usar sozinho ou precisa ser em casal?',
      a: 'O Finexa funciona perfeitamente para uso individual! O plano Individual é exatamente para isso. E quando você quiser compartilhar, é só convidar alguém.',
    },
    {
      q: 'Como funciona o período de teste gratuito?',
      a: '7 dias completamente grátis, sem precisar de cartão de crédito. Você explora todas as funcionalidades do plano escolhido e decide se quer continuar.',
    },
    {
      q: 'Os dados ficam salvos se eu cancelar?',
      a: 'Sim. Ao cancelar, você tem 30 dias para exportar todos os seus dados em formato CSV. Após esse período, os dados são removidos com segurança.',
    },
    {
      q: 'Posso instalar no celular como um app?',
      a: 'Sim! O Finexa é um PWA (Progressive Web App). Você pode instalá-lo direto do navegador do seu celular, sem precisar da App Store ou Google Play. Funciona até mesmo offline.',
    },
    {
      q: 'E se eu quiser mudar de plano?',
      a: 'A qualquer momento. O upgrade ou downgrade é imediato e você sempre paga proporcionalmente ao período restante.',
    },
  ];

  return (
    <section id="faq" className="lp-section bg-[#07070f]">
      <div className="lp-container max-w-3xl">
        <div className="text-center mb-14">
          <p className="lp-eyebrow">FAQ</p>
          <h2 className="lp-section-title">Perguntas frequentes</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
            >
              <button
                id={`faq-${i}`}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setAberto(aberto === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} className="text-indigo-400 flex-shrink-0" />
                  <span className="text-white font-semibold text-sm">{faq.q}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-white/40 flex-shrink-0 transition-transform duration-200 ${aberto === i ? 'rotate-180' : ''}`}
                />
              </button>
              {aberto === i && (
                <div className="px-6 pb-5">
                  <p className="text-white/60 text-sm leading-relaxed pl-7">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// CTA FINAL
// ────────────────────────────────────────────────────────────
function CTAFinalSection() {
  return (
    <section className="lp-section relative overflow-hidden">
      <div className="lp-orb lp-orb-cta-1" />
      <div className="lp-orb lp-orb-cta-2" />
      <div className="lp-container relative z-10 text-center max-w-3xl">
        <p className="lp-eyebrow">Pronto para começar?</p>
        <h2 className="lp-section-title text-4xl sm:text-5xl lg:text-6xl">
          Clareza financeira{' '}
          <span className="text-indigo-400">a partir de hoje</span>
        </h2>
        <p className="lp-section-sub text-lg">
          Junte-se às famílias que pararam de adivinhar e começaram a planejar.
          7 dias grátis, sem cartão de crédito.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/cadastro"
            id="cta-final"
            className="lp-btn-primary text-base px-8 py-4"
          >
            Criar conta gratuita
            <ArrowRight size={20} />
          </Link>
          <a
            href="#planos"
            className="lp-btn-secondary text-base px-8 py-4"
          >
            Ver planos
          </a>
        </div>
        <p className="text-white/30 text-sm mt-6">
          Não é necessário cartão de crédito • Cancele quando quiser • Dados seguros
        </p>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// RODAPÉ
// ────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06060e]">
      <div className="lp-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">F</span>
              </div>
              <span className="text-lg font-bold text-white">Finexa</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Controle financeiro inteligente para casais e famílias. Seu dinheiro, com clareza.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="text-white/70 text-xs font-bold uppercase tracking-wider mb-4">Produto</h4>
            <ul className="space-y-3">
              {['Recursos', 'Planos', 'FAQ', 'Changelog'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/40 text-sm hover:text-white/80 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white/70 text-xs font-bold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacidade', 'Termos de uso', 'Cookies'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-white/40 text-sm hover:text-white/80 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-8 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Finexa · Desenvolvido por Passadore
          </p>
          <p className="text-white/25 text-xs">
            Feito com ♥ no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────
// PAGE ROOT
// ────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="lp-root">
      <HeroSection />
      <ProblemaSection />
      <ComoFuncionaSection />
      <DiferenciaisSection />
      <PlanosSection />
      <FAQSection />
      <CTAFinalSection />
      <Footer />
    </div>
  );
}
