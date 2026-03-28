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
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Navbar, Footer } from '@/components/landing-layout';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block px-3 py-1 bg-accent border border-indigo-light/30 rounded-full">
              <span className="text-xs font-bold text-indigo tracking-wider uppercase">Controle Financeiro Familiar</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Seu dinheiro, <br />
              <span className="text-indigo">com clareza.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg">
              A Finexa é o controle financeiro proporcional feito sob medida para casais e famílias que querem prosperar juntos, sem burocracia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg bg-indigo hover:bg-indigo/90 text-white font-bold shadow-[6px_6px_0px_0px_#82a1fd] border-2 border-white/10 transition-transform active:translate-y-1 active:shadow-none">
                  Começar agora grátis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 sm:mt-0 px-2">
                <CheckCircle2 className="h-4 w-4 text-teal" /> 
                <span>14 dias de teste gratuito</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative mx-auto border-8 border-card bg-card rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl overflow-hidden shadow-indigo/20">
              <div className="absolute top-0 w-full h-6 bg-card z-10"></div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-muted rounded-full z-10"></div>
              <div className="bg-background h-full p-4 pt-10 flex flex-col gap-4">
                 <div className="h-32 rounded-2xl bg-indigo/10 border border-indigo/20 p-4">
                    <div className="w-20 h-3 bg-indigo/20 rounded mb-2"></div>
                    <div className="w-32 h-6 bg-indigo rounded mb-4"></div>
                    <div className="flex justify-between">
                       <div className="w-10 h-10 rounded-full bg-orange/20"></div>
                       <div className="w-10 h-10 rounded-full bg-magenta/20"></div>
                       <div className="w-10 h-10 rounded-full bg-teal/20"></div>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 rounded-2xl border-2 border-magenta/30 bg-magenta/5 p-3"></div>
                    <div className="h-24 rounded-2xl border-2 border-teal/30 bg-teal/5 p-3"></div>
                 </div>
                 <div className="flex-grow rounded-2xl border-2 border-indigo/10 bg-card/50 p-4">
                    <div className="space-y-3">
                       {[1,2,3,4,5].map(i => (
                         <div key={i} className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-muted"></div>
                           <div className="flex-grow">
                             <div className="w-24 h-3 bg-muted rounded mb-1"></div>
                             <div className="w-16 h-2 bg-muted/50 rounded"></div>
                           </div>
                           <div className="w-12 h-4 bg-muted rounded"></div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-magenta/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo/20 rounded-full blur-3xl -z-10"></div>
          </div>
        </section>

        {/* Problema Section */}
        <section id="problema" className="bg-card/50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold italic tracking-tight uppercase">Por que é tão difícil <br />falar de dinheiro?</h2>
              <p className="text-muted-foreground">O caos financeiro é o maior inimigo da harmonia doméstica. Você se identifica com essas perguntas?</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Quanto gastamos esse mês?", color: "border-indigo", icon: <CreditCard className="text-indigo" />, desc: "A falta de visibilidade gera insegurança e estresse desnecessário." },
                { title: "Quem pagou o quê?", color: "border-teal", icon: <Users className="text-teal" />, desc: "Divisões injustas ou confusas criam ressentimento entre o casal." },
                { title: "Por que não sobra nada?", color: "border-magenta", icon: <TrendingUp className="text-magenta" />, desc: "Sem metas claras, o dinheiro escorre pelas mãos sem que você perceba." }
              ].map((item, idx) => (
                <div key={idx} className={`p-8 bg-background border-2 ${item.color} rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-2`}>
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section id="como-funciona" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 space-y-6">
                <h2 className="text-4xl font-bold tracking-tight">Simples como deve ser.</h2>
                <div className="space-y-8 mt-12">
                  {[
                    { step: "01", title: "Lance seus gastos", desc: "Registros rápidos e intuitivos, direto no seu celular ou computador." },
                    { step: "02", title: "Defina proporções", desc: "A Finexa calcula automaticamente quanto cada um deve contribuir." },
                    { step: "03", title: "Acompanhe a evolução", desc: "Gráficos claros que mostram exatamente para onde seu dinheiro está indo." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6">
                      <div className="text-4xl font-black text-indigo/20 italic">{item.step}</div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 w-full grid grid-cols-2 gap-4">
                <div className="aspect-square bg-indigo/5 rounded-3xl border-2 border-indigo/20 flex items-center justify-center">
                  <Smartphone className="h-16 w-16 text-indigo animate-bounce duration-3000" />
                </div>
                <div className="aspect-square bg-teal/5 rounded-3xl border-2 border-teal/20 flex items-center justify-center translate-y-8">
                  <Target className="h-16 w-16 text-teal" />
                </div>
                <div className="aspect-square bg-magenta/5 rounded-3xl border-2 border-magenta/20 flex items-center justify-center">
                  <Zap className="h-16 w-16 text-magenta" />
                </div>
                <div className="aspect-square bg-orange/5 rounded-3xl border-2 border-orange/20 flex items-center justify-center translate-y-8">
                  <ShieldCheck className="h-16 w-16 text-orange" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diferenciais Section */}
        <section id="diferenciais" className="bg-indigo py-24 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="mb-16">
               <h2 className="text-4xl font-bold mb-4">Diferenciais que encantam.</h2>
               <p className="text-indigo-light">Feito para quem busca eficiência e design.</p>
             </div>
             
             <div className="flex gap-6 overflow-x-auto pb-12 scrollbar-none snap-x">
               {[
                 { title: "Divisão Proporcional", color: "bg-orange", desc: "Calculamos a divisão justa baseada na renda de cada um." },
                 { title: "Metas em Conjunto", color: "bg-magenta", desc: "Planejem sonhos maiores e acompanhem o progresso real." },
                 { title: "Despesas Fixas", color: "bg-teal", desc: "Nunca mais esqueçam de pagar contas importantes." },
                 { title: "Privacidade e Segurança", color: "bg-yellow-p", dark: true, desc: "Seus dados criptografados e seguros conosco." },
                 { title: "PWA Nativo", color: "bg-white", dark: true, desc: "Instale como um app sem ocupar espaço no celular." }
               ].map((item, idx) => (
                 <div key={idx} className={`flex-shrink-0 w-80 p-8 rounded-[2rem] snap-start border-2 border-white/10 ${item.color} ${item.dark ? 'text-indigo' : 'text-white shadow-xl'} shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]`}>
                   <h3 className="text-2xl font-black mb-4 uppercase leading-tight">{item.title}</h3>
                   <p className={item.dark ? 'text-indigo/80' : 'text-white/80'}>{item.desc}</p>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="planos" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-bold">Investindo no seu futuro.</h2>
              <p className="text-muted-foreground">Teste todas as funcionalidades por 14 dias sem compromisso.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 bg-background border-2 border-border rounded-[2.5rem] flex flex-col hover:border-indigo/50 transition-colors">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Individual</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">R$ 19,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-sm text-teal font-bold mt-2 italic">Perfeito para o controle pessoal.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {["Lançamentos ilimitados", "Categorias personalizáveis", "Análise de gastos", "Acesso via PWA"].map((f, i) => (
                    <li key={i} className="flex gap-3 items-center text-sm">
                      <CheckCircle2 className="h-5 w-5 text-indigo" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className="w-full">
                  <Button variant="outline" className="w-full h-12 border-2 text-indigo font-bold hover:bg-indigo hover:text-white rounded-2xl">Começar Teste Grátis</Button>
                </Link>
              </div>

              <div className="p-8 bg-background border-4 border-indigo rounded-[2.5rem] flex flex-col relative shadow-[12px_12px_0px_0px_rgba(83,48,255,0.1)]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Mais Popular</div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Família / Casais</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">R$ 34,90</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-sm text-magenta font-bold mt-2 italic">Feito para crescerem juntos.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {["Até 4 perfis compartilhados", "Divisão proporcional automática", "Controle de despesas fixas", "Planejamento de metas comuns"].map((f, i) => (
                    <li key={i} className="flex gap-3 items-center text-sm font-medium">
                      <CheckCircle2 className="h-5 w-5 text-indigo" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full h-12 bg-indigo hover:bg-indigo/90 text-white font-bold rounded-2xl">Experimentar Grátis</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-card/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Dúvidas comuns.</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {[
                { q: "Como funciona o período de teste?", a: "Você pode usar todas as funcionalidades sem restrição por 14 dias. Não pedimos cartão de crédito para começar." },
                { q: "Posso cancelar a qualquer momento?", a: "Sim! Não temos fidelidade. Você pode cancelar sua assinatura com um clique nas configurações." },
                { q: "É seguro colocar meus dados financeiros?", a: "Totalmente. Utilizamos criptografia de ponta a ponta e seus dados nunca são compartilhados ou vendidos." },
                { q: "Quais bancos são suportados?", a: "Por enquanto, a Finexa foca no controle manual inteligente e organizado para garantir total consciência de cada gasto, sem integrações automáticas que podem falhar ou comprometer sua privacidade." }
              ].map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-2 border-border rounded-2xl px-6 bg-background">
                  <AccordionTrigger className="text-left font-bold py-6 hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-yellow-p border-4 border-indigo p-12 md:p-24 rounded-[3rem] shadow-[16px_16px_0px_0px_var(--indigo)]">
            <h2 className="text-4xl md:text-6xl font-black text-indigo mb-8 uppercase tracking-tighter">Pronto para <br />ter clareza?</h2>
            <p className="text-xl text-indigo/70 mb-12 max-w-xl mx-auto font-medium italic">Junte-se a pessoas que já estão transformando sua relação com o dinheiro.</p>
            <Link href="/dashboard">
              <Button size="lg" className="h-16 px-12 text-xl bg-indigo hover:bg-indigo/90 text-white font-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                COMEÇAR AGORA GRÁTIS
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
