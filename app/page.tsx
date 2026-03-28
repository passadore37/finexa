'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight, Check, ShieldCheck, TrendingUp, TrendingDown,
  Wallet, Target, Zap, Smartphone, PieChart, Calendar,
  Users, CreditCard, Bell, Plus, ChevronDown, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Navbar, Footer } from '@/components/landing-layout';

// ─── Cores e dados ────────────────────────────────────────────────────────────

const C = {
  indigo: '#5330ff', blue: '#82a1fd', teal: '#01b695',
  magenta: '#ff64ca', orange: '#ffa857', yellow: '#fff245',
  dark: '#08080f',
};

const barData = [
  { mes: 'Out', r: 14, d: 9 },
  { mes: 'Nov', r: 14, d: 10 },
  { mes: 'Dez', r: 15, d: 12 },
  { mes: 'Jan', r: 15, d: 8 },
  { mes: 'Fev', r: 14, d: 9 },
  { mes: 'Mar', r: 15, d: 5 },
];

const pieData = [
  { name: 'Moradia', value: 47, color: C.indigo },
  { name: 'Alimentação', value: 18, color: C.magenta },
  { name: 'Transporte', value: 12, color: C.blue },
  { name: 'Lazer', value: 13, color: C.orange },
  { name: 'Outros', value: 10, color: C.teal },
];

const PLANOS = [
  {
    id: 'individual', nome: 'Individual', preco: 19,
    icon: <Users className="h-6 w-6" />,
    desc: 'Para quem quer controle total das próprias finanças',
    cor: C.teal, destaque: false,
    features: ['1 usuário', 'Dashboard completo', 'Metas pessoais', 'Histórico 12 meses', 'PWA nativo'],
  },
  {
    id: 'casal', nome: 'Casal', preco: 29,
    icon: <Users className="h-6 w-6" />,
    desc: 'O mais escolhido. Divisão justa, visão individual + geral',
    cor: C.indigo, destaque: true,
    features: ['2 usuários', 'Divisão proporcional ao salário', 'Dashboard individual + geral', 'Metas conjuntas', 'Orçamento semanal', 'Lançamento via Telegram'],
  },
  {
    id: 'familia', nome: 'Família', preco: 39,
    icon: <Users className="h-6 w-6" />,
    desc: 'Para famílias que querem clareza sem complicação',
    cor: C.orange, destaque: false,
    features: ['Até 4 usuários', 'Tudo do plano Casal', 'Perfis independentes', 'Visão consolidada', 'Relatório mensal', '+R$7/mês por extra'],
  },
];

const DIFERENCIAIS = [
  { icon: <TrendingUp className="h-5 w-5" />, titulo: 'Divisão proporcional', desc: 'Quem ganha mais, contribui mais. Calculado automaticamente pela proporção de renda de cada um.', cor: C.teal },
  { icon: <Users className="h-5 w-5" />, titulo: 'Perfis individuais', desc: 'Cada pessoa vê seus próprios gastos, envelope e metas — sem expor o que não precisa.', cor: C.blue },
  { icon: <Target className="h-5 w-5" />, titulo: 'Metas conjuntas', desc: 'Viagem, reserva, entrada do apê. Acompanhe o progresso junto, em tempo real.', cor: C.magenta },
  { icon: <Calendar className="h-5 w-5" />, titulo: 'Orçamento semanal', desc: 'O salário vira envelopes semanais. Você sabe exatamente quanto pode gastar essa semana.', cor: C.orange },
  { icon: <Zap className="h-5 w-5" />, titulo: 'Lançamento fácil', desc: 'App em 3 toques ou Telegram. Claude interpreta a mensagem e categoriza automaticamente.', cor: C.yellow },
  { icon: <Smartphone className="h-5 w-5" />, titulo: 'PWA nativo', desc: 'Instala na tela do celular sem App Store. Abre como app de verdade, offline-first.', cor: C.indigo },
];

const FAQ = [
  { q: 'O parceiro precisa instalar algo?', r: 'Não. O Finexa é um PWA — é só acessar o link pelo celular e adicionar na tela inicial. Funciona em iPhone e Android.' },
  { q: 'O que é divisão proporcional ao salário?', r: 'Se você ganha R$8.500 e seu parceiro R$6.500, o total é R$15.000. O aluguel de R$2.200 é dividido: você paga R$1.247 (57%) e seu parceiro R$953 (43%). Automático, sem discussão.' },
  { q: 'Funciona offline?', r: 'O dashboard fica disponível offline. Para lançar novos gastos, é necessária conexão. Os dados sincronizam assim que você volta online.' },
  { q: 'Posso cancelar quando quiser?', r: 'Sim. Sem fidelidade, sem multa. Cancela com um clique. Os dados ficam disponíveis por 30 dias para exportação.' },
  { q: 'Meus dados são seguros?', r: 'Sim. Os dados ficam no Supabase com Row Level Security ativo — cada conta só acessa os próprios dados. Nunca vendemos informações.' },
];

// ─── Componentes ──────────────────────────────────────────────────────────────

function Badge({ children, cor = C.indigo }: { children: React.ReactNode; cor?: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest nb-btn"
      style={{ background: `${cor}18`, color: cor, borderColor: `${cor}50`, boxShadow: `2px 2px 0 ${cor}30` }}>
      {children}
    </span>
  );
}

// Mockup do celular com gráficos reais via Recharts
function AppMockup() {
  return (
    <div className="relative w-[260px] aspect-[9/19] rounded-[3rem] overflow-hidden mx-auto"
      style={{ background: C.dark, border: `3px solid rgba(255,255,255,0.12)`, boxShadow: '0 40px 80px rgba(83,48,255,0.25)' }}>
      <div className="absolute inset-0 p-3 flex flex-col gap-2 overflow-hidden">

        {/* Status bar */}
        <div className="flex justify-between items-center px-1 pt-2">
          <span className="text-[9px] text-white font-bold">9:41</span>
          <div className="w-14 h-3 bg-white/10 rounded-full" />
          <div className="flex gap-0.5">{[1,2,3].map(i=><div key={i} className="w-1 h-1 rounded-full bg-white/30"/>)}</div>
        </div>

        {/* Header com logo F original */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-xs"
              style={{ background: C.indigo, border: `1.5px solid ${C.blue}60`, boxShadow: `1px 1px 0 ${C.blue}60` }}>
              F
            </div>
            <span className="text-white text-[10px] font-bold">Finexa</span>
          </div>
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{ background: `${C.orange}20`, border: `1px solid ${C.orange}40`, color: C.orange }}>L</div>
        </div>

        {/* Seletor de perfil */}
        <div className="flex gap-1 px-0.5">
          {['Geral','Letícia','Giovanna'].map((p,i) => (
            <div key={p} className="flex-1 text-center py-0.5 rounded-md text-[7px] font-bold"
              style={i===0 ? { background: C.orange, color: '#000' } : { color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {p}
            </div>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { l:'Receitas', v:'R$15k', c: C.teal },
            { l:'Despesas', v:'R$4,7k', c: C.magenta },
            { l:'Saldo', v:'R$10,2k', c: C.blue },
            { l:'Saldo Livre', v:'R$8,7k', c: C.yellow },
          ].map(k => (
            <div key={k.l} className="rounded-xl p-2" style={{ background:'rgba(255,255,255,0.05)', borderTop:`2px solid ${k.c}` }}>
              <div className="text-[7px] text-white/40 uppercase mb-0.5">{k.l}</div>
              <div className="text-[11px] font-bold text-white">{k.v}</div>
            </div>
          ))}
        </div>

        {/* Gráfico de barras — Evolução Mensal */}
        <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="text-[7px] text-white/40 uppercase mb-1">Evolução Mensal</div>
          <div className="h-[52px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={1}>
                <Bar dataKey="r" fill={C.teal} radius={[2,2,0,0]} maxBarSize={8} />
                <Bar dataKey="d" fill={C.magenta} radius={[2,2,0,0]} maxBarSize={8} />
                <XAxis dataKey="mes" tick={{ fontSize: 6, fill: 'rgba(255,255,255,0.3)' }} tickLine={false} axisLine={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de pizza — Categorias */}
        <div className="rounded-xl p-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="text-[7px] text-white/40 uppercase mb-1">Despesas por categoria</div>
          <div className="flex gap-2 items-center">
            <div className="h-[48px] w-[48px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={12} outerRadius={22} dataKey="value" stroke="none">
                    {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </RechartsPie>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              {pieData.slice(0,3).map(p => (
                <div key={p.name} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ background: p.color }} />
                  <span className="text-[6px] text-white/60 flex-1 truncate">{p.name}</span>
                  <span className="text-[6px] text-white/40">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Histórico mini */}
        <div className="rounded-xl p-2 flex-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="text-[7px] text-white/40 uppercase mb-1">Histórico</div>
          {[
            { icon: TrendingUp, label:'Salário', val:'+R$8.5k', c: C.teal },
            { icon: CreditCard, label:'Mercado', val:'-R$450', c: C.magenta },
            { icon: Zap, label:'Energia', val:'-R$210', c: C.orange },
          ].map((item,i) => (
            <div key={i} className="flex items-center gap-1.5 py-1 border-b border-white/5 last:border-0">
              <div className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.c}20` }}>
                <item.icon className="h-2.5 w-2.5" style={{ color: item.c }} />
              </div>
              <span className="text-[8px] text-white/70 flex-1">{item.label}</span>
              <span className="text-[8px] font-bold" style={{ color: item.c }}>{item.val}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function FaqItem({ q, r }: { q: string; r: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="nb-card bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left p-6 gap-4">
        <span className="font-black text-base text-foreground">{q}</span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: C.indigo }} />
      </button>
      {open && (
        <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
          {r}
        </div>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [anual, setAnual] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />

      <main className="flex-grow pt-20">

        {/* ── HERO ── */}
        <section className="grid-bg relative min-h-[92vh] flex items-center">
          <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] rounded-full -z-10"
            style={{ background: `${C.indigo}10`, filter: 'blur(120px)' }} />
          <div className="absolute top-[20%] right-[-5%] w-[350px] h-[350px] rounded-full -z-10"
            style={{ background: `${C.magenta}08`, filter: 'blur(100px)' }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge cor={C.teal}>
                <TrendingUp className="h-3 w-3" /> Controle financeiro para casais
              </Badge>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.0] tracking-tighter text-foreground">
                Seu dinheiro,<br />
                <span style={{ color: C.indigo, textShadow: `4px 4px 0 ${C.blue}40` }}>
                  com clareza.
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
                O único app que divide as contas{' '}
                <strong className="text-foreground">proporcionalmente ao salário</strong>{' '}
                de cada um. Para casais e famílias que querem controle real — não só uma planilha.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <button className="nb-btn px-8 py-4 text-base font-black uppercase tracking-wide flex items-center gap-2 animate-glow"
                    style={{ background: C.indigo, color: '#fff', borderColor: C.indigo, boxShadow: `4px 4px 0 ${C.blue}80` }}>
                    Começar grátis <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <div className="nb-card flex items-center gap-3 px-5 py-4"
                  style={{ background: C.yellow, borderColor: '#08080f', boxShadow: `4px 4px 0 #08080f` }}>
                  <ShieldCheck className="h-5 w-5 flex-shrink-0" style={{ color: '#08080f' }} />
                  <div style={{ color: '#08080f' }}>
                    <div className="text-sm font-black leading-tight">14 dias grátis</div>
                    <div className="text-[10px] opacity-60 uppercase tracking-widest">Sem cartão de crédito</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 pt-2">
                {[
                  { n: '14 dias', l: 'trial grátis' },
                  { n: '3 planos', l: 'disponíveis' },
                  { n: '100%', l: 'privado' },
                ].map(m => (
                  <div key={m.l}>
                    <div className="text-2xl font-black" style={{ color: C.indigo }}>{m.n}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-bold">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center relative">
              {/* Card flutuante economia */}
              <div className="absolute -top-6 -right-4 nb-card p-3 animate-float z-10"
                style={{ background: C.teal, borderColor: '#08080f', boxShadow: `4px 4px 0 #08080f`, color: '#08080f' }}>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <div>
                    <div className="text-[9px] font-black uppercase">Economia</div>
                    <div className="text-base font-black">+R$ 1.240</div>
                  </div>
                </div>
              </div>
              {/* Card flutuante meta */}
              <div className="absolute -bottom-4 -left-4 nb-card p-3 animate-float-slow z-10"
                style={{ background: C.magenta, borderColor: '#08080f', boxShadow: `4px 4px 0 #08080f`, color: '#08080f' }}>
                <div className="text-[9px] font-black uppercase mb-1">Meta Viagem</div>
                <div className="text-base font-black mb-1.5">75% concluído</div>
                <div className="h-1.5 w-full rounded-full overflow-hidden bg-black/20">
                  <div className="h-full rounded-full bg-white/80" style={{ width: '75%' }} />
                </div>
              </div>
              <AppMockup />
            </div>
          </div>
        </section>

        {/* ── PROBLEMA ── */}
        <section className="py-24" style={{ background: 'var(--secondary)', opacity: 1 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge>O problema</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 text-foreground">
                Você sabe quanto<br />gastou esse mês?
              </h2>
              <p className="text-muted-foreground mt-4 text-lg max-w-lg mx-auto font-medium">
                Reconhece alguma dessas situações?
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <Wallet className="h-8 w-8" />, t: 'Quanto gastamos?', d: 'No fim do mês, ninguém sabe ao certo. O dinheiro foi embora e ninguém sabe para onde.', cor: C.magenta },
                { icon: <CreditCard className="h-8 w-8" />, t: 'Quem pagou o quê?', d: 'Contas divididas no feeling, discussões sobre quem deve mais. Toda hora, todo mês.', cor: C.orange },
                { icon: <Target className="h-8 w-8" />, t: 'Por que não sobra?', d: 'Os salários caem, as contas consomem tudo. Nunca sobra para o que realmente importa.', cor: C.yellow },
              ].map(p => (
                <div key={p.t} className="nb-card bg-card p-8" style={{ borderTop: `4px solid ${p.cor}` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: `${p.cor}15`, color: p.cor }}>
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-3">{p.t}</h3>
                  <p className="text-muted-foreground leading-relaxed">{p.d}</p>
                </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section id="como-funciona" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge cor={C.orange}>Como funciona</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 text-foreground">
                Simples assim.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n:'01', icon: <Users className="h-6 w-6" />, t:'Configure os salários', d:'Informe o salário de cada um. O Finexa calcula a proporção e divide tudo automaticamente.', cor: C.teal },
                { n:'02', icon: <BarChart3 className="h-6 w-6" />, t:'Cadastre as fixas', d:'Aluguel, condomínio, assinaturas. Cada um vê sua parte proporcional, sem discussão.', cor: C.indigo },
                { n:'03', icon: <Zap className="h-6 w-6" />, t:'Lance e acompanhe', d:'App em 3 toques ou Telegram. O dashboard atualiza em tempo real para os dois.', cor: C.magenta },
              ].map((s) => (
                <div key={s.n}>
                  <div className="text-7xl font-black mb-3" style={{ color: `${s.cor}15`, fontFamily: 'inherit' }}>{s.n}</div>
                  <div className="nb-card bg-card p-6 -mt-8">
                    <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center"
                      style={{ background: `${s.cor}15`, border: `2px solid ${s.cor}30`, color: s.cor }}>
                      {s.icon}
                    </div>
                    <h3 className="text-lg font-black text-foreground mb-2">{s.t}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.d}</p>
                    <div className="w-8 h-1 rounded-full mt-4" style={{ background: s.cor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DIFERENCIAIS ── */}
        <section id="diferenciais" className="py-24 grid-bg" style={{ background: 'rgba(0,0,0,0.02)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge cor={C.magenta}>Diferenciais</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 text-foreground">
                Feito para quem<br />divide a vida.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DIFERENCIAIS.map(d => (
                <div key={d.titulo} className="nb-card bg-card p-6 cursor-default">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${d.cor}15`, border: `2px solid ${d.cor}30`, color: d.cor }}>
                    {d.icon}
                  </div>
                  <h3 className="font-black text-lg text-foreground mb-2">{d.titulo}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLANOS ── */}
        <section id="planos" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <Badge>Planos</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 text-foreground">
                Escolha o seu plano.
              </h2>
              <p className="text-muted-foreground mt-3 font-medium">
                14 dias grátis em todos os planos. Sem cartão de crédito.
              </p>
            </div>

            {/* Toggle anual/mensal */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-bold transition-colors ${!anual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Mensal
              </span>
              <button onClick={() => setAnual(!anual)}
                className="relative w-14 h-7 rounded-full border-2 transition-colors"
                style={{
                  background: anual ? C.indigo : 'var(--secondary)',
                  borderColor: anual ? C.indigo : 'var(--border)',
                  boxShadow: anual ? `2px 2px 0 ${C.blue}60` : 'none',
                }}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 shadow ${anual ? 'left-[30px]' : 'left-0.5'}`} />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold transition-colors ${anual ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Anual
                </span>
                {/* Destaque -20% */}
                <span className="nb-btn px-3 py-1 text-xs font-black uppercase tracking-wide animate-glow"
                  style={{
                    background: anual ? C.teal : `${C.teal}20`,
                    color: anual ? '#08080f' : C.teal,
                    borderColor: C.teal,
                    boxShadow: anual ? `3px 3px 0 #008257` : `2px 2px 0 ${C.teal}40`,
                  }}>
                  -20%
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-3 gap-6 items-start">
              {PLANOS.map(p => {
                const preco = anual ? Math.round(p.preco * 0.8) : p.preco;
                return (
                  <div key={p.id} className="nb-card bg-card p-8 relative"
                    style={p.destaque ? { borderColor: p.cor, boxShadow: `6px 6px 0 ${p.cor}50` } : {}}>

                    {p.destaque && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 nb-btn text-white text-xs font-black px-4 py-1.5 uppercase tracking-wider whitespace-nowrap"
                        style={{ background: p.cor, borderColor: p.cor, boxShadow: `3px 3px 0 #3a1fd4` }}>
                        Mais popular
                      </div>
                    )}

                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${p.cor}15`, border: `2px solid ${p.cor}40`, color: p.cor }}>
                      {p.icon}
                    </div>

                    <h3 className="text-2xl font-black text-foreground mb-1">{p.nome}</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{p.desc}</p>

                    <div className="mb-2">
                      <div className="flex items-end gap-1">
                        <span className="text-5xl font-black text-foreground leading-none">R${preco}</span>
                        <span className="text-muted-foreground text-sm mb-1">/mês</span>
                      </div>
                      {anual && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold" style={{ color: C.teal }}>
                            R${preco * 12}/ano
                          </span>
                          <span className="nb-btn text-[10px] font-black px-2 py-0.5 uppercase"
                            style={{ background: `${C.teal}20`, color: C.teal, borderColor: `${C.teal}50`, boxShadow: `1px 1px 0 ${C.teal}40` }}>
                            -20%
                          </span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8 mt-6">
                      {p.features.map(f => (
                        <li key={f} className="flex items-center gap-3 text-sm text-foreground">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: `${p.cor}20`, color: p.cor }}>
                            <Check className="h-3 w-3" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link href={`/dashboard?plano=${p.id}`}>
                      <button className="nb-btn w-full py-4 font-black uppercase tracking-wide text-sm"
                        style={p.destaque
                          ? { background: p.cor, color: '#fff', borderColor: p.cor }
                          : { background: 'var(--secondary)', color: 'var(--foreground)', borderColor: 'var(--border)' }
                        }>
                        Começar grátis
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24" style={{ background: 'rgba(0,0,0,0.02)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge cor={C.blue}>Dúvidas</Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4 text-foreground">
                Perguntas frequentes
              </h2>
            </div>
            <div className="space-y-3">
              {FAQ.map(item => <FaqItem key={item.q} {...item} />)}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="nb-card p-16 text-center relative overflow-hidden"
              style={{ background: C.indigo, borderColor: C.blue, boxShadow: `8px 8px 0 #3a1fd4` }}>
              <div className="absolute top-0 right-0 text-[180px] font-black text-white/[0.04] leading-none select-none pointer-events-none">F</div>
              <Badge cor={C.yellow}>
                <Zap className="h-3 w-3" /> Comece agora
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 mt-4 relative z-10">
                Comece hoje.<br />Sem cartão.
              </h2>
              <p className="text-white/70 text-lg mb-8 relative z-10 font-medium">
                14 dias grátis. Depois, a partir de R$19/mês. Cancele quando quiser.
              </p>
              <Link href="/dashboard" className="relative z-10">
                <button className="nb-btn px-12 py-5 text-lg font-black uppercase tracking-wide"
                  style={{ background: C.yellow, color: '#08080f', borderColor: '#08080f', boxShadow: `4px 4px 0 #08080f` }}>
                  Criar conta grátis
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
