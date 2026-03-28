import React from 'react';
import { Logo } from '@/components/logo';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-[#08080f] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-500">
          <Logo className="mx-auto mb-6 scale-125" showText={false} />
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 uppercase italic">Política de Privacidade</h1>
          <p className="text-[#08080f]/40 font-bold uppercase tracking-widest text-sm">Atualizada em 2026</p>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-black/5 rounded-[3rem] p-10 shadow-2xl space-y-12 leading-relaxed animate-in fade-in zoom-in-95 duration-700 delay-200">
          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-[#5330ff] decoration-4">1. Coleta de Dados</h2>
            <p className="text-[#08080f]/70 font-medium">Coletamos apenas as informações necessárias para sua conta (nome, e-mail) e os dados financeiros que você inserir manualmente no sistema. Não compartilhamos seus dados com terceiros para fins de marketing.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-[#ff64ca] decoration-4">2. Segurança dos Dados</h2>
            <p className="text-[#08080f]/70 font-medium">Utilizamos criptografia moderna e práticas de segurança avançadas para proteger suas informações financeiras. Seus dados são armazenados de forma segura e o acesso é restrito apenas a você.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-[#01b695] decoration-4">3. Seus Direitos</h2>
            <p className="text-[#08080f]/70 font-medium">De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem o direito de acessar, corrigir, exportar ou solicitar a exclusão de seus dados a qualquer momento através do seu dashboard.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-emerald-500 decoration-4">4. Cookies</h2>
            <p className="text-[#08080f]/70 font-medium">Utilizamos apenas cookies essenciais para manter sua sessão ativa e garantir o funcionamento correto do PWA. Não rastreamos sua navegação externa.</p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4 tracking-tight uppercase italic underline decoration-yellow-500 decoration-4">5. Contato</h2>
            <p className="text-[#08080f]/70 font-medium">Para qualquer dúvida sobre sua privacidade, entre em contato através do e-mail: contato@finexa.com.br</p>
          </section>
        </div>

        <div className="mt-16 text-center">
          <a href="/" className="font-bold text-[#08080f]/30 hover:text-[#08080f] transition-all">← Voltar para a página inicial</a>
        </div>
      </div>
    </div>
  );
}
