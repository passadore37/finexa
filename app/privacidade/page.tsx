import { Navbar, Footer } from '@/components/landing-layout';

export default function PrivacidadePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black mb-8 border-b-4 border-magenta pb-4 uppercase tracking-tighter">Política de Privacidade</h1>
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. Coleta de Dados</h2>
            <p>Para fornecer o serviço, a Finexa coleta informações básicas de cadastro, como e-mail e nome, além dos dados financeiros que você lança manualmente no aplicativo.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. Uso das Informações</h2>
            <p>Seus dados são usados exclusivamente para calcular seu balanço financeiro, gerar relatórios e melhorar as funcionalidades do serviço. Nunca compartilhamos seus dados financeiros com terceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. Segurança dos Dados</h2>
            <p>Utilizamos protocolos de criptografia e segurança modernos para proteger suas informações. No entanto, por se tratar de um serviço online, nenhum sistema é 100% impenetrável, por isso recomendamos senhas fortes e exclusivas.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. Seus Direitos</h2>
          <p>Você tem total direito de acessar, corrigir ou excluir definitivamente seus dados a qualquer momento através das configurações da sua conta.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">5. Cookies</h2>
            <p>Usamos cookies básicos apenas para manter sua sessão ativa e garantir o funcionamento correto do aplicativo.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
