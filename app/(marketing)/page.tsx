'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Check,
  Users,
  TrendingUp,
  Zap,
  Smartphone,
  PieChart as LucidePieChart,
  Menu,
  X,
  ArrowRight,
  Target,
  CreditCard,
  Coins,
  Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ─────────────────────────────────────────────
// PRIMITIVOS DE DESIGN
// ─────────────────────────────────────────────

const Logo = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="w-10 h-10 bg-[#ff64ca] border-2 border-[#08080f] flex items-center justify-center">
      <span className="text-[#08080f] font-black text-2xl">F</span>
    </div>
    <div className="flex flex-col">
      <span className="font-black text-3xl tracking-tighter text-[#08080f] dark:text-white leading-[0.8]">
        FINEXA
      </span>
      <div className="h-1 w-full bg-[#5330ff] mt-1" />
    </div>
  </div>
);

const NeobrutalistCard = ({
  children,
  borderColor = 'border-[#08080f] dark:border-white',
  bgColor = 'bg-white dark:bg-[#08080f]',
  className = '',
}: {
  children: React.ReactNode;
  borderColor?: string;
  bgColor?: string;
  className?: string;
}) => (
  <div
    className={`border-2 shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(8,8,15,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 ${borderColor} ${bgColor} ${className}`}
  >
    {children}
  </div>
);

const NeobrutalistButton = ({
  children,
  bgColor = 'bg-[#5330ff]',
  textColor = 'text-white',
  className = '',
  onClick,
  href,
}: {
  children: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  className?: string;
  onClick?: () => void;
  href?: string;
}) => {
  const cls = `border-2 border-[#08080f] dark:border-white shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(8,8,15,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 ${bgColor} ${textColor} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button onClick={onClick} className={cls}>{children}</button>;
};

const AccordionItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b-2 border-[#08080f] dark:border-white/20 py-4">
      <button
        className="w-full flex justify-between items-center text-left font-bold text-lg md:text-xl py-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <ChevronDown
          className={`transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <p className="py-4 text-[#08080f]/70 dark:text-white/70 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
          {answer}
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MOCKUP DO CELULAR
// ─────────────────────────────────────────────

const MockupApp = () => {
  const barData = [
    { name: 'S', value: 40 },
    { name: 'T', value: 70 },
    { name: 'Q', value: 55 },
    { name: 'Q', value: 90 },
    { name: 'S', value: 30 },
  ];
  const pieData = [
    { name: 'Aluguel', value: 400, color: '#5330ff' },
    { name: 'Lazer', value: 300, color: '#ff64ca' },
    { name: 'Mercado', value: 300, color: '#01b695' },
  ];

  return (
    <div className="relative w-full max-w-[280px] aspect-[9/19] bg-[#08080f] border-4 border-[#08080f] rounded-[3rem] shadow-2xl overflow-hidden mx-auto">
      <div className="absolute inset-0 bg-white dark:bg-[#08080f] p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-center mt-6">
          <div className="w-8 h-8 rounded-full bg-[#5330ff]/20 border border-[#5330ff]" />
          <div className="h-4 w-20 bg-[#08080f]/10 dark:bg-white/10 rounded-full" />
          <div className="w-8 h-8 rounded-full bg-[#01b695]/20 border border-[#01b695]" />
        </div>

        {/* Balance Card */}
        <div className="bg-[#5330ff] p-4 rounded-2xl text-white shadow-[4px_4px_0px_0px_rgba(8,8,15,1)]">
          <p className="text-[10px] opacity-80">Saldo Total</p>
          <p className="text-xl font-bold">R$ 4.250,00</p>
        </div>

        {/* Charts */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#08080f]/5 dark:bg-white/5 p-3 rounded-xl border border-[#08080f]/10 dark:border-white/10">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold uppercase opacity-50">Gastos Semanais</p>
              <div className="w-2 h-2 bg-[#01b695] rounded-full" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} stroke="#08080f" strokeWidth={1}>
                    {barData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#5330ff', '#ff64ca', '#01b695', '#ffa857', '#fff245'][index % 5]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#08080f]/5 dark:bg-white/5 p-2 rounded-xl border border-[#08080f]/10 dark:border-white/10 flex flex-col items-center justify-center">
              <p className="text-[8px] font-bold uppercase opacity-40 mb-1">Categorias</p>
              <div className="h-14 w-14">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={12} outerRadius={25} paddingAngle={5} dataKey="value" stroke="#08080f" strokeWidth={1}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="bg-[#ffa857]/10 border border-[#ffa857] p-2 rounded-xl">
                <p className="text-[8px] text-[#ffa857] font-bold uppercase">Gastos</p>
                <p className="text-xs font-bold">R$ 1.200</p>
              </div>
              <div className="bg-[#01b695]/10 border border-[#01b695] p-2 rounded-xl">
                <p className="text-[8px] text-[#01b695] font-bold uppercase">Economia</p>
                <p className="text-xs font-bold">R$ 800</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction row */}
        <div className="flex items-center justify-between p-2 bg-[#08080f]/5 dark:bg-white/5 rounded-lg border border-[#08080f]/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#ff64ca] rounded-md border border-[#08080f] flex items-center justify-center">
              <LucidePieChart size={12} className="text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2 w-16 bg-[#08080f]/20 dark:bg-white/20 rounded-full" />
              <div className="h-1.5 w-10 bg-[#08080f]/10 dark:bg-white/10 rounded-full" />
            </div>
          </div>
          <div className="text-[10px] font-bold">-R$ 45,00</div>
        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-4 left-4 right-4 h-12 bg-[#08080f] rounded-2xl flex justify-around items-center">
          <div className="w-6 h-6 bg-white/20 rounded-full" />
          <div className="w-8 h-8 bg-[#5330ff] rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
            <span className="text-white text-lg">+</span>
          </div>
          <div className="w-6 h-6 bg-white/20 rounded-full" />
        </div>
      </div>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#08080f] rounded-b-2xl z-10" />
    </div>
  );
};

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('finexa-dark-mode');
      if (saved !== null) setIsDarkMode(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try { localStorage.setItem('finexa-dark-mode', JSON.stringify(isDarkMode)); } catch {}
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((v) => !v);

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-[#ff64ca] selection:text-white bg-white dark:bg-[#08080f] text-[#08080f] dark:text-white lp-noise">

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#08080f]/80 backdrop-blur-md border-b-2 border-[#08080f] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-8">
            <a href="#comece-agora" className="font-medium hover:text-[#5330ff] transition-colors">Onde você está?</a>
            <a href="#como-funciona" className="font-medium hover:text-[#5330ff] transition-colors">Como Funciona</a>
            <a href="#diferenciais" className="font-medium hover:text-[#5330ff] transition-colors">Diferenciais</a>
            <a href="#planos" className="font-medium hover:text-[#5330ff] transition-colors">Planos</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-4 py-2 border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0px_0px_rgba(8,8,15,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer font-bold"
            >
              {isDarkMode ? '🌙 Dark' : '☀️ Light'}
            </button>
            <Link
              href="/login"
              className="font-bold px-6 py-2 border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:bg-[#ff64ca] hover:text-[#08080f] hover:border-[#ff64ca] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(8,8,15,1),0_0_20px_#ff64ca] transition-all"
            >
              Entrar
            </Link>
            <NeobrutalistButton href="/cadastro" className="text-sm">Começar grátis</NeobrutalistButton>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 flex items-center justify-center border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer text-xl"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-[#08080f] border-b-2 border-[#08080f] dark:border-white/10 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col p-4 gap-4">
              {['#comece-agora', '#como-funciona', '#diferenciais', '#planos'].map((href, i) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2 font-bold border-b border-[#08080f]/10 dark:border-white/10"
                >
                  {['Onde você está?', 'Como Funciona', 'Diferenciais', 'Planos'][i]}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/login" className="border-2 border-[#08080f] dark:border-white shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-[#08080f] text-[#08080f] dark:text-white py-3 font-bold flex items-center justify-center hover:bg-[#ff64ca] hover:text-[#08080f] hover:border-[#ff64ca] transition-colors">
                  Entrar
                </Link>
                <Link href="/cadastro" className="border-2 border-[#08080f] dark:border-white shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-[#5330ff] text-white py-3 font-bold flex items-center justify-center">
                  Começar grátis
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* Blur blobs */}
        <div className="absolute -top-10 -left-20 w-96 h-96 bg-[#ff64ca]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -right-20 w-80 h-80 bg-[#5330ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="lp-fade-in z-10">
            <div className="inline-block px-4 py-1 bg-[#01b695] text-[#08080f] font-bold text-sm mb-6 border-2 border-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)]">
              #1 EM CONTROLE FINANCEIRO
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
              Seu dinheiro,{' '}
              <br />
              <span className="text-[#5330ff]">com clareza.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#08080f]/70 dark:text-white/70 mb-10 max-w-xl leading-snug">
              O controle financeiro que traz clareza para sua vida. Organize seus gastos, defina metas e planeje seu futuro com facilidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <NeobrutalistButton href="/cadastro" className="text-xl px-10 py-5">
                Começar grátis
              </NeobrutalistButton>
              <a href="#como-funciona" className="flex items-center justify-center gap-2 font-bold text-lg px-8 py-4 hover:underline cursor-pointer">
                Ver como funciona <ArrowRight size={20} />
              </a>
            </div>
          </div>

          {/* Right — Mockup + floating cards */}
          <div className="relative lp-fade-in-delay">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#ff64ca]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-[#5330ff]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <MockupApp />

              {/* Floating card top-right */}
              <div className="absolute top-20 -right-4 md:-right-20 lp-float-up">
                <NeobrutalistCard bgColor="bg-[#fff245]" borderColor="border-[#08080f]" className="p-4 shadow-xl !border-[#08080f]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#08080f] rounded-full text-white">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-60">Economia</p>
                      <p className="font-black text-lg">+R$ 850</p>
                    </div>
                  </div>
                </NeobrutalistCard>
              </div>

              {/* Floating card bottom-left */}
              <div className="absolute bottom-20 -left-4 md:-left-20 lp-float-down">
                <NeobrutalistCard bgColor="bg-[#01b695]" borderColor="border-[#08080f]" className="p-4 shadow-xl !border-[#08080f]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#08080f] rounded-full text-white">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-60 text-[#08080f]">Meta Viagem</p>
                      <p className="font-black text-lg text-[#08080f]">75% Concluído</p>
                    </div>
                  </div>
                </NeobrutalistCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ONDE VOCÊ ESTÁ ── */}
      <section id="comece-agora" className="py-24 bg-[#08080f] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
              O caos financeiro <br className="hidden md:block" /> acaba aqui.
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Gerenciar dinheiro não deveria ser uma fonte de estresse.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Quanto gastei esse mês?', color: 'border-[#ff64ca]', icon: <LucidePieChart className="text-[#ff64ca]" /> },
              { title: 'Para onde vai meu dinheiro?', color: 'border-[#ffa857]', icon: <Users className="text-[#ffa857]" /> },
              { title: 'Como economizar mais?', color: 'border-[#fff245]', icon: <TrendingUp className="text-[#fff245]" /> },
            ].map((item, i) => (
              <div key={i} className="lp-fade-in-scroll">
                <div className={`border-2 ${item.color} bg-[#08080f] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] transition-all duration-300 h-full flex flex-col items-center text-center p-10`}>
                  <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-white/50">
                    Pare de brigar por planilhas complexas. Tenha visibilidade total em tempo real.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
              Simples como deve ser.
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Lance seus gastos', desc: 'Interface otimizada para registrar receitas e despesas em segundos. Sem complicação.', icon: <Smartphone /> },
              { step: '02', title: 'Defina seu orçamento', desc: 'Crie categorias personalizadas e estabeleça limites de gastos inteligentes por pessoa.', icon: <Users /> },
              { step: '03', title: 'Acompanhe a evolução', desc: 'Veja gráficos claros e tenha visibilidade total de para onde vai cada centavo.', icon: <TrendingUp /> },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center lp-fade-in-scroll">
                <div className="w-20 h-20 bg-[#5330ff] text-white border-4 border-[#08080f] dark:border-white rounded-full flex items-center justify-center text-3xl font-black mb-8 shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-[#08080f]/60 dark:text-white/60 max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS ── */}
      <section id="diferenciais" className="py-24 bg-[#08080f]/5 dark:bg-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
              Feito para a vida real.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Visualização de Gastos', desc: 'Gráficos intuitivos que mostram exatamente para onde seu dinheiro está indo.', color: 'bg-[#5330ff]', icon: <TrendingUp size={40} className="text-white" /> },
              { title: 'Categorização Inteligente', desc: 'Seus gastos são organizados automaticamente por categorias.', color: 'bg-[#01b695]', icon: <Wallet size={40} className="text-[#08080f]" /> },
              { title: 'Metas de Economia', desc: 'Economize para seus sonhos com metas claras e acompanhamento em tempo real.', color: 'bg-[#ff64ca]', icon: <Coins size={40} className="text-white" /> },
              { title: 'Planejamento Mensal', desc: 'Receba um resumo do que está por vir e não seja pego de surpresa.', color: 'bg-[#ffa857]', icon: <CreditCard size={40} className="text-white" /> },
              { title: 'Lançamento Fácil', desc: 'Interface otimizada para registrar gastos em menos de 3 segundos.', color: 'bg-[#fff245]', icon: <Zap size={40} className="text-[#08080f]" /> },
              { title: 'PWA Nativo', desc: 'Instale no seu celular sem ocupar espaço e use mesmo offline.', color: 'bg-[#a5b4fc]', icon: <Smartphone size={40} className="text-[#08080f]" /> },
            ].map((item, i) => (
              <NeobrutalistCard key={i} className="h-full group overflow-hidden">
                <div className="flex items-center justify-center h-24 mb-6">
                  <div className={`w-20 h-20 ${item.color} border-4 border-[#08080f] dark:border-white rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]`}>
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#08080f]/60 dark:text-white/60">{item.desc}</p>
              </NeobrutalistCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
              Escolha seu plano.
            </h2>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-bold ${!isAnnual ? 'text-[#5330ff]' : 'opacity-50'}`}>Mensal</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-16 h-8 bg-[#08080f] dark:bg-white/20 rounded-full relative p-1 cursor-pointer transition-colors"
              >
                <div
                  className="w-6 h-6 bg-[#5330ff] rounded-full transition-transform duration-300"
                  style={{ transform: isAnnual ? 'translateX(32px)' : 'translateX(0)' }}
                />
              </button>
              <span className={`font-bold ${isAnnual ? 'text-[#5330ff]' : 'opacity-50'}`}>Anual</span>
              <div className="px-2 py-1 bg-[#fff245] text-[#08080f] text-[10px] font-black border-2 border-[#08080f] shadow-[1px_1px_0px_0px_rgba(8,8,15,1)]">
                -20% OFF
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Individual */}
            <NeobrutalistCard className="h-full flex flex-col p-8 hover:scale-[1.02]">
              <h3 className="text-3xl font-black mb-3 tracking-tight">Individual</h3>
              <p className="text-lg text-[#08080f]/70 dark:text-white/70 mb-8 leading-relaxed">
                Para quem busca autonomia e controle total da sua vida financeira.
              </p>
              <div className="mb-10">
                <span className="text-5xl font-black">R${isAnnual ? '20' : '24'}</span>
                <span className="text-xl font-bold opacity-60">/mês</span>
              </div>
              <ul className="space-y-5 mb-12 flex-grow">
                {['Controle individual', 'Metas pessoais', 'Relatórios mensais'].map((f) => (
                  <li key={f} className="flex items-center gap-3 font-semibold">
                    <Check size={20} className="text-[#01b695]" /> {f}
                  </li>
                ))}
              </ul>
              <NeobrutalistButton href="/cadastro" bgColor="bg-white dark:bg-[#08080f]" textColor="text-[#08080f] dark:text-white" className="w-full py-4">
                Assinar agora
              </NeobrutalistButton>
            </NeobrutalistCard>

            {/* Casal — destaque */}
            <div className="relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 bg-[#ff64ca] text-white px-6 py-1.5 font-black text-sm border-2 border-[#08080f] shadow-[3px_3px_0px_0px_rgba(8,8,15,1)] rounded-full whitespace-nowrap">
                MAIS POPULAR
              </div>
              <NeobrutalistCard
                borderColor="border-[#5330ff]"
                className="h-full flex flex-col p-8 scale-105 hover:scale-[1.07] ring-4 ring-[#5330ff]/10 hover:ring-[#5330ff]/30"
              >
                <h3 className="text-3xl font-black mb-3 tracking-tight">Casal</h3>
                <p className="text-lg text-[#08080f]/70 dark:text-white/70 mb-8 leading-relaxed">
                  A harmonia financeira que vocês precisam para planejar o futuro a dois.
                </p>
                <div className="mb-10">
                  <span className="text-5xl font-black">R${isAnnual ? '28' : '34'}</span>
                  <span className="text-xl font-bold opacity-60">/mês</span>
                </div>
                <ul className="space-y-5 mb-12 flex-grow">
                  {['Tudo do Individual', '2 Perfis conectados', 'Divisão proporcional', 'Metas conjuntas'].map((f) => (
                    <li key={f} className="flex items-center gap-3 font-bold">
                      <Check size={20} className="text-[#01b695]" /> {f}
                    </li>
                  ))}
                </ul>
                <NeobrutalistButton href="/cadastro" className="w-full py-4 text-lg">Começar agora</NeobrutalistButton>
              </NeobrutalistCard>
            </div>

            {/* Família */}
            <NeobrutalistCard className="h-full flex flex-col p-8 hover:scale-[1.02]">
              <h3 className="text-3xl font-black mb-3 tracking-tight">Família</h3>
              <p className="text-lg text-[#08080f]/70 dark:text-white/70 mb-8 leading-relaxed">
                Para toda a casa sob controle, com visibilidade para todos os membros.
              </p>
              <div className="mb-10">
                <span className="text-5xl font-black">R${isAnnual ? '36' : '44'}</span>
                <span className="text-xl font-bold opacity-60">/mês</span>
              </div>
              <ul className="space-y-5 mb-12 flex-grow">
                {['Tudo do Casal', 'Até 4 pessoas', '+R$7 por adicional', 'Controle parental'].map((f) => (
                  <li key={f} className="flex items-center gap-3 font-semibold">
                    <Check size={20} className="text-[#01b695]" /> {f}
                  </li>
                ))}
              </ul>
              <NeobrutalistButton href="/cadastro" bgColor="bg-white dark:bg-[#08080f]" textColor="text-[#08080f] dark:text-white" className="w-full py-4">
                Assinar agora
              </NeobrutalistButton>
            </NeobrutalistCard>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-4 bg-[#08080f]/5 dark:bg-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">Dúvidas?</h2>
          </div>
          <div className="space-y-2">
            <AccordionItem question="O app é seguro?" answer="Sim! Utilizamos criptografia de ponta a ponta e nunca armazenamos suas senhas bancárias. Temos o mesmo nível de segurança dos grandes bancos." />
            <AccordionItem question="Como funciona a divisão proporcional?" answer="Você insere a renda de cada um e o app calcula a porcentagem justa. Se um ganha R$6k e o outro R$4k, as contas são divididas em 60/40 automaticamente." />
            <AccordionItem question="Posso usar sem conectar o banco?" answer="Com certeza. Você pode optar pelo lançamento manual para ter controle total de cada centavo inserido." />
            <AccordionItem question="Preciso baixar na App Store?" answer="O Finexa é um PWA (Progressive Web App). Você o acessa pelo navegador e 'instala' na sua tela inicial, economizando espaço e garantindo atualizações instantâneas." />
            <AccordionItem question="Posso cancelar a qualquer momento?" answer="Sim, sem letras miúdas. Se cancelar no plano mensal, o acesso continua até o fim do período pago. No anual, você mantém o desconto e o acesso pelo ano todo." />
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#5330ff] text-white p-12 md:p-20 text-center border-2 border-[#08080f] dark:border-white shadow-[8px_8px_0px_0px_rgba(8,8,15,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 leading-tight">
              Pronto para ter paz <br /> financeira?
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
              Transforme sua relação com o dinheiro hoje mesmo usando o Finexa.
            </p>
            <NeobrutalistButton
              href="/cadastro"
              bgColor="bg-white dark:bg-[#08080f]"
              textColor="text-[#5330ff]"
              className="px-12 py-6 text-2xl font-black hover:bg-[#fff245] hover:text-[#08080f] hover:border-[#fff245] transition-colors"
            >
              Começar agora — É grátis
            </NeobrutalistButton>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-16 px-4 border-t-2 border-[#08080f] dark:border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div>
            <Logo className="mb-4" />
            <p className="text-[#08080f]/60 dark:text-white/60 font-medium">Controle financeiro com clareza.</p>
          </div>
          <div className="flex flex-col md:items-end gap-4">
            <p className="text-sm font-bold opacity-50">passadore</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
