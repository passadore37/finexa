import { Navbar, Footer } from '@/components/landing-layout';

export default function TermosPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black mb-8 border-b-4 border-indigo pb-4 uppercase tracking-tighter">Termos de Uso</h1>
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
            <p>Ao acessar e usar a Finexa, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar o serviço.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. Uso do Serviço</h2>
            <p>A Finexa fornece uma ferramenta de gestão financeira manual. Você é responsável por manter a confidencialidade de sua conta e senha e por todas as atividades que ocorrem em sua conta.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. Assinaturas e Pagamentos</h2>
            <p>Oferecemos um período de teste gratuito de 14 dias. Após este período, para continuar utilizando as funcionalidades premium, será necessária a contratação de um plano pago. O cancelamento pode ser feito a qualquer momento através das configurações da conta.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. Limitação de Responsabilidade</h2>
            <p>A Finexa não se responsabiliza por decisões financeiras tomadas com base nas informações contidas no aplicativo. O serviço é fornecido "como está", sem garantias de qualquer tipo.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">5. Alterações nos Termos</h2>
            <p>Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas através do e-mail cadastrado ou avisos no aplicativo.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
