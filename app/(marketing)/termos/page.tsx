import React from 'react';
import { Logo } from '@/components/logo';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-[#08080f] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
          <Logo className="mx-auto mb-6 scale-125" showText={false} />
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase italic">Termos de Uso</h1>
          <p className="text-[#08080f]/40 font-bold uppercase tracking-widest text-sm">Última atualização: 2026</p>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-black/5 rounded-[3rem] p-10 shadow-2xl space-y-12 leading-relaxed animate-in fade-in zoom-in-95 duration-700 delay-200">
          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-[#5330ff] decoration-4">1. Aceitação dos Termos</h2>
            <p className="text-[#08080f]/70 font-medium">Ao acessar e usar a Finexa, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve utilizar o serviço.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-[#ff64ca] decoration-4">2. Descrição do Serviço</h2>
            <p className="text-[#08080f]/70 font-medium">A Finexa é um PWA para controle financeiro pessoal e familiar. O serviço permite o registro manual de transações, definição de metas e visualização de relatórios financeiros.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-[#01b695] decoration-4">3. Responsabilidade do Usuário</h2>
            <p className="text-[#08080f]/70 font-medium">Você é responsável pela precisão dos dados inseridos e pela segurança da sua conta. A Finexa não se responsabiliza por perdas financeiras decorrentes de decisões tomadas com base nas informações fornecidas pelo app.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-blue-500 decoration-4">4. Cancelamento e Reembolso</h2>
            <p className="text-[#08080f]/70 font-medium">Você pode cancelar sua assinatura a qualquer momento. Como oferecemos um período de teste de 14 dias, reembolsos após o pagamento da mensalidade seguem a legislação brasileira vigente.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-purple-500 decoration-4">5. Alterações nos Termos</h2>
            <p className="text-[#08080f]/70 font-medium">Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas através do e-mail cadastrado.</p>
          </section>
        </div>

        <div className="mt-16 text-center">
          <a href="/" className="font-bold text-[#08080f]/30 hover:text-[#08080f] transition-all">← Voltar para a página inicial</a>
        </div>
      </div>
    </div>
  );
}
