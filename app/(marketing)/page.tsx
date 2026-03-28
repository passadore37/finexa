'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Check,
  Users,
  TrendingUp,
  Zap,
  Smartphone,
  PieChart as LucidePieChart,
  ArrowRight,
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
import { NeobrutalistButton, NeobrutalistCard } from '@/components/neobrutalist';

/**
 * FAQ ACCORDION ITEM
 * Mantido localmente pois é específico desta página
 */
const AccordionItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-2 border-[#08080f] dark:border-white shadow-[3px_3px_0px_0px_rgba(8,8,15,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] mb-4 overflow-hidden group">
      <button
        className="w-full flex justify-between items-center text-left font-bold text-lg md:text-xl px-6 py-5 cursor-pointer bg-white dark:bg-[#111118] hover:bg-gray-50 dark:hover:bg-[#1a1a26] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <ChevronDown
          className={`transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180 text-[#5330ff]' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 bg-[#f8f8ff] dark:bg-[#0d0d15] border-t-2 border-[#08080f] dark:border-white/10">
          <p className="pt-4 text-[#08080f]/80 dark:text-white/80 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * MOCKUP DO CELULAR
 * Visualização interativa da interface do app
 */
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
        {/* Header fictício do app */}
        <div className="flex justify-between items-center mt-6">
          <div className="w-8 h-8 rounded-full bg-[#5330ff]/20 border border-[#5330ff]" />
          <div className="h-4 w-20 bg-[#08080f]/10 dark:bg-white/10 rounded-full" />
          <div className="w-8 h-8 rounded-full bg-[#01b695]/20 border border-[#01b695]" />
        </div>

        {/* Card de Saldo */}
        <div className="bg-[#5330ff] p-4 rounded-2xl text-white shadow-[4px_4px_0px_0px_rgba(8,8,15,1)]">
          <p className="text-[10px] opacity-80">Saldo Total</p>
          <p className="text-xl font-bold">R$ 4.250,00</p>
        </div>

        {/* Mini Gráficos */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#08080f]/5 dark:bg-white/5 p-3 rounded-xl border border-[#08080f]/10 dark:border-white/10">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold uppercase opacity-50">Gastos Semanais</p>
              <div className="w-2 h-2 bg-[#01b695] rounded-full animate-pulse" />
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

        {/* Linha de Transação fictícia */}
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

        {/* Navbar fake do app */}
        <div className="absolute bottom-4 left-4 right-4 h-12 bg-[#08080f] rounded-2xl flex justify-around items-center">
          <div className="w-6 h-6 bg-white/20 rounded-full" />
          <div className="w-8 h-8 bg-[#5330ff] rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
            <span className="text-white text-lg">+</span>
          </div>
          <div className="w-6 h-6 bg-white/20 rounded-full" />
        </div>
      </div>
      {/* Notch do celular */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#08080f] rounded-b-2xl z-10" />
    </div>
  );
};

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="overflow-x-hidden selection:bg-[#ff64ca] selection:text-white lp-noise">
      {/* ── HERO ── */}
      <section className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* Blur blobs dekorativos */}
        <div className="absolute -top-10 -left-20 w-96 h-96 bg-[#ff64ca]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 -right-20 w-80 h-80 bg-[#5330ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Lado Esquerdo - Texto */}
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

          {/* Lado Direito — Mockup do Celular + Cards Flutuantes */}
          <div className="relative lp-fade-in-delay">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#ff64ca]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-[#5330ff]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <MockupApp />

              {/* Card flutuante - Topo Direito */}
              <div className="absolute top-20 -right-4 md:-right-20 lp-float-up">
                <NeobrutalistCard bgColor="bg-[#fff245]" borderColor="border-[#08080f]" className="p-4 shadow-xl !border-[#08080f]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#08080f] rounded-full text-white">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase opacity-60">Economia</p>
                      <p className="font-black text-lg text-[#08080f]">+R$ 850</p>
                    </div>
                  </div>
                </NeobrutalistCard>
              </div>

              {/* Card flutuante - Baixo Esquerda */}
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

      {/* ── SEÇÃO: COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 px-4 bg-gray-50 dark:bg-[#0c0c14] border-y-4 border-[#08080f] dark:border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-4">Em 3 passos simples</h2>
            <p className="text-xl text-[#08080f]/60 dark:text-white/60">Controle total sem complicação.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                title: 'Conecte ou Lance', 
                desc: 'Importe seus dados ou registre seus gastos em segundos com nossa interface ultra veloz.', 
                color: 'bg-[#5330ff]',
                icon: <Zap size={24} /> 
              },
              { 
                step: '02', 
                title: 'Defina Metas', 
                desc: 'Quer viajar ou comprar uma casa? Nós te ajudamos a poupar o necessário mensalmente.', 
                color: 'bg-[#ff64ca]',
                icon: <Target size={24} /> 
              },
              { 
                step: '03', 
                title: 'Visualize o Fluxo', 
                desc: 'Gráficos claros que mostram exatamente para onde seu dinheiro está indo.', 
                color: 'bg-[#01b695]',
                icon: <LucidePieChart size={24} /> 
              },
            ].map((item, idx) => (
              <NeobrutalistCard key={idx} className="relative pt-12">
                <div className={`absolute -top-6 left-6 w-14 h-14 ${item.color} border-2 border-[#08080f] flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(8,8,15,1)]`}>
                  {item.icon}
                </div>
                <div className="text-4xl font-black mb-4 opacity-10">{item.step}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#08080f]/70 dark:text-white/70">{item.desc}</p>
              </NeobrutalistCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO: RECURSOS (STILL LOCAL) ── */}
      <section id="diferenciais" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
           <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1 relative">
                <div className="bg-[#fff245] border-4 border-[#08080f] p-8 shadow-[12px_12px_0px_0px_rgba(8,8,15,1)] rotate-1">
                   <h3 className="text-3xl font-black mb-6 flex items-center gap-3">
                     <LucidePieChart className="text-[#5330ff]" /> Divisão Inteligente
                   </h3>
                   <div className="space-y-4">
                      {[
                        'Saiba quanto cada um deve pagar',
                        'Visualize gastos comuns e individuais',
                        'Sincronização em tempo real',
                        'Histórico compartilhado transparente'
                      ].map((t, i) => (
                        <div key={i} className="flex items-center gap-3 font-bold">
                          <Check className="text-[#01b695] border-2 border-[#08080f] bg-white rounded-full p-0.5" size={20} />
                          {t}
                        </div>
                      ))}
                   </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#ff64ca] border-4 border-[#08080f] -z-10 shadow-[8px_8px_0px_0px_rgba(8,8,15,1)]" />
             </div>

             <div className="order-1 lg:order-2">
                <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
                  Perfeito para <br />
                  <span className="text-[#ff64ca]">casais e famílias.</span>
                </h2>
                <p className="text-xl text-[#08080f]/70 dark:text-white/70 mb-8 max-w-lg leading-relaxed">
                  Chega de planilhas complexas ou discussões sobre o orçamento. Nosso sistema foi desenhado para facilitar a colaboração.
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 border-2 border-[#08080f] dark:border-white bg-[#5330ff]/5">
                      <p className="text-3xl font-black text-[#5330ff]">+15k</p>
                      <p className="font-bold opacity-70">Usuários ativos</p>
                   </div>
                   <div className="p-4 border-2 border-[#08080f] dark:border-white bg-[#01b695]/5">
                      <p className="text-3xl font-black text-[#01b695]">98%</p>
                      <p className="font-bold opacity-70">De satisfação</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* ── SEÇÃO: PLANOS (PRICING) ── */}
      <section id="planos" className="py-24 px-4 bg-[#08080f] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Preço justo e sem letras miúdas</h2>
            <div className="flex items-center justify-center gap-4">
              <span className={`font-bold ${!isAnnual ? 'text-[#ff64ca]' : 'opacity-50'}`}>Mensal</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-16 h-8 bg-white border-2 border-[#ff64ca] relative shadow-[3px_3px_0px_0px_rgba(255,100,202,0.5)] cursor-pointer"
              >
                <div className={`w-6 h-6 bg-[#ff64ca] absolute top-0.5 transition-all duration-300 ${isAnnual ? 'right-0.5' : 'left-0.5'}`} />
              </button>
              <span className={`font-bold ${isAnnual ? 'text-[#ff64ca]' : 'opacity-50'}`}>Anual (-20%)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Plano Free */}
            <div className="bg-white text-[#08080f] border-4 border-white p-8 flex flex-col shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
              <h3 className="text-2xl font-black mb-2 italic">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">R$ 0</span>
                <span className="opacity-60">/mês</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {['Até 2 membros', 'Controle básico de gastos', 'Metas simples', 'App Mobile'].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 font-bold text-sm">
                    <Check size={16} className="text-[#01b695]" /> {t}
                  </li>
                ))}
              </ul>
              <NeobrutalistButton href="/cadastro?plan=free" bgColor="bg-white" textColor="text-[#08080f]" className="w-full">
                Começar agora
              </NeobrutalistButton>
            </div>

            {/* Plano Pro */}
            <div className="bg-[#5330ff] border-4 border-white p-8 flex flex-col shadow-[12px_12px_0px_0px_#ff64ca] scale-105 relative z-10">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#ff64ca] border-2 border-white px-4 py-1 font-black text-xs uppercase tracking-widest">
                MAIS POPULAR
              </div>
              <h3 className="text-2xl font-black mb-2 italic">Pro Couple</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">R$ {isAnnual ? '19' : '24'}</span>
                <span className="opacity-80">/mês</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  'Membros ilimitados', 
                  'Análise de gastos com IA', 
                  'Relatórios mensais em PDF', 
                  'Suporte Prioritário',
                  'Personalização de categorias'
                ].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 font-black text-sm">
                    <Check size={16} className="text-[#fff245]" /> {t}
                  </li>
                ))}
              </ul>
              <NeobrutalistButton href="/cadastro?plan=pro" bgColor="bg-[#fff245]" textColor="text-[#08080f]" className="w-full !border-white !shadow-[4px_4px_0px_0px_white]">
                Quero o Pro
              </NeobrutalistButton>
            </div>

            {/* Plano Família */}
            <div className="bg-white text-[#08080f] border-4 border-white p-8 flex flex-col shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
              <h3 className="text-2xl font-black mb-2 italic">Family Max</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">R$ {isAnnual ? '39' : '49'}</span>
                <span className="opacity-60">/mês</span>
              </div>
              <ul className="space-y-4 mb-10 flex-grow">
                {[
                  'Tudo do Pro', 
                  'Dashboard para TV/Tablet', 
                  'Importação direta de bancos', 
                  'Metas familiares avançadas'
                ].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 font-bold text-sm">
                    <Check size={16} className="text-[#01b695]" /> {t}
                  </li>
                ))}
              </ul>
              <NeobrutalistButton href="/cadastro?plan=family" bgColor="bg-white" textColor="text-[#08080f]" className="w-full">
                Assinar Family
              </NeobrutalistButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO: FAQ ── */}
      <section id="faq" className="py-24 px-4 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black text-center mb-16 tracking-tighter">Dúvidas Frequentes</h2>
        <div className="space-y-4">
          <AccordionItem 
            question="Meus dados estão seguros?" 
            answer="Sim! Utilizamos criptografia de ponta a ponta e nunca vendemos seus dados para terceiros. Sua privacidade é nossa prioridade número um." 
          />
          <AccordionItem 
            question="Posso cancelar a qualquer momento?" 
            answer="Com certeza. O cancelamento é feito com um clique nas configurações da sua conta, sem burocracia ou taxas escondidas." 
          />
          <AccordionItem 
            question="Como funciona a conexão com o banco?" 
            answer="Para o plano Family, utilizamos APIs seguras (Open Banking) que permitem leitura apenas para categorização automática. Não temos poder de movimentação." 
          />
          <AccordionItem 
            question="Posso usar sozinho?" 
            answer="Sim! Embora o Finexa brilhe em conjunto, muitos usuários adoram usar a interface neobrutalista para seu controle pessoal." 
          />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section id="comece-agora" className="py-24 px-4 bg-[#ff64ca] border-y-4 border-[#08080f]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black text-[#08080f] mb-8 leading-tight">
            Pronto para sair <br /> do escuro?
          </h2>
          <p className="text-xl md:text-2xl font-bold text-[#08080f]/80 mb-12">
            Junte-se a mais de 15.000 pessoas que transformaram sua relação com o dinheiro hoje.
          </p>
          <NeobrutalistButton 
            href="/cadastro" 
            bgColor="bg-[#08080f]" 
            textColor="text-white"
            className="text-2xl px-12 py-6 hover:bg-[#5330ff] hover:scale-105 transition-all"
          >
            Começar agora - É grátis
          </NeobrutalistButton>
          <p className="mt-6 font-bold text-[#08080f]/60 italic">Cartão de crédito não obrigatório para o teste.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-4 bg-white dark:bg-[#08080f] text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff64ca] border-2 border-[#08080f] flex items-center justify-center font-black">F</div>
            <span className="font-black text-xl tracking-tighter">FINEXA</span>
          </div>
          <p className="text-[#08080f]/50 dark:text-white/50 text-sm font-medium">
            © 2026 Finexa SaaS. Todos os direitos reservados.
          </p>
          <div className="flex gap-8 font-bold text-sm opacity-70">
            <a href="#" className="hover:text-[#5330ff]">Termos</a>
            <a href="#" className="hover:text-[#5330ff]">Privacidade</a>
            <a href="#" className="hover:text-[#ff64ca]">Twitter/X</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
