'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Loader2, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase';

function VerificarEmailContent() {
  const params = useSearchParams();
  const emailCadastrado = params.get('email') ?? '';

  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado]   = useState(false);
  const [erroReenvio, setErroReenvio] = useState('');  // BUG-10

  async function reenviar() {
    setReenviando(true);
    setErroReenvio('');
    const emailParaReenviar = emailCadastrado ||
      (await createClient().auth.getSession()).data.session?.user?.email || '';
    if (!emailParaReenviar) { setReenviando(false); setErroReenvio('Informe o e-mail para reenvio.'); return; }
    const res = await fetch('/api/auth/reenviar-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailParaReenviar }),
    });
    if (!res.ok) {
      setErroReenvio('Não foi possível reenviar o e-mail. Tente novamente.');
    } else {
      setReenviado(true);
    }
    setReenviando(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#5330ff]/15 flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-[#5330ff]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground mb-2">Confirme seu email</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link para{' '}
            {emailCadastrado
              ? <strong className="text-foreground">{emailCadastrado}</strong>
              : 'o seu email'
            }. Clique nele para ativar sua conta.
          </p>
        </div>

        {reenviado ? (
          <div className="p-4 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/30 flex items-center gap-2 justify-center">
            <Check className="h-4 w-4 text-[#1D9E75]" />
            <p className="text-sm font-bold text-[#1D9E75]">Email reenviado!</p>
          </div>
        ) : (
          <button onClick={reenviar} disabled={reenviando}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-border text-sm font-bold text-muted-foreground hover:text-foreground transition-all disabled:opacity-50">
            {reenviando && <Loader2 className="h-4 w-4 animate-spin" />}
            {reenviando ? 'Enviando...' : 'Reenviar email de confirmação'}
          </button>
        )}

        {erroReenvio && (
          <p className="text-sm font-bold text-[#EF9F27] text-center">{erroReenvio}</p>
        )}

        <p className="text-xs text-muted-foreground">Verifique também a pasta de spam.</p>

        {emailCadastrado && (
          <Link href={`/login?email=${encodeURIComponent(emailCadastrado)}`}
            className="inline-block text-sm font-bold text-[#5330ff] hover:underline">
            Já confirmei → Fazer login →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VerificarEmailContent />
    </Suspense>
  );
}
