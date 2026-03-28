'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  Users, 
  TrendingUp, 
  CreditCard,
  Target,
  Zap,
  ShieldCheck,
  PieChart,
  Layout,
  Lock,
  MousePointer2,
  Calendar,
  Bell,
  BarChart3,
  Flame,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Navbar, Footer } from '@/components/landing-layout';

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const calculatePrice = (monthly: number) => {
    if (isAnnual) {
      const yearlyTotal = monthly * 12 * 0.85;
      return (yearlyTotal / 12).toFixed(2);
    }
    return monthly.toFixed(2);
  };

  return (
    <div className="flex flex-col min-h-screen selection:bg-indigo selection:text-white">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-32 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo/10 border-2 border-indigo/20 rounded-2xl">
              <span className="flex h-2 w-2 rounded-full bg-indigo animate-pulse"></span>
              <span className="text-sm font-bold text-indigo tracking-tight uppercase">Controle Financeiro</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-foreground">
              Seu dinheiro, <br />
              <span className="text-indigo drop-shadow-[4px_4px_0px_var(--indigo-light)]">com clareza.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-medium">
              O controle financeiro que traz clareza para sua vida. Organize seus gastos, defina metas e planeje seu futuro com facilidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Link href="/dashboard">
                <Button size="lg" className="h-16 px-10 text-xl bg-indigo hover:bg-indigo/90 text-white font-black shadow-[8px_8px_0px_0px_#82a1fd] border-2 border-white/10 transition-all hover:-translate-y-1 active:translate-y-0 active:shadow-none">
                  Começar agora <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-background bg-indigo text-white flex items-center justify-center text-[10px] font-bold">+2k</div>
              </div>
            </div>
          </div>
          
          <div className="relative perspective-1000">
            {/* Main Phone Mockup */}
            <div className="relative mx-auto border-[12px] border-card bg-card rounded-[3rem] h-[640px] w-[320px] shadow-2xl overflow-hidden shadow-indigo/30 rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="absolute top-0 w-full h-8 bg-card z-20"></div>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-muted rounded-full z-20"></div>
              
              <div className="bg-background h-full p-5 pt-12 flex flex-col gap-5">
                 {/* Dashboard Simulation */}
                 <div className="space-y-4">
                   <div className="h-40 rounded-[2rem] bg-indigo p-5 text-white relative overflow-hidden shadow-lg">
                      <div className="text-[10px] opacity-80 font-bold uppercase tracking-widest leading-none mb-1">Saldo Total</div>
                      <div className="text-3xl font-black tracking-tighter">R$ 12.450,00</div>
                      <div className="mt-4 flex gap-2">
                        <div className="h-1.5 w-1/2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-white"></div>
                        </div>
                        <div className="text-[8px] font-bold">65% da meta</div>
                      </div>
                      <Flame className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-28 rounded-3xl border-2 border-magenta/20 bg-magenta/5 p-4 flex flex-col justify-between">
                         <TrendingUp className="w-6 h-6 text-magenta" />
                         <div className="text-xs font-black text-magenta">Investimentos</div>
                      </div>
                      <div className="h-28 rounded-3xl border-2 border-teal/20 bg-teal/5 p-4 flex flex-col justify-between">
                         <Target className="w-6 h-6 text-teal" />
                         <div className="text-xs font-black text-teal">Sonhos</div>
                      </div>
                   </div>

                   <div className="space-y-4 pt-2">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Atividade Recente</div>
                      {[
                        { icon: <Plus className="text-teal" />, label: "Salário Mensal", val: "+ R$ 8.500", bg: "bg-teal/10" },
                        { icon: <CreditCard className="text-magenta" />, label: "Supermercado", val: "- R$ 450", bg: "bg-magenta/10" },
                        { icon: <Zap className="text-orange" />, label: "Energia Elétrica", val: "- R$ 280", bg: "bg-orange/10" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-card border border-border">
                          <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                            {item.icon}
                          </div>
                          <div className="flex-grow">
                            <div className="text-xs font-bold leading-none mb-1">{item.label}</div>
                            <div className="text-[10px] text-muted-foreground font-medium">Hoje, 14:30</div>
                          </div>
                          <div className="text-xs font-black">{item.val}</div>
                        </div>
                      ))}
                   </div>
                 </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-12 top-20 p-4 bg-background border-4 border-orange rounded-2xl shadow-xl animate-bounce duration-[4000ms] z-30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange" />
                </div>
                <div>
                   <div className="text-[10px] font-black text-orange uppercase tracking-widest">Alerta</div>
                   <div className="text-sm font-bold leading-tight">Limite Atingido!</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-16 bottom-40 p-5 bg-background border-4 border-magenta rounded-3xl shadow-2xl animate-pulse duration-[5000ms] max-w-[180px] z-30">
               <div className="text-[10px] font-black text-magenta uppercase tracking-widest mb-2">Meta de Casal</div>
               <div className="text-xl font-black mb-3 leading-none">Viagem Bali</div>
               <div className="h-2 w-full bg-magenta/10 rounded-full overflow-hidden">
                 <div className="h-full w-[85%] bg-magenta"></div>
               </div>
               <div className="text-right text-[10px] font-bold text-magenta mt-1 italic">85% Completo</div>
            </div>

            <div className="absolute -left-20 bottom-20 p-4 bg-white dark:bg-zinc-900 border-4 border-teal rounded-2xl shadow-2xl z-20">
              <BarChart3 className="w-12 h-12 text-teal" />
            </div>
          </div>
        </section>

        {/* Missão Section */}
        <section id="missao" className="bg-card/50 py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground uppercase italic leading-none">O caos financeiro <br /><span className="text-indigo">acaba aqui.</span></h2>
              <p className="text-xl text-muted-foreground font-medium">Gerenciar dinheiro não deveria ser uma fonte de estresse. É hora de retomar o controle.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { 
                  q: "Quanto gastei esse mês?", 
                  color: "border-indigo", 
                  icon: <PieChart className="w-8 h-8 text-indigo" />, 
                  desc: "Pare de brigar por planilhas complexas. Tenha visibilidade total em tempo real.",
                  accent: "bg-indigo/5"
                },
                { 
                  q: "Para onde vai meu dinheiro?", 
                  color: "border-teal", 
                  icon: <SearchIcon color="var(--teal)" />, 
                  desc: "Pare de brigar por planilhas complexas. Tenha visibilidade total em tempo real.",
                  accent: "bg-teal/5"
                },
                { 
                  q: "Como economizar mais?", 
                  color: "border-magenta", 
                  icon: <Flame className="w-8 h-8 text-magenta" />, 
                  desc: "Pare de brigar por planilhas complexas. Tenha visibilidade total em tempo real.",
                  accent: "bg-magenta/5"
                }
              ].map((item, idx) => (
                <div key={idx} className={`p-10 bg-background border-4 ${item.color} rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-3 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)] group`}>
                  <div className={`w-16 h-16 rounded-2xl ${item.accent} flex items-center justify-center mb-8 border-2 border-current/10 transition-transform group-hover:rotate-6`}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-6 leading-tight text-foreground">{item.q}</h3>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section id="como-funciona" className="py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-20">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-black tracking-tight uppercase italic text-foreground">Simples como deve ser.</h2>
                <div className="w-24 h-2 bg-indigo mx-auto rounded-full"></div>
              </div>

              {/* Horizontal Flow Desktop / Stacked Mobile */}
              <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Connector lines (Desktop) */}
                <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-1 bg-dashed-border -z-10"></div>
                
                {[
                  { 
                    step: "01", 
                    title: "Lance seus gastos", 
                    desc: "Registros rápidos e intuitivos, direto no seu celular ou computador.",
                    icon: <Plus className="w-10 h-10 text-orange" />,
                    color: "border-orange"
                  },
                  { 
                    step: "02", 
                    title: "Projeção e Alertas", 
                    desc: "Acompanhamento gráfico com alertas inteligentes e projeção automática de custos.",
                    icon: <Bell className="w-10 h-10 text-indigo" />,
                    color: "border-indigo"
                  },
                  { 
                    step: "03", 
                    title: "Acompanhe a evolução", 
                    desc: "Gráficos claros que mostram exatamente para onde seu dinheiro está indo.",
                    icon: <BarChart3 className="w-10 h-10 text-teal" />,
                    color: "border-teal"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: `${idx * 200}ms` }}>
                    <div className={`w-24 h-24 rounded-full bg-background border-4 ${item.color} flex items-center justify-center shadow-lg relative z-10 bg-white dark:bg-zinc-900`}>
                      {item.icon}
                      <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full ${item.color.replace('border-', 'bg-')} text-white flex items-center justify-center font-black text-xs italic border-4 border-background`}>
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-black mb-4 uppercase text-foreground">{item.title}</h4>
                      <p className="text-muted-foreground font-medium text-lg leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Diferenciais Section - Grid Mode */}
        <section id="diferenciais" className="bg-foreground py-32 text-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
               <div className="max-w-xl space-y-6 text-left">
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">Diferenciais <br /><span className="text-indigo-light opacity-100">que encantam.</span></h2>
                 <p className="text-xl opacity-90 font-medium">Feito para quem busca eficiência, transparência e design premium.</p>
               </div>
               <div className="hidden md:block">
                  <ArrowRight className="w-20 h-20 text-indigo-light/30 -rotate-45" />
               </div>
             </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { title: "Divisão Proporcional", color: "border-orange", icon: <Users className="w-8 h-8 text-orange" />, desc: "Calculamos a divisão justa baseada na renda de cada um." },
                 { title: "Metas em Conjunto", color: "border-magenta", icon: <Target className="w-8 h-8 text-magenta" />, desc: "Planejem sonhos maiores e acompanhem o progresso real." },
                 { title: "Despesas Fixas", color: "border-teal", icon: <Calendar className="w-8 h-8 text-teal" />, desc: "Nunca mais esqueçam de pagar contas importantes." },
                 { title: "Foco em Privacidade", color: "border-yellow-p", icon: <Lock className="w-8 h-8 text-yellow-p" />, desc: "Seus dados criptografados e controle total sobre quem vê o quê." }
               ].map((item, idx) => (
                 <div key={idx} className={`p-8 bg-zinc-900 border-b-8 ${item.color} rounded-[2rem] flex flex-col items-start transition-all hover:-translate-y-2 hover:bg-zinc-800 text-white`}>
                   <div className="mb-6">{item.icon}</div>
                   <h3 className="text-2xl font-black mb-4 uppercase leading-none tracking-tight text-white">{item.title}</h3>
                   <p className="text-white/70 text-sm font-medium leading-relaxed">{item.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="planos" className="py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-foreground uppercase italic leading-none">Investindo no <br />seu futuro.</h2>
              
              {/* Annual Toggle */}
              <div className="flex items-center justify-center gap-4 mt-10">
                <span className={`text-sm font-bold uppercase tracking-widest ${!isAnnual ? 'text-foreground font-black' : 'text-muted-foreground'}`}>Mensal</span>
                <button 
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-16 h-8 rounded-full bg-secondary border-4 border-indigo/20 relative flex items-center px-1 transition-colors"
                >
                  <div className={`w-4 h-4 rounded-full bg-indigo transition-all duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold uppercase tracking-widest ${isAnnual ? 'text-indigo font-black' : 'text-indigo/50'}`}>Anual</span>
                  <span className="bg-yellow-p text-[10px] font-black px-2 py-0.5 rounded-full text-indigo animate-pulse">-15% OFF</span>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
              {/* Individual Plan */}
              <PlanCard 
                title="Individual"
                price={calculatePrice(19.90)}
                label="Solo"
                color="border-teal"
                accent="text-teal"
                features={["Lançamentos ilimitados", "Categorias personalizáveis", "Análise de gastos", "Alertas de limite"]}
              />

              {/* Casal Plan */}
              <PlanCard 
                title="Casal"
                price={calculatePrice(29.90)}
                label="Para Dois"
                color="border-magenta"
                accent="text-magenta"
                featured
                features={["Tudo do Individual", "Perfis Compartilhados (2)", "Divisão Proporcional", "Metas de Casal"]}
              />

              {/* Família Plan */}
              <PlanCard 
                title="Família"
                price={calculatePrice(49.90)}
                label="Max Social"
                color="border-orange"
                accent="text-orange"
                features={["Tudo do Casal", "Até 4 Perfis Inclusos", "Dashboard Familiar", "Gestão de Dependentes"]}
                footer="Adicional por R$ 7/mês por perfil extra"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 bg-card/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black mb-16 text-center text-foreground uppercase tracking-tight italic">Clareza Total.</h2>
            <Accordion type="single" collapsible className="space-y-6">
              {[
                { q: "Como funciona o período de teste?", a: "Você pode usar todas as funcionalidades sem restrição por 14 dias para sentir a clareza no seu dia a dia." },
                { q: "Posso cancelar a qualquer momento?", a: "Sim! A Finexa não tem contratos de fidelidade. Você cancela com um clique e continua tendo acesso até o fim do período pago." },
                { q: "Como meus dados são protegidos?", a: "Utilizamos criptografia padrão bancário (SSL/AES-256) e auditorias constantes. Privacidade é nossa prioridade total." },
                { q: "Por que foco em controle manual?", a: "Acreditamos que a consciência financeira nasce do registro ativo. A Finexa torna esse processo 5x mais rápido, garantindo que você realmente entenda para onde cada centavo está indo, sem as falhas das integrações automáticas." }
              ].map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-4 border-border rounded-[2rem] px-8 bg-background overflow-hidden transition-all data-[state=open]:border-indigo">
                  <AccordionTrigger className="text-xl font-bold py-8 hover:no-underline text-foreground text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="pb-8 text-muted-foreground font-medium text-lg leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 text-center px-4">
          <div className="max-w-7xl mx-auto bg-indigo border-8 border-foreground p-16 md:p-32 rounded-[4rem] shadow-[24px_24px_0px_0px_var(--foreground)] relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-5xl md:text-9xl font-black text-white mb-10 uppercase tracking-tighter leading-none group-hover:scale-[1.02] transition-transform">Pronto para <br />ter clareza?</h2>
              <p className="text-2xl text-white/90 mb-16 max-w-2xl mx-auto font-medium italic">Transforme o estresse financeiro em tranquilidade compartilhada hoje mesmo.</p>
              <Link href="/dashboard">
                <Button size="lg" className="h-20 px-16 text-2xl bg-white text-indigo hover:bg-zinc-100 font-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] transition-all hover:scale-105 active:translate-y-2">
                  COMEÇAR AGORA
                </Button>
              </Link>
            </div>
            {/* Shapes decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-magenta/20 blur-[100px] -z-0"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal/20 blur-[100px] -z-0"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function PlanCard({ title, price, label, color, accent, features, featured = false, footer = "" }) {
  return (
    <div className={`p-10 bg-background border-4 ${color} ${featured ? 'md:scale-110 md:-translate-y-4' : ''} rounded-[3rem] flex flex-col relative transition-all hover:shadow-2xl overflow-hidden`}>
      {featured && (
        <div className={`absolute -top-0 left-1/2 -translate-x-1/2 ${color.replace('border-', 'bg-')} text-white px-6 py-1.5 rounded-b-2xl text-[10px] font-black uppercase tracking-widest`}>
          Recomendado
        </div>
      )}
      <div className="mb-10 pt-2">
        <h3 className="text-3xl font-black mb-2 text-foreground uppercase tracking-tight italic">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold opacity-50">R$</span>
          <span className="text-5xl font-black tracking-tighter text-foreground leading-none">{price}</span>
          <span className="text-muted-foreground font-bold">/mês</span>
        </div>
        <p className={`text-xs font-black ${accent} mt-3 uppercase tracking-widest italic`}>{label}</p>
      </div>
      <ul className="space-y-5 mb-10 flex-grow">
        {features.map((f, i) => (
          <li key={i} className="flex gap-4 items-center text-sm font-bold text-foreground/80">
            <CheckCircle2 className={`h-6 w-6 shrink-0 ${accent}`} /> 
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-4">
        <Link href="/dashboard" className="w-full">
          <Button className={`w-full h-14 ${featured ? 'bg-indigo text-white' : 'bg-secondary text-foreground hover:bg-secondary/70'} border-4 border-current/10 font-black rounded-2xl text-lg uppercase`}>
            Escolher {title}
          </Button>
        </Link>
        {footer && <p className="text-[10px] text-center font-bold text-muted-foreground opacity-60 italic">{footer}</p>}
      </div>
    </div>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
