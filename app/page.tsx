'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight, Check, Users, TrendingUp, Calendar, Zap,
  Smartphone, PieChart, ShieldCheck, Target, CreditCard,
  ChevronDown, Menu, X
} from 'lucide-react';
import { Navbar, Footer } from '@/components/landing-layout';

// ─── Dados ────────────────────────────────────────────────────────────────────

const PLANOS = [
  {
    id: 'individual', nome: 'Individual', preco: 19, emoji: '👤',
    desc: 'Para quem quer controle total das próprias finanças',
    cor: '#01b695', corText: 'text-[#01b695]', corBg: 'bg-[#01b695]',
    destaque: false,
    features: ['1 usuário', 'Dashboard completo', 'Metas pessoais', 'Histórico 12 meses', 'PWA nativo'],
  },
  {
    id: 'casal', nome: 'Casal', preco: 29, emoji: '💑',
    desc: 'O mais escolhido. Divisão justa, visão individual + geral',
    cor: '#5330ff', corText: 'text-[#5330ff]', corBg: 'bg-[#5330ff]',
    destaque: true,
    features: ['2 usuários', 'Divisão proporcional ao salário', 'Dashboard individual + geral', 'Metas conjuntas', 'Orçamento semanal', 'Lançamento via Telegram'],
  },
  {
    id: 'familia', nome: 'Família', preco: 39, emoji: '🏠',
    desc: 'Para famílias que querem clareza sem complicação',
    cor: '#ffa857', corText: 'text-[#ffa857]', corBg: 'bg-[#ffa857]',
    destaque: false,
    features: ['Até 4 usuários', 'Tudo do plano Casal', 'Perfis independentes', 'Visão consolidada', 'Relatório mensal', '+R$7/mês por extra'],
  },
];

const DIFERENCIAIS = [
  { icon: '⚖️', titulo: 'Divisão proporcional', desc: 'Quem ganha mais, contribui mais. Calculado automaticamente pela proporção de renda.', cor: '#01b695' },
  { icon: '👤', titulo: 'Perfis individuais', desc: 'Cada pessoa vê seus próprios gastos, envelope e metas — sem expor o que não precisa.', cor: '#82a1fd' },
  { icon: '🎯', titulo: 'Metas conjuntas', desc: 'Viagem, reserva, entrada do apê. Acompanhe o progresso junto, em tempo real.', cor: '#ff64ca' },
  { icon: '📅', titulo: 'Orçamento semanal', desc: 'O salário vira envelopes semanais. Você sabe exatamente quanto pode gastar essa semana.', cor: '#ffa857' },
  { icon: '⚡', titulo: 'Lançamento fácil', desc: 'App em 3 toques ou Telegram em linguagem natural. Claude interpreta e categoriza.', cor: '#fff245' },
  { icon: '📱', titulo: 'PWA nativo', desc: 'Instala direto na tela do celular. Sem App Store. Abre como app de verdade.', cor: '#5330ff' },
];

const FAQ = [
  { q: 'O parceiro precisa instalar algo?', r: 'Não. O Finexa é um PWA — é só acessar o link pelo celular e adicionar na tela inicial. Funciona em iPhone e Android.' },
  { q: 'O que é divisão proporcional ao salário?', r: 'Se você ganha R$8.500 e seu parceiro R$6.500, o total é R$15.000. O aluguel de R$2.200 é dividido: você paga R$1.247 (57%) e seu parceiro R$953 (43%). Automático, sem negociação.' },
  { q: 'Funciona offline?', r: 'O dashboard fica disponível offline. Para lançar novos gastos, é necessária conexão. Os dados sincronizam assim que você volta online.' },
  { q: 'Posso cancelar quando quiser?', r: 'Sim. Sem fidelidade, sem multa. Cancela com um clique. Os dados ficam disponíveis por 30 dias para exportação.' },
  { q: 'Meus dados são seguros?', r: 'Sim. Os dados ficam no Supabase com Row Level Security ativo — cada conta só acessa os próprios dados. Nunca vendemos informações.' },
];

// ─── Componentes ──────────────────────────────────────────────────────────────

function Badge({ children, cor = '#5330ff' }: { children: React.ReactNode; cor?: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest nb-btn"
      style={{ background: `${cor}15`, color: cor, borderColor: `${cor}40`, boxShadow: `2px 2px 0 ${cor}30` }}>
      {children}
    </span>
  );
}

function AppMockup() {
  return (
    <div className="relative w-[260px] aspect-[9/19] bg-[#08080f] dark:bg-white/5 border-4 border-foreground/20 dark:border-white/20 rounded-[3rem] shadow-2xl overflow-hidden mx-auto">
      <div className="absolute inset-0 p-4 flex flex-col gap-3">
        {/* Status bar */}
        <div className="flex justify-between items-center mt-4 px-1">
          <span className="text-[10px] text-white font-bold">9:41</span>
          <div className="w-16 h-4 bg-white/10 rounded-full" />
          <div className="flex gap-1">{[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/30" />)}</div>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#5330ff] flex items-center justify-center text-white text-xs font-black">F</div>
            <span className="text-white text-xs font-bold">Finexa</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#ffa857]/20 border border-[#ffa857]/40 flex items-center justify-center text-[8px] text-[#ffa857] font-bold">L</div>
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { l: 'Receitas', v: 'R$15k', c: '#01b695' },
            { l: 'Despesas', v: 'R$4,7k', c: '#ff64ca' },
            { l: 'Saldo', v: 'R$10k', c: '#82a1fd' },
            { l: 'Livre', v: 'R$8,7k', c: '#fff245' },
          ].map(k => (
            <div key={k.l} className="bg-white/5 rounded-xl p-2" style={{ borderTop: `2px solid ${k.c}` }}>
              <div className="text-[8px] text-white/40 uppercase">{k.l}</div>
              <div className="text-xs font-bold text-white">{k.v}</div>
            </div>
          ))}
        </div>
        {/* Categorias mini */}
        <div className="bg-white/5 rounded-xl p-3 flex-1">
          <div className="text-[8px] text-white/40 uppercase mb-2">Por categoria</div>
          {[
            { n: 'Moradia', p: 77, c: '#5330ff' },
            { n: 'Alimentação', p: 14, c: '#ff64ca' },
            { n: 'Transporte', p: 9, c: '#82a1fd' },
          ].map(cat => (
            <div key={cat.n} className="mb-1.5">
              <div className="flex justify-between mb-0.5">
                <span className="text-[8px] text-white/70">{cat.n}</span>
                <span className="text-[8px] text-white/40">{cat.p}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${cat.p}%`, background: cat.c }} />
              </div>
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
        <ChevronDown className={`h-5 w-5 text-[#5330ff] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
          {r}
        </div>
      )}
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [anual, setAnual] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <Navbar />

      <main className="flex-grow pt-20">

        {/* ── HERO ── */}
        <section className="grid-bg relative min-h-[90vh] flex items-center">
          {/* Blobs decorativos */}
          <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-[#5330ff]/8 blur-[120px] rounded-full -z-10 dark:bg-[#5330ff]/15" />
          <div className="absolute top-[20%] right-[-5%] w-[350px] h-[350px] bg-[#ff64ca]/8 blur-[100px] rounded-full -z-10 dark:bg-[#ff64ca]/12" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge cor="#01b695">✦ Controle Financeiro Para Casais</Badge>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.0] tracking-tighter text-foreground">
                Seu dinheiro,{' '}
                <br />
                <span className="text-[#5330ff]"
                  style={{ textShadow: '4px 4px 0 #82a1fd50' }}>
                  com clareza.
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
                O único app que divide as contas{' '}
                <strong className="text-foreground">proporcionalmente ao salário</strong>{' '}
                de cada um. Para casais e famílias que querem controle real.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/cadastro">
                  <button className="nb-btn bg-[#5330ff] text-white px-8 py-4 text-base font-black uppercase tracking-wide flex items-center gap-2 animate-glow">
                    Começar grátis <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <div className="nb-card flex items-center gap-3 px-5 py-4 bg-[#fff245] dark:bg-[#fff245] border-foreground/80">
                  <ShieldCheck className="h-5 w-5 text-[#08080f] flex-shrink-0" />
                  <div className="text-[#08080f]">
                    <div className="text-sm font-black leading-tight">14 dias grátis</div>
                    <div className="text-[10px] opacity-60 uppercase tracking-widest">Sem cartão de crédito</div>
                  </div>
                </div>
              </div>

              {/* Métricas sociais */}
              <div className="flex gap-6 pt-2">
                {[
                  { n: '14 dias', l: 'trial grátis' },
                  { n: '3 planos', l: 'para cada fase' },
                  { n: '100%', l: 'privado' },
                ].map(m => (
                  <div key={m.l}>
                    <div className="text-xl font-black text-[#5330ff]">{m.n}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center relative">
              {/* Card flutuante 1 */}
              <div className="absolute -top-4 -right-4 nb-card bg-[#01b695] text-[#08080f] p-3 animate-float z-10">
                <div className="text-[10px] font-black uppercase">Economia este mês</div>
                <div className="text-lg font-black">+R$ 1.240</div>
              </div>
              {/* Card flutuante 2 */}
              <div className="absolute -bottom-4 -left-4 nb-card bg-[#fff245] text-[#08080f] p-3 animate-float-slow z-10">
                <div className="text-[10px] font-black uppercase">Meta viagem</div>
                <div className="text-lg font-black">75% ✈️</div>
              </div>
              <AppMockup />
            </div>
          </div>
        </section>

        {/* ── PROBLEMA ── */}
        <section className="py-24 bg-foreground/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge>O problema</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 text-foreground">
                Você sabe quanto<br />gastou esse mês?
              </h2>
              <p className="text-muted-foreground mt-4 text-lg max-w-lg mx-auto">Reconhece alguma dessas situações?</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { e: '😰', t: 'Quanto gastamos?', d: 'No fim do mês, ninguém sabe ao certo. O dinheiro foi embora e ninguém sabe para onde.', top: '#ff64ca' },
                { e: '🤔', t: 'Quem pagou o quê?', d: 'Contas divididas no feeling, discussões sobre quem deve mais. Toda hora.', top: '#ffa857' },
                { e: '😤', t: 'Por que não sobra?', d: 'Os salários caem, as contas consomem tudo. Nunca sobra para o que importa.', top: '#fff245' },
              ].map(p => (
                <div key={p.t} className="nb-card bg-card p-8" style={{ borderTop: `4px solid ${p.top}` }}>
                  <div className="text-5xl mb-4">{p.e}</div>
                  <h3 className="text-xl font-black text-foreground mb-3">{p.t}</h3>
                  <p className="text-muted-foreground leading-relaxed">{p.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ── */}
        <section id="como-funciona" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge cor="#ffa857">Como funciona</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 text-foreground">
                Simples assim.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {[
                { n: '01', t: 'Configure os salários', d: 'Informe o salário de cada um. O Finexa calcula a proporção e divide tudo automaticamente.', cor: '#01b695' },
                { n: '02', t: 'Cadastre as fixas', d: 'Aluguel, condomínio, assinaturas. Cada um vê sua parte proporcional, sem discussão.', cor: '#5330ff' },
                { n: '03', t: 'Lance e acompanhe', d: 'App em 3 toques ou Telegram. O dashboard atualiza em tempo real para os dois.', cor: '#ff64ca' },
              ].map((s, i) => (
                <div key={s.n} className="relative">
                  <div className="text-7xl font-black text-foreground/5 dark:text-white/5 mb-4" style={{ fontFamily: 'inherit' }}>{s.n}</div>
                  <div className="nb-card bg-card p-6 -mt-8">
                    <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-xl"
                      style={{ background: `${s.cor}20`, border: `2px solid ${s.cor}40` }}>
                      {['⚙️','📋','🚀'][i]}
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
        <section id="diferenciais" className="py-24 bg-foreground/[0.02] grid-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge cor="#ff64ca">Diferenciais</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mt-4 text-foreground">
                Feito para quem<br />divide a vida.
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DIFERENCIAIS.map(d => (
                <div key={d.titulo} className="nb-card bg-card p-6 cursor-default">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                    style={{ background: `${d.cor}15`, border: `2px solid ${d.cor}30` }}>
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
              <p className="text-muted-foreground mt-3">14 dias grátis em todos os planos. Sem cartão de crédito.</p>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-bold ${!anual ? 'text-foreground' : 'text-muted-foreground'}`}>Mensal</span>
              <button onClick={() => setAnual(!anual)}
                className="nb-btn relative w-14 h-7 rounded-full p-0.5 transition-colors"
                style={{ background: anual ? '#5330ff' : 'var(--secondary)' }}>
                <div className={`w-6 h-6 rounded-full bg-white transition-all duration-200 ${anual ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-bold ${anual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Anual <span className="text-[#01b695] font-black">-20%</span>
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-start">
              {PLANOS.map(p => {
                const preco = anual ? Math.round(p.preco * 0.8) : p.preco;
                return (
                  <div key={p.id}
                    className={`nb-card bg-card p-8 relative ${p.destaque ? 'border-[#5330ff] shadow-[6px_6px_0_#5330ff]' : ''}`}
                    style={p.destaque ? { borderColor: '#5330ff', boxShadow: '6px 6px 0 #5330ff30' } : {}}>
                    {p.destaque && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 nb-btn bg-[#5330ff] text-white text-xs font-black px-4 py-1.5 uppercase tracking-wider">
                        ⭐ Mais popular
                      </div>
                    )}
                    <div className="text-4xl mb-3">{p.emoji}</div>
                    <h3 className="text-2xl font-black text-foreground mb-1">{p.nome}</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{p.desc}</p>
                    <div className="mb-6">
                      <span className="text-5xl font-black text-foreground">R${preco}</span>
                      <span className="text-muted-foreground text-sm">/mês</span>
                      {anual && <div className="text-xs text-[#01b695] font-bold mt-1">R${preco * 12}/ano · 20% de desconto</div>}
                    </div>
                    <ul className="space-y-3 mb-8">
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
                    <Link href={`/plano?id=${p.id}&ciclo=mensal`}>
                      <button className="nb-btn w-full py-4 font-black uppercase tracking-wide text-sm"
                        style={p.destaque ? { background: '#5330ff', color: '#fff', borderColor: '#5330ff' } : { background: 'var(--secondary)', color: 'var(--foreground)' }}>
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
        <section id="faq" className="py-24 bg-foreground/[0.02]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge cor="#82a1fd">Dúvidas</Badge>
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
            <div className="nb-card bg-[#5330ff] p-16 text-center relative overflow-hidden"
              style={{ borderColor: '#82a1fd', boxShadow: '8px 8px 0 #3a1fd4' }}>
              <div className="absolute top-0 right-0 text-[200px] leading-none font-black text-white/5 select-none">F</div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 relative z-10">
                Comece hoje.<br />Sem cartão.
              </h2>
              <p className="text-white/70 text-lg mb-8 relative z-10">14 dias grátis. Depois, a partir de R$19/mês.</p>
              <Link href="/cadastro" className="relative z-10">
                <button className="nb-btn bg-[#fff245] text-[#08080f] px-12 py-5 text-lg font-black uppercase tracking-wide"
                  style={{ borderColor: '#08080f', boxShadow: '4px 4px 0 #08080f' }}>
                  Criar conta grátis ✦
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
