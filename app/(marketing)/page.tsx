'use client';

import { useState } from 'react';
import Link from 'next/link';
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
            <p className="text-[10px] font-bold uppercase opacity-40 mb-2">Gastos Semanais</p>
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
                  <p className="text-[8px] text-[#ffa857] font-bold">Gastos</p>
                  <p className="text-xs font-bold">R$ 1.2k</p>
               </div>
               <div className="bg-[#01b695]/10 p-2 rounded-xl">
                  <p className="text-[8px] text-[#01b695] font-bold">Reserva</p>
                  <p className="text-xs font-bold">R$ 800</p>
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
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background Gradients (Glassmorphism look) */}
        <div className="absolute -top-10 -left-20 w-[600px] h-[600px] bg-[#5330ff]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-[#ff64ca]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          {/* Texto Hero */}
          <div className="animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#5330ff]/10 text-[#5330ff] rounded-full text-sm font-bold mb-8">
              <span className="w-2 h-2 bg-[#5330ff] rounded-full animate-pulse" />
              Sua jornada financeira começa com clareza
            </div>
            <h1 className="text-6xl md:text-[5.5rem] font-black leading-[0.95] tracking-tight text-[#08080f] mb-8">
              Controle total, <br />
              <span className="bg-gradient-to-r from-[#5330ff] to-[#ff64ca] bg-clip-text text-transparent">simples assim.</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#08080f]/60 mb-12 max-w-xl leading-relaxed">
              Organize seus gastos, planeje seu futuro e tome as rédeas da sua vida financeira com a plataforma mais moderna e intuitiva do mercado.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                href="/cadastro"
                className="px-10 py-5 bg-[#5330ff] text-white text-lg font-bold rounded-full shadow-[0_20px_40px_-10px_rgba(83,48,255,0.4)] hover:bg-[#4320ee] hover:shadow-[0_25px_50px_-12px_rgba(83,48,255,0.5)] transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Teste grátis por 14 dias
              </Link>
              <a href="#como-funciona" className="flex items-center justify-center gap-2 font-bold text-[#08080f]/70 hover:text-[#08080f] transition-colors">
                Ver demonstração <ArrowRight size={20} />
              </a>
            </div>
          </div>

          {/* Imagem Hero */}
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200 flex justify-center">
            <div className="relative z-10 scale-110">
              <MockupApp />
            </div>
            {/* Decoração flutuante com glassmorphism */}
            <div className="absolute top-1/4 -right-10 p-5 bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl animate-bounce duration-[3000ms] hidden md:block">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#01b695] rounded-full flex items-center justify-center text-white shadow-lg">
                     <TrendingUp size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-black/40 uppercase">Evolução</p>
                     <p className="text-lg font-black text-[#08080f]">+R$ 2.400</p>
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
            <h2 className="text-4xl md:text-5xl font-black mb-6">Em apenas 3 passos</h2>
            <p className="text-lg text-[#08080f]/60 leading-relaxed">Desenvolvido para ser o controle financeiro que você realmente usa.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: 'Conecte sua conta', desc: 'Sincronização automática com seu banco para não perder nenhum gasto.', icon: <Zap size={28} />, color: 'bg-blue-500' },
              { title: 'Defina suas metas', desc: 'Quer poupar? Nós criamos o roteiro para você chegar lá com tranquilidade.', icon: <Target size={28} />, color: 'bg-purple-500' },
              { title: 'Visualize tudo', desc: 'Gráficos e insights inteligentes que mostram para onde seu dinheiro vai.', icon: <LucidePieChart size={28} />, color: 'bg-emerald-500' },
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

      {/* ── SEÇÃO: DIFERENCIAIS (CASAL E FAMÍLIA) ── */}
      <section id="diferenciais" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
           {/* Bloco Individual (NEW) */}
           <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
              <div className="order-2 lg:order-1 relative px-4">
                 <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-2xl">
                    <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-6">
                       <User size={32} />
                    </div>
                    <h3 className="text-3xl font-black mb-6">Controle Individual</h3>
                    <div className="space-y-5">
                       {[
                         'Gestão minimalista e ultra rápida',
                         'Categorização inteligente com IA',
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
                 <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1]">
                   Foco total no seu <br />
                   <span className="text-blue-600">sucesso pessoal.</span>
                 </h2>
                 <p className="text-xl text-[#08080f]/60 mb-8 leading-relaxed">
                   Para quem busca independência e clareza total. Cada centavo registrado é um passo em direção à sua liberdade financeira.
                 </p>
                 <Link href="/cadastro" className="font-bold text-blue-600 flex items-center gap-2 hover:gap-4 transition-all group">
                    Descobrir plano individual <ArrowRight size={20} />
                 </Link>
              </div>
           </div>

           {/* Bloco Casal e Família (EXISTING REFINED) */}
           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative order-1 lg:order-2 px-4">
                 <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-2xl">
                    <div className="inline-flex p-3 bg-pink-50 text-pink-500 rounded-2xl mb-6">
                       <Users size={32} />
                    </div>
                    <h3 className="text-3xl font-black mb-6">Gestão em Conjunto</h3>
                    <div className="space-y-5">
                       {[
                         'Sincronização instantânea entre membros',
                         'Divisão de gastos justa e automática',
                         'Metas compartilhadas (ex: viagem, casa)',
                         'Diferenciação clara entre gasto individual e conjunto'
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
                 <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[1.1]">
                   Perfeito para <br />
                   <span className="text-pink-500">casais e famílias.</span>
                 </h2>
                 <p className="text-xl text-[#08080f]/60 mb-8 leading-relaxed">
                   Elimine discussões financeiras. Compartilhe o planejamento, divida as contas e alcance objetivos juntos com transparência absoluta.
                 </p>
                 <Link href="/cadastro" className="font-bold text-pink-500 flex items-center gap-2 hover:gap-4 transition-all">
                    Ver planos familiares <ArrowRight size={20} />
                 </Link>
              </div>
           </div>
        </div>
      </section>

      {/* ── SEÇÃO: PLANOS (PRICING PREMIUM) ── */}
      <section id="planos" className="py-24 px-4 bg-[#08080f] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Planos para todos os tamanhos</h2>
            <p className="text-xl text-white/40 mb-10">Todos os planos incluem test-drive gratuito de 14 dias.</p>
            
            <div className="flex items-center justify-center gap-4 p-1.5 bg-white/5 w-fit mx-auto rounded-full border border-white/10">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
              >
                Mensal
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isAnnual ? 'bg-[#5330ff] text-white' : 'text-white/60 hover:text-white'}`}
              >
                Anual <span className="text-[10px] opacity-70 ml-1">(-20%)</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch pt-4">
            {[
              { 
                name: 'Individual', 
                price: isAnnual ? '19' : '24', 
                features: ['1 perfil completo', 'Sincronização bancária', 'Metas ilimitadas', 'Dashboard inteligente'],
                cta: 'Começar teste agora',
                recom: false
              },
              { 
                name: 'Casal', 
                price: isAnnual ? '34' : '42', 
                features: ['2 perfis vinculados', 'Divisão automática de gastos', 'Metas compartilhadas', 'Relatórios conjuntos', 'Suporte prioritário'],
                cta: 'Escolher Casal',
                recom: true
              },
              { 
                name: 'Família', 
                price: isAnnual ? '59' : '74', 
                features: ['Até 5 perfis', 'Tudo do plano Casal', 'Área kids p/ educação financeira', 'Importação em massa CSV', 'Conciliação bancária premium'],
                cta: 'Assinar Família',
                recom: false
              }
            ].map((plan, i) => (
              <div key={i} className={`relative flex flex-col p-10 rounded-[3rem] transition-all duration-500 hover:scale-[1.02] ${plan.recom ? 'bg-[#5330ff] shadow-[0_40px_80px_-20px_rgba(83,48,255,0.4)] ring-4 ring-white/10' : 'bg-white/5 border border-white/10'}`}>
                {plan.recom && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#5330ff] px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                    Mais Escolhido
                  </div>
                )}
                <h3 className="text-2xl font-black mb-2 italic tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black tracking-tighter">R$ {plan.price}</span>
                  <span className="text-white/40 font-bold">/mês</span>
                </div>
                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm font-medium">
                      <Check className={`flex-shrink-0 ${plan.recom ? 'text-white' : 'text-[#5330ff]'}`} size={18} />
                      <span className="text-white/80">{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/cadastro"
                  className={`w-full py-4 rounded-2xl text-center font-bold text-lg transition-all ${plan.recom ? 'bg-white text-[#5330ff] hover:bg-gray-100 shadow-xl' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  {plan.cta}
                </Link>
                <p className="text-center text-[10px] uppercase font-black tracking-tighter opacity-30 mt-4 leading-none">Experimente por 14 dias sem compromisso</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEÇÃO: FAQ ── */}
      <section id="faq" className="py-24 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Ainda com dúvidas?</h2>
          <p className="text-[#08080f]/50 font-bold italic">Nós respondemos.</p>
        </div>
        <div>
          <AccordionItem 
            question="Como funciona o período de teste?" 
            answer="Ao se cadastrar, você tem 14 dias de acesso total a todas as funcionalidades do plano escolhido. Não pedimos cartão de crédito para começar o teste." 
          />
          <AccordionItem 
            question="Meus dados estão realmente seguros?" 
            answer="Sim! Utilizamos padrões de segurança nível bancário. Seus dados são criptografados e nossa integração via Open Banking é apenas para leitura de extratos." 
          />
          <AccordionItem 
            question="Posso mudar de plano depois?" 
            answer="Com certeza. Você pode fazer upgrade ou downgrade a qualquer momento diretamente nas configurações da sua conta de forma instantânea." 
          />
          <AccordionItem 
            question="Quais bancos são suportados?" 
            answer="Suportamos os principais bancos do Brasil, incluindo Itaú, Bradesco, Nubank, Inter, Santander e Banco do Brasil através de nossa integração segura." 
          />
        </div>
      </section>

      {/* ── CTA FINAL PREMIUM ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#5330ff] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#4320ee_70%)] opacity-50" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
           <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
             Chega de planilhas <br /> complicadas.
           </h2>
           <p className="text-xl md:text-2xl text-white/80 font-medium mb-12 max-w-2xl mx-auto">
             Junte-se a milhares de pessoas que já simplificaram suas vidas financeiras hoje.
           </p>
           <Link
             href="/cadastro"
             className="inline-block px-12 py-6 bg-white text-[#5330ff] text-2xl font-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
           >
             Começar teste de 14 dias
           </Link>
           <p className="mt-8 text-white/40 font-bold text-sm tracking-widest uppercase">Comece agora · Sem cartão de crédito</p>
        </div>
      </section>

      {/* ── FOOTER CLASSIC ── */}
      <footer className="py-20 px-4 bg-white border-t border-black/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-10">
          <Logo />
          <p className="text-[#08080f]/40 font-bold text-center max-w-lg leading-relaxed">
            Nossa missão é trazer clareza e liberdade financeira para todos. Gestão inteligente, feita para pessoas reais.
          </p>
          <div className="h-px w-20 bg-black/5" />
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 font-bold text-sm text-[#08080f]/60">
            <a href="#" className="hover:text-[#5330ff] transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-[#5330ff] transition-colors">Privacidade</a>
            <a href="#" className="hover:text-[#5330ff] transition-colors">Sobre Nós</a>
            <a href="mailto:contato@finexa.com.br" className="hover:text-[#5330ff] transition-colors">Suporte</a>
          </div>
          <p className="text-[11px] font-bold text-[#08080f]/30 uppercase tracking-[0.2em]">
            © 2026 FINEXA SAAS. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
}
