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
  Sparkles,
  TrendingDown,
  Plus,
  ArrowUpRight
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
    <div className="flex flex-col min-h-screen selection:bg-indigo selection:text-white overflow-hidden bg-background">
      <Navbar />

      <main className="flex-grow pt-24 relative">
        {/* Background Blobs for Hero */}
        <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-indigo/10 blur-[120px] rounded-full -z-10"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-magenta/10 blur-[120px] rounded-full -z-10"></div>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo border-2 border-indigo-light/20 rounded-2xl shadow-[4px_4px_0px_0px_rgba(83,48,255,0.1)]">
              <span className="flex h-2 w-2 rounded-full bg-yellow-p animate-pulse"></span>
              <span className="text-sm font-black text-white tracking-tight uppercase">Controle Financeiro</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter text-foreground">
              Seu dinheiro, <br />
              <span className="text-indigo drop-shadow-[4px_4px_0px_var(--indigo-light)]">com clareza.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-bold">
              O controle financeiro que traz clareza para sua vida. Organize seus gastos, defina metas e planeje seu futuro com facilidade.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mt-6">
              <Link href="/dashboard">
                <Button size="lg" className="h-16 px-10 text-xl bg-indigo hover:bg-indigo/90 text-white font-black shadow-[8px_8px_0px_0px_var(--indigo-light)] border-[4px] border-white/20 transition-all hover:-translate-y-1 active:translate-y-0 active:shadow-none">
                  COMEÇAR AGORA <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 py-3 px-6 bg-yellow-p border-[4px] border-indigo rounded-2xl shadow-[6px_6px_0px_0px_var(--indigo)] overflow-hidden">
                <div className="p-2 bg-indigo/10 rounded-lg shrink-0">
                  <ShieldCheck className="w-6 h-6 text-indigo" />
                </div>
                <div className="text-sm font-black leading-tight text-indigo">Privacidade Total <br /><span className="text-[10px] opacity-70 uppercase tracking-widest whitespace-nowrap">Controle 100% Pessoal</span></div>
              </div>
            </div>
          </div>
          
          <div className="relative perspective-1000">
            {/* Main Phone Mockup */}
            <div className="relative mx-auto border-[12px] border-card bg-card rounded-[3rem] h-[600px] w-[300px] shadow-2xl overflow-hidden shadow-indigo/30 rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="absolute top-0 w-full h-8 bg-card z-20"></div>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-muted rounded-full z-20"></div>
              
              <div className="bg-background h-full p-5 pt-12 flex flex-col gap-5">
                 {/* Dashboard Simulation */}
                 <div className="space-y-4">
                   <div className="h-40 rounded-[2rem] bg-indigo p-5 text-white relative overflow-hidden shadow-lg border-[2px] border-white/10">
                      <div className="text-[10px] opacity-80 font-black uppercase tracking-widest leading-none mb-1">Saldo Total</div>
                      <div className="text-3xl font-black tracking-tighter">R$ 12.450</div>
                      <div className="mt-4 flex gap-2">
                        <div className="h-1.5 w-1/2 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-white"></div>
                        </div>
                        <div className="text-[8px] font-black uppercase">65% da meta</div>
                      </div>
                      <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-28 rounded-3xl border-[2px] border-magenta bg-magenta/10 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_var(--magenta)]">
                         <TrendingUp className="w-5 h-5 text-magenta" />
                         <div className="text-[10px] font-black text-magenta uppercase">Investidos</div>
                      </div>
                      <div className="h-28 rounded-3xl border-[2px] border-teal bg-teal/10 p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_var(--teal)]">
                         <Target className="w-5 h-5 text-teal" />
                         <div className="text-[10px] font-black text-teal uppercase">Reservas</div>
                      </div>
                   </div>

                   <div className="space-y-4 pt-2">
                      <div className="text-[10px] font-black uppercase text-foreground tracking-widest mb-2 border-b-[2px] border-indigo/20 pb-1">Atividade Recente</div>
                      {[
                        { icon: <Plus className="text-teal" />, label: "Salário", val: "+ R$ 8.5K", color: "text-teal" },
                        { icon: <CreditCard className="text-magenta" />, label: "Mercado", val: "- R$ 450", color: "text-magenta" },
                        { icon: <Zap className="text-orange" />, label: "Energia", val: "- R$ 280", color: "text-orange" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-2 rounded-2xl bg-card border-2 border-border shadow-sm">
                          <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                            {item.icon}
                          </div>
                          <div className="flex-grow text-left">
                            <div className="text-[10px] font-black text-foreground leading-none mb-1">{item.label}</div>
                            <div className="text-[8px] text-muted-foreground font-black uppercase tracking-tighter">Hoje, 14:30</div>
                          </div>
                          <div className={`text-[10px] font-black ${item.color}`}>{item.val}</div>
                        </div>
                      ))}
                   </div>
                 </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-12 top-20 p-4 bg-orange border-[4px] border-indigo rounded-2xl shadow-[8px_8px_0px_0px_var(--indigo)] animate-bounce duration-[4000ms] z-30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                  <Bell className="w-6 h-6 text-orange" />
                </div>
                <div className="text-left text-white">
                   <div className="text-[10px] font-black uppercase tracking-widest leading-none">ALERTA</div>
                   <div className="text-sm font-black leading-tight">Conta Nova!</div>
                </div>
              </div>
            </div>

            <div className="absolute -right-16 bottom-40 p-6 bg-background border-[4px] border-magenta rounded-[2.5rem] shadow-[12px_12px_0px_0px_var(--magenta)] animate-pulse duration-[5000ms] max-w-[200px] z-30">
               <div className="text-[10px] font-black text-magenta uppercase tracking-widest mb-2">Meta</div>
               <div className="text-2xl font-black mb-3 leading-none text-foreground">VIAGEM OK</div>
               <div className="h-3 w-full bg-magenta/10 rounded-full overflow-hidden border-2 border-magenta/20">
                 <div className="h-full w-[85%] bg-magenta"></div>
               </div>
            </div>

            <div className="absolute -left-20 bottom-20 p-6 bg-teal border-[4px] border-indigo rounded-[2rem] shadow-[12px_12px_0px_0px_var(--indigo)] z-20 group hover:scale-110 transition-transform">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
          </div>
        </section>

        {/* Missão Section */}
        <section id="missao" className="bg-secondary/20 py-24 relative">
          <div className="absolute top-[40%] left-[-5%] w-[300px] h-[300px] bg-teal/10 blur-[100px] rounded-full -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase leading-none">O caos financeiro <br /><span className="text-indigo">acaba aqui.</span></h2>
              <p className="text-lg text-muted-foreground font-black leading-relaxed">Gerenciar dinheiro não deveria ser uma fonte de estresse. É hora de retomar o controle com ferramentas feitas para humanos.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { 
                  q: "Quanto gastei esse mês?", 
                  color: "border-indigo", 
                  shadow: "shadow-[12px_12px_0px_0px_var(--indigo)]",
                  titleColor: "text-indigo",
                  icon: <PieChart className="w-8 h-8 text-indigo" />, 
                  desc: "Visualize cada centavo com categorias automáticas e inteligentes.",
                  accent: "bg-indigo/10"
                },
                { 
                  q: "Para onde vai meu dinheiro?", 
                  color: "border-teal", 
                  shadow: "shadow-[12px_12px_0px_0px_var(--teal)]",
                  titleColor: "text-teal",
                  icon: <TrendingDown className="w-8 h-8 text-teal" />, 
                  desc: "Entenda o destino do seu dinheiro com relatórios visuais que não cansam a vista.",
                  accent: "bg-teal/10"
                },
                { 
                  q: "Como economizar mais?", 
                  color: "border-magenta", 
                  shadow: "shadow-[12px_12px_0px_0px_var(--magenta)]",
                  titleColor: "text-magenta",
                  icon: <Sparkles className="w-8 h-8 text-magenta" />, 
                  desc: "Defina orçamentos realistas e receba alertas que ajudam você a parar de gastar sem pensar.",
                  accent: "bg-magenta/10"
                }
              ].map((item, idx) => (
                <div key={idx} className={`p-8 bg-background border-[4px] ${item.color} rounded-[2.5rem] ${item.shadow} transition-all hover:-translate-y-4 hover:shadow-[16px_16px_0px_0px_var(--indigo)] group text-left`}>
                  <div className={`w-14 h-14 rounded-2xl ${item.accent} flex items-center justify-center mb-6 border-[3px] border-current/20 transition-transform group-hover:rotate-6 shadow-sm`}>
                    {item.icon}
                  </div>
                  <h3 className={`text-2xl font-black mb-4 leading-tight ${item.titleColor} uppercase tracking-tight`}>{item.q}</h3>
                  <p className="text-foreground font-black text-base leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section id="como-funciona" className="py-24 overflow-hidden relative">
          <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-orange/10 blur-[120px] rounded-full -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-16">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-foreground">Simples como deve ser.</h2>
                <div className="w-24 h-2 bg-indigo mx-auto rounded-full shadow-[0_4px_0_0_var(--indigo-light)]"></div>
              </div>

              {/* Horizontal Flow Desktop / Stacked Mobile */}
              <div className="grid md:grid-cols-3 gap-16 relative">
                <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-2 bg-indigo/10 rounded-full -z-10"></div>
                
                {[
                  { 
                    step: "01", 
                    title: "LANCE SEUS GASTOS", 
                    desc: "Registros rápidos e intuitivos, direto no seu celular ou computador.",
                    icon: <Plus className="w-8 h-8 text-orange" />,
                    color: "border-orange",
                    shadow: "shadow-[6px_6px_0px_0px_var(--orange)]",
                    numColor: "bg-orange"
                  },
                  { 
                    step: "02", 
                    title: "PROJEÇÃO E ALERTAS", 
                    desc: "Acompanhamento gráfico com alertas inteligentes e projeção automática de custos.",
                    icon: <Bell className="w-8 h-8 text-indigo" />,
                    color: "border-indigo",
                    shadow: "shadow-[6px_6px_0px_0px_var(--indigo)]",
                    numColor: "bg-indigo"
                  },
                  { 
                    step: "03", 
                    title: "ACOMPANHE A EVOLUÇÃO", 
                    desc: "Gráficos claros que mostram exatamente para onde seu dinheiro está indo.",
                    icon: <BarChart3 className="w-8 h-8 text-teal" />,
                    color: "border-teal",
                    shadow: "shadow-[6px_6px_0px_0px_var(--teal)]",
                    numColor: "bg-teal"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center space-y-6">
                    <div className={`w-24 h-24 rounded-[2rem] bg-background border-[4px] ${item.color} flex items-center justify-center ${item.shadow} relative z-10 bg-white dark:bg-zinc-900 transition-all hover:scale-110`}>
                      {item.icon}
                      <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full ${item.numColor} text-white flex items-center justify-center font-black text-xs border-[3px] border-background shadow-lg`}>
                        {item.step}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-3 uppercase text-foreground tracking-tight">{item.title}</h4>
                      <p className="text-muted-foreground font-black text-base leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Diferenciais Section */}
        <section id="diferenciais" className="bg-indigo py-24 text-white relative">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-gradient-to-br from-magenta via-indigo to-teal -z-0"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20 text-left">
               <div className="max-w-2xl space-y-6">
                 <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">Diferenciais <br /><span className="text-yellow-p drop-shadow-[4px_4px_0px_var(--indigo)]">que encantam.</span></h2>
                 <p className="text-xl font-black text-white/90 leading-relaxed uppercase tracking-tight">Design de alto nível para quem não se contenta com o básico.</p>
               </div>
               <div className="hidden md:block">
                  <ArrowUpRight className="w-20 h-20 text-yellow-p" />
               </div>
             </div>
             
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               {[
                 { title: "Divisão Proporcional", color: "border-orange", icon: <Users className="w-8 h-8 text-orange" />, desc: "Calculamos a divisão justa baseada na renda de cada um." },
                 { title: "Metas em Conjunto", color: "border-magenta", icon: <Target className="w-8 h-8 text-magenta" />, desc: "Planejem sonhos maiores e acompanhem o progresso real." },
                 { title: "Despesas Fixas", color: "border-teal", icon: <Calendar className="w-8 h-8 text-teal" />, desc: "Nunca mais esqueçam de pagar contas importantes." },
                 { title: "Foco em Privacidade", color: "border-yellow-p", icon: <Lock className="w-8 h-8 text-yellow-p" />, desc: "Seus dados criptografados e controle total de acesso." }
               ].map((item, idx) => (
                 <div key={idx} className={`p-8 bg-white dark:bg-zinc-900 border-[4px] ${item.color} rounded-[2.5rem] shadow-[10px_10px_0px_0px_var(--indigo-light)] flex flex-col items-start transition-all hover:-translate-y-4`}>
                   <div className="mb-6 p-4 bg-background border-2 border-border rounded-xl shadow-sm">{item.icon}</div>
                   <h3 className="text-xl font-black mb-4 uppercase leading-none tracking-tight text-foreground">{item.title}</h3>
                   <p className="text-muted-foreground font-black text-xs leading-relaxed">{item.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="planos" className="py-24 relative">
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-magenta/5 blur-[120px] rounded-full -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-6">
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-foreground uppercase leading-none">Investindo no <br /><span className="text-indigo">seu futuro.</span></h2>
              
              {/* Annual Toggle */}
              <div className="flex items-center justify-center gap-6 mt-12 bg-secondary p-3 rounded-2xl border-[3px] border-border w-fit mx-auto">
                <span className={`text-xs font-black uppercase tracking-widest ${!isAnnual ? 'text-indigo underline decoration-4 underline-offset-4' : 'text-muted-foreground'}`}>Mensal</span>
                <button 
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="w-16 h-8 rounded-full bg-[#0a0a14] border-[3px] border-indigo relative flex items-center px-1 transition-all"
                >
                  <div className={`w-4 h-4 rounded-full bg-indigo transition-all duration-300 shadow-[0_0_10px_rgba(83,48,255,1)] ${isAnnual ? 'translate-x-[32px]' : 'translate-x-0'}`}></div>
                </button>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black uppercase tracking-widest ${isAnnual ? 'text-indigo underline decoration-4 underline-offset-4' : 'text-muted-foreground'}`}>Anual</span>
                  <span className="bg-yellow-p text-[10px] font-black px-3 py-1 rounded-full text-indigo animate-bounce border-2 border-indigo">-15% OFF</span>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto items-start">
              {/* Individual Plan */}
              <PlanCard 
                title="INDIVIDUAL"
                price={calculatePrice(19.90)}
                label="SOLO"
                color="border-teal"
                btnColor="bg-teal text-white hover:bg-teal/90 shadow-[4px_4px_0px_0px_#000]"
                features={["Lançamentos ilimitados", "Categorias inteligentes", "Análise de gastos", "Alertas de limite"]}
              />

              {/* Casal Plan */}
              <PlanCard 
                title="CASAL"
                price={calculatePrice(29.90)}
                label="PARA DOIS"
                color="border-magenta"
                featured
                btnColor="bg-magenta text-white hover:bg-magenta/90 shadow-[4px_4px_0px_0px_#000]"
                features={["Tudo do Individual", "Perfis Compartilhados (2)", "Divisão Proporcional", "Metas de Casal"]}
              />

              {/* Família Plan */}
              <PlanCard 
                title="FAMÍLIA"
                price={calculatePrice(49.90)}
                label="TIME COMPLETO"
                color="border-orange"
                btnColor="bg-orange text-white hover:bg-orange/90 shadow-[4px_4px_0px_0px_#000]"
                features={["Tudo do Casal", "Até 4 Perfis Inclusos", "Dashboard Familiar", "Gestão de Dependentes"]}
                footer="ADICIONAL R$ 7/MÊS EXTRA"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-indigo/5 relative">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
            <h2 className="text-4xl font-black mb-12 text-center text-foreground uppercase tracking-tight">CLAREZA TOTAL.</h2>
            <Accordion type="single" collapsible className="space-y-6">
              {[
                { q: "COMO FUNCIONA O PERÍODO DE TESTE?", a: "Você pode usar todas as funcionalidades sem restrição por 14 dias para sentir a clareza no seu dia a dia." },
                { q: "POSSO CANCELAR A QUALQUER MOMENTO?", a: "Sim! A Finexa não tem contratos de fidelidade. Você cancela com um clique e continua tendo acesso até o fim do período pago." },
                { q: "COMO MEUS DADOS SÃO PROTEGIDOS?", a: "Utilizamos criptografia padrão bancário (SSL/AES-256) e auditorias constantes. Privacidade é nossa prioridade total." },
                { q: "POR QUE O CONTROLE É ATIVO?", a: "A consciência financeira nasce do registro ativo. A Finexa torna esse processo 5x mais rápido, garantindo que você realmente entenda para onde cada centavo está indo." }
              ].map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-[4px] border-border rounded-[2.5rem] px-8 bg-background overflow-hidden transition-all data-[state=open]:border-indigo shadow-[8px_8px_0px_0px_var(--indigo)/5]">
                  <AccordionTrigger className="text-xl font-black py-8 hover:no-underline text-foreground uppercase tracking-tighter text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="pb-8 text-foreground font-black text-base leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center px-4 relative">
          <div className="max-w-7xl mx-auto bg-indigo border-[6px] border-foreground p-16 md:p-24 rounded-[4rem] shadow-[24px_24px_0px_0px_var(--foreground)] relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-6xl md:text-8xl font-black text-white mb-8 uppercase tracking-tighter leading-none group-hover:scale-[1.02] transition-transform">Pronto para <br />ter clareza?</h2>
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-black uppercase tracking-tight">Transforme o estresse financeiro em tranquilidade compartilhada hoje mesmo.</p>
              <Link href="/dashboard">
                <Button size="lg" className="h-20 px-16 text-2xl bg-yellow-p text-indigo hover:bg-white font-black rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:translate-y-4 active:shadow-none border-[4px] border-indigo">
                  COMEÇAR AGORA
                </Button>
              </Link>
            </div>
            {/* Shapes decorative */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-magenta/30 blur-[130px] -z-0"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal/30 blur-[130px] -z-0"></div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function PlanCard({ title, price, label, color, features, featured = false, footer = "", btnColor = "" }) {
  return (
    <div className={`p-8 bg-background border-[4px] ${color} ${featured ? 'md:scale-105 md:-translate-y-4 shadow-[12px_12px_0px_0px_var(--indigo-light)] z-20' : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]'} rounded-[3rem] flex flex-col relative transition-all hover:shadow-xl overflow-hidden group`}>
      {featured && (
        <div className={`absolute -top-0 left-1/2 -translate-x-1/2 ${color.replace('border-', 'bg-')} text-white px-6 py-1 rounded-b-2xl text-[10px] font-black uppercase tracking-widest border-x-2 border-b-2 border-indigo/20`}>
          RECOMENDADO
        </div>
      )}
      <div className="mb-10 pt-4 text-left">
        <h3 className="text-3xl font-black mb-2 text-foreground uppercase tracking-tighter">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black opacity-50">R$</span>
          <span className="text-5xl font-black tracking-tighter text-foreground leading-none">{price}</span>
          <span className="text-muted-foreground font-black uppercase text-[10px]">/mês</span>
        </div>
        <p className={`text-[10px] font-black p-1 px-3 bg-secondary rounded-lg w-fit mt-3 uppercase tracking-widest ${color.replace('border-', 'text-')}`}>{label}</p>
      </div>
      <ul className="space-y-5 mb-10 flex-grow text-left">
        {features.map((f, i) => (
          <li key={i} className="flex gap-3 items-center text-sm font-black text-foreground">
            <CheckCircle2 className={`h-6 w-6 shrink-0 ${color.replace('border-', 'text-')}`} /> 
            <span className="uppercase tracking-tight">{f}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-4">
        <Link href="/dashboard" className="w-full">
          <Button className={`w-full h-14 ${btnColor} border-[3px] border-black/10 font-black rounded-2xl text-lg uppercase transition-all hover:-translate-y-1`}>
            QUERO {title}
          </Button>
        </Link>
        {footer && <p className="text-[9px] text-center font-black text-muted-foreground opacity-80 uppercase tracking-widest">{footer}</p>}
      </div>
    </div>
  );
}
