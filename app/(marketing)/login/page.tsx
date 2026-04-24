'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

ver
  const [email, setEmail]     = useState(params.get('email') || ''); // Inicializa com o e-mail da URL
  const [senha, setSenha]     = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');
  const [resetEnviado, setResetEnviado] = useState(false);
  const [enviandoReset, setEnviandoReset] = useState(false);

  useEffect(() => {
    createClient().auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = redirect;
    });
  }, [redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErro('');
    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      window.location.href = redirect;
    } catch (err: any) {
      setErro(err.message?.includes('Invalid login') ? 'E-mail ou senha incorretos.' : err.message || 'Erro ao entrar.');
    } finally { setLoading(false); }
  }

  async function handleResetSenha() {
    if (!email) { setErro('Digite seu e-mail para redefinir a senha.'); return; }
    setEnviandoReset(true);
    await fetch('/api/auth/reset-senha', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setResetEnviado(true);
    setEnviandoReset(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#5330ff]/10 rounded-full blur-[100px] -z-10" />
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <div className="nb-card bg-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-lg"
              style={{ background: '#5330ff', border: '2px solid #82a1fd', boxShadow: '2px 2px 0 #82a1fd' }}>F</div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Entrar no Finexa</h1>
              <p className="text-sm text-muted-foreground">Bem-vinda de volta</p>
            </div>
          </div>

          {resetEnviado ? (
            <div className="p-4 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/30 text-center space-y-2">
              <p className="text-sm font-bold text-[#1D9E75]">Email enviado! ✓</p>
              <p className="text-xs text-muted-foreground">Verifique sua caixa de entrada para redefinir a senha.</p>
              <button onClick={() => setResetEnviado(false)} className="text-xs text-[#5330ff] font-bold hover:underline">
                Voltar ao login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {confirmado && (
                <div className="p-3 mb-1 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/30 text-center">
                  <p className="text-sm font-bold text-[#1D9E75]">E-mail confirmado com sucesso! ✓</p>
                  <p className="text-xs text-muted-foreground mt-1">Por segurança, digite sua senha para entrar.</p>
                </div>
              )}
              {erroParam === 'link_expirado' && (
                <div className="p-3 mb-1 rounded-xl bg-[#854F0B]/10 border border-[#854F0B]/30 text-center">
                  <p className="text-sm font-bold text-[#EF9F27]">Link expirado</p>
                  <p className="text-xs text-muted-foreground mt-1">O link de confirmação expirou ou já foi usado. Faça login normalmente ou solicite um novo link.</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="voce@exemplo.com" autoComplete="email"
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Senha</label>
                  <button type="button" onClick={handleResetSenha} disabled={enviandoReset}
                    className="text-xs text-[#5330ff] font-bold hover:underline disabled:opacity-50">
                    {enviandoReset ? 'Enviando...' : 'Esqueci minha senha'}
                  </button>
                </div>
                <div className="relative">
                  <input type={mostrar ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} required
                    placeholder="••••••••" autoComplete="current-password"
                    className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 pr-12 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
                  <button type="button" onClick={() => setMostrar(!mostrar)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {erro && (
                <div className="border-2 border-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400">{erro}</div>
              )}
              <button type="submit" disabled={loading}
                className="nb-btn bg-[#5330ff] text-white py-4 font-black text-base w-full mt-1 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{' '}
            <Link href="/cadastro" className="font-black text-[#5330ff] hover:underline">Começar grátis — 14 dias</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-background" />}><LoginForm /></Suspense>;
}
