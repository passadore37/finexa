'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const Logo = () => (
  <div
    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-lg transition-transform hover:scale-105 active:scale-95"
    style={{ background: '#5330ff', border: '2px solid #82a1fd', boxShadow: '2px 2px 0px 0px #82a1fd' }}
  >
    F
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw error;
      window.location.href = '/dashboard';
    } catch {
      setErro('E-mail ou senha incorretos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Blobs de fundo */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#5330ff]/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#ff64ca]/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground font-medium mb-8 transition-colors text-sm">
          <ArrowLeft size={16} /> Voltar ao início
        </Link>

        <div className="nb-card bg-card p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Logo />
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Entrar no Finexa</h1>
              <p className="text-sm text-muted-foreground">Bem-vinda de volta</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* E-mail */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                E-mail
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="voce@exemplo.com"
                className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 font-medium focus:outline-none focus:border-[#5330ff] transition-colors"
              />
            </div>

            {/* Senha */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Senha</label>
                <button type="button" className="text-xs text-[#5330ff] font-bold hover:underline">
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <input
                  type={mostrar ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} required
                  placeholder="••••••••"
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 pr-12 text-foreground placeholder:text-muted-foreground/50 font-medium focus:outline-none focus:border-[#5330ff] transition-colors"
                />
                <button type="button" onClick={() => setMostrar(!mostrar)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="border-2 border-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400">
                {erro}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="nb-btn bg-[#5330ff] text-white py-4 font-black text-base w-full mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-bold uppercase">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link href="/cadastro" className="font-black text-[#5330ff] hover:underline">
              Começar grátis — 14 dias
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-4">
          🔒 Dados protegidos com criptografia de ponta a ponta
        </p>
      </div>
    </div>
  );
}
