'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import {
  ChevronDown,
  Check,
  Users,
  User,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  PieChart as LucidePieChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

/**
 * FAQ ACCORDION ITEM (Glassmorphism version)
 */
const AccordionItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-[#08080f]/5 bg-white shadow-sm rounded-2xl mb-4 overflow-hidden transition-all duration-300">
      <button
        className="w-full flex justify-between items-center text-left font-bold text-lg md:text-xl px-6 py-5 cursor-pointer bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[#08080f]/90">{question}</span>
        <ChevronDown
          className={`transition-transform duration-300 flex-shrink-0 ml-4 text-[#5330ff] ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-6 bg-[#f8f8ff] border-t border-[#08080f]/5">
          <p className="pt-4 text-[#08080f]/70 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * MOCKUP APP (Glassmorphism version)
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
    <div className="relative w-full max-w-[280px] aspect-[9/19] bg-[#08080f] border-[8px] border-[#08080f] rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(8,8,15,0.4)] overflow-hidden mx-auto">
      <div className="absolute inset-0 bg-white p-4 flex flex-col gap-3">
        {/* Header fictício */}
        <div className="flex justify-between items-center mt-6">
          <div className="w-8 h-8 rounded-full bg-[#5330ff]/10" />
          <div className="h-4 w-20 bg-[#08080f]/5 rounded-full" />
          <div className="w-8 h-8 rounded-full bg-[#01b695]/10" />
        </div>

        {/* Card de Saldo Premium */}
        <div className="bg-gradient-to-br from-[#5330ff] to-[#4320ee] p-5 rounded-3xl text-white shadow-xl">
          <p className="text-[10px] opacity-80 font-medium">Saldo Total</p>
          <p className="text-xl font-bold tracking-tight">R$ 4.250,00</p>
        </div>

        {/* Mini Gráficos com Glassmorphism inside the mockup */}
        <div className="flex flex-col gap-2">
          <div className="bg-[#08080f]/5 p-3 rounded-2xl">
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#5330ff', '#ff64ca', '#01b695', '#ffa857', '#fff245'][index % 5]}
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#08080f]/5 p-2 rounded-2xl flex flex-col items-center justify-center">
              <div className="h-14 w-14">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={12} outerRadius={25} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-center">
               <div className="bg-[#ffa857]/10 p-2 rounded-xl">
                  <p className="text-[8px] text-[#ffa857] font-bold text-xs">R$ 1.2k</p>
               </div>
               <div className="bg-[#01b695]/10 p-2 rounded-xl">
                  <p className="text-[8px] text-[#01b695] font-bold text-xs">R$ 800</p>
               </div>
            </div>
          </div>
        </div>

        {/* Linha de Transação */}
        <div className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between border border-black/5">
           <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#ff64ca]/10 rounded-xl flex items-center justify-center">
                 <LucidePieChart size={14} className="text-[#ff64ca]" />
              </div>
              <div className="flex flex-col gap-1">
                 <div className="h-2 w-12 bg-black/10 rounded-full" />
                 <div className="h-1.5 w-8 bg-black/5 rounded-full" />
              </div>
           </div>
           <p className="text-[10px] font-bold text-[#08080f]">-R$ 45,00</p>
        </div>

        {/* Home Indicator fake */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-black/10 rounded-full" />
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="bg-white text-[#08080f]">
      {/* ── HERO ── */}
      <section className="relative py-24 px-4">
        {/* Background Gradients (Glassmorphism look) */}
        <div className="absolute -top-10 -left-20 w-[600px] h-[600px] bg-[#5330ff]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-[#ff64ca]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Texto Hero */}
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#5330ff]/10 text-[#5330ff] rounded-full text-sm font-bold mb-8">
              <span className="w-2 h-2 bg-[#5330ff] rounded-full animate-pulse" />
              Sua jornada financeira começa com clareza
            </div>
            <h1 className="text-6xl md:text-[5.5rem] font-black leading-[0.95] tracking-tight text-[#08080f] mb-8">
              Controle total, <br />
              <span className="bg-gradient-to-r from-[#5330ff] to-[#ff64ca] bg-clip-text text-transparent">na palma da mão.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#08080f]/60 mb-12 max-w-xl leading-relaxed">
              Organize seus gastos, planeje seu futuro e tome as rédeas da sua vida financeira com a plataforma mais moderna e intuitiva do mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/cadastro"
                className="px-10 py-5 bg-[#5330ff] text-white text-lg font-bold rounded-full shadow-[0_20px_40px_-10px_rgba(83,48,255,0.4)] hover:bg-[#4320ee] hover:shadow-[0_25px_50px_-12px_rgba(83,48,255,0.5)] transition-all hover:-translate-y-1 active:translate-y-0 text-center"
              >
                Teste grátis por 14 dias
              </Link>
              <a href="#como-funciona" className="flex items-center justify-center gap-2 font-bold text-[#08080f]/70 hover:text-[#08080f] transition-colors">
                Ver diferenciais <ArrowRight size={20} />
              </a>
            </div>
          </div>

          {/* Imagem Hero Reformulada */}
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200 mt-12 lg:mt-0 flex justify-center lg:justify-end">
            <div className="relative scale-90 sm:scale-100 lg:scale-110">
              <MockupApp />
              
              {/* Cards decorativos flutuando (visíveis em mobile e desktop agora) */}
              <div className="absolute -top-6 -right-6 sm:-right-12 p-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl animate-bounce duration-[3000ms] z-20">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#01b695] rounded-full flex items-center justify-center text-white shadow-lg">
                       <TrendingUp size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-black/40 uppercase leading-none">Evolução</p>
                       <p className="text-lg font-black text-[#08080f]">+R$ 2.400</p>
                    </div>
                 </div>
              </div>

              <div className="absolute -bottom-6 -left-6 sm:-left-12 p-5 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl animate-pulse duration-[4000ms] z-20">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#ff64ca] rounded-full flex items-center justify-center text-white shadow-lg">
                       <Target size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-black/40 uppercase leading-none">Meta</p>
                       <p className="text-lg font-black text-[#08080f]">85%</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEÇÃO: COMO FUNCIONA ── */}
      <section id="como-funciona" className="py-24 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tight uppercase">Simplicidade em foco</h2>
            <p className="text-lg text-[#08080f]/60 leading-relaxed">Desenvolvido para ser o controle financeiro que você realmente usa no dia a dia.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: 'Controle ágil', desc: 'Registre seus gastos e ganhos de forma extremamente rápida e intuitiva.', icon: <Zap size={28} />, color: 'bg-blue-500' },
              { title: 'Metas Claras', desc: 'Defina onde quer chegar e acompanhe seu progresso visualmente.', icon: <Target size={28} />, color: 'bg-purple-500' },
              { title: 'Insights Visuais', desc: 'Gráficos que mostram exatamente para onde seu dinheiro está indo.', icon: <LucidePieChart size={28} />, color: 'bg-emerald-500' },
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-black/5 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-14 h-14 ${step.color} shadow-lg rounded-2xl flex items-center justify-center text-white mb-8`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-black mb-4">{step.title}</h3>
                <p className="text-[#08080f]/60 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO: DIFERENCIAIS ── */}
      <section id="diferenciais" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
           {/* Individual */}
           <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
              <div className="order-2 lg:order-1 relative px-4">
                 <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-2xl">
                    <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-6">
                       <User size={32} />
                    </div>
                    <h3 className="text-3xl font-black mb-6 tracking-tight">Perfeito para você</h3>
                    <div className="space-y-5">
                       {[
                         'Gestão minimalista e ultra rápida',
                         'Categorização inteligente e flexível',
                         'Previsão de saldo para o fim do mês',
                         'Lembretes de contas a pagar'
                       ].map((t, i) => (
                         <div key={i} className="flex items-center gap-4 text-lg font-medium text-[#08080f]/80">
                           <Check className="text-blue-500 flex-shrink-0" size={24} /> {t}
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-[80px]" />
              </div>
              <div className="order-1 lg:order-2">
                 <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tighter uppercase">
                   Seu sucesso <br />
                   <span className="text-blue-600">pessoal.</span>
                 </h2>
                 <p className="text-xl text-[#08080f]/60 mb-8 leading-relaxed">
                   Independência e clareza total. Cada registro é um passo em direção à sua liberdade financeira individual.
                 </p>
                 <Link href="/cadastro" className="font-bold text-blue-600 flex items-center gap-2 hover:gap-4 transition-all group">
                    Começar teste individual <ArrowRight size={20} />
                 </Link>
              </div>
           </div>

           {/* Casal e Família */}
           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative order-1 lg:order-2 px-4">
                 <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-2xl">
                    <div className="inline-flex p-3 bg-pink-50 text-pink-500 rounded-2xl mb-6">
                       <Users size={32} />
                    </div>
                    <h3 className="text-3xl font-black mb-6 tracking-tight">Gestão em Conjunto</h3>
                    <div className="space-y-5">
                       {[
                         'Sincronização entre membros da família',
                         'Divisão de gastos de forma equilibrada',
                         'Metas compartilhadas (ex: reserva)',
                         'Diferenciação clara entre gastos'
                       ].map((t, i) => (
                         <div key={i} className="flex items-center gap-4 text-lg font-medium text-[#08080f]/80">
                           <Check className="text-pink-500 flex-shrink-0" size={24} /> {t}
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-400/10 rounded-full blur-[80px]" />
              </div>
              <div className="order-2 lg:order-1">
                 <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1] tracking-tighter uppercase">
                   Casais e <br />
                   <span className="text-pink-500">famílias.</span>
                 </h2>
                 <p className="text-xl text-[#08080f]/60 mb-8 leading-relaxed">
                   Planejamento compartilhado com transparência. Alcancem objetivos juntos sem complicações ou planilhas difíceis.
                 </p>
                 <Link href="/cadastro" className="font-bold text-pink-500 flex items-center gap-2 hover:gap-4 transition-all">
                    Ver planos familiares <ArrowRight size={20} />
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-24 px-4 bg-[#08080f] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter italic">Planos pensados em você</h2>
            <p className="text-xl text-white/40 mb-10">Escolha o plano ideal e teste por 14 dias sem compromisso.</p>
            
            <div className="flex items-center justify-center gap-4 p-1.5 bg-white/5 w-fit mx-auto rounded-full border border-white/10">
              <button onClick={() => setIsAnnual(false)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}>Mensal</button>
              <button onClick={() => setIsAnnual(true)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isAnnual ? 'bg-[#5330ff] text-white' : 'text-white/60 hover:text-white'}`}>Anual <span className="text-[10px] opacity-70 ml-1">(-20%)</span></button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch pt-4">
            {[
              { name: 'Individual', price: isAnnual ? '19' : '24', features: ['1 perfil completo', 'Lançamentos ilimitados', 'Metas personalizadas', 'Insights visuais'], cta: 'Iniciar teste agora' },
              { name: 'Casal', price: isAnnual ? '34' : '42', features: ['2 perfis vinculados', 'Divisão de gastos', 'Metas compartilhadas', 'Relatórios conjuntos', 'Suporte prioritário'], cta: 'Escolher Casal', recom: true },
              { name: 'Família', price: isAnnual ? '59' : '74', features: ['Até 5 perfis', 'Tudo do plano Casal', 'Área de educação financeira', 'Importação facilitada', 'Filtros avançados'], cta: 'Assinar Família' }
            ].map((plan, i) => (
              <div key={i} className={`relative flex flex-col p-10 rounded-[3rem] transition-all duration-500 hover:scale-[1.02] ${plan.recom ? 'bg-[#5330ff] shadow-2xl' : 'bg-white/5 border border-white/10'}`}>
                {plan.recom && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#5330ff] px-5 py-1.5 rounded-full text-xs font-bold uppercase">Mais escolhido</div>}
                <h3 className="text-2xl font-black mb-2 italic">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black tracking-tighter">R$ {plan.price}</span>
                  <span className="text-white/40 font-bold">/mês</span>
                </div>
                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm">
                      <Check className={`flex-shrink-0 ${plan.recom ? 'text-white' : 'text-[#5330ff]'}`} size={18} />
                      <span className="text-white/80">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/cadastro" className={`w-full py-4 rounded-2xl text-center font-bold text-lg transition-all ${plan.recom ? 'bg-white text-[#5330ff] hover:bg-gray-100' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {plan.cta}
                </Link>
                <p className="text-center text-[10px] uppercase font-bold opacity-30 mt-4">14 dias gratuitos para testar</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">Dúvidas comuns</h2>
        </div>
        <div>
          <AccordionItem question="Como funciona o período de teste?" answer="Você tem 14 dias de acesso total para explorar todas as funcionalidades sem compromisso." />
          <AccordionItem question="A Finexa é segura?" answer="Sim! Seus dados são criptografados e utilizamos tecnologias modernas para garantir sua privacidade absoluta." />
          <AccordionItem question="Posso cancelar a qualquer momento?" answer="Com certeza. Não há fidelidade, você tem total liberdade para cancelar sua assinatura quando desejar." />
          <AccordionItem question="Como exporto meus dados?" answer="Você pode exportar seus relatórios e históricos facilmente através das ferramentas de exportação no dashboard principal." />
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-4 relative bg-[#5330ff] overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
           <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-none italic">Sua organização financeira hoje.</h2>
           <Link href="/cadastro" className="inline-block px-12 py-6 bg-white text-[#5330ff] text-2xl font-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all">Começar agora</Link>
           <p className="mt-8 text-white/40 font-bold text-sm tracking-widest uppercase italic">Comece seu teste sem compromisso</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-20 px-4 bg-white border-t border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
          <Logo />
          <p className="text-[#08080f]/40 font-bold text-center max-w-lg leading-relaxed">Gestão inteligente e clara para pessoas reais.</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 font-bold text-sm text-[#08080f]/60">
            <Link href="/termos" className="hover:text-[#5330ff] transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-[#5330ff] transition-colors">Privacidade</Link>
            <a href="mailto:contato@finexa.com.br" className="hover:text-[#5330ff] transition-colors">Suporte por e-mail</a>
          </div>
          <p className="text-[11px] font-bold text-[#08080f]/30 uppercase tracking-[0.2em] italic">
            © 2026 FINEXA by passadore. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
}
