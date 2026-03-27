'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock: simula login rápido
    await new Promise((r) => setTimeout(r, 1200));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen lp-root flex items-center justify-center px-4 py-20">
      {/* Background orbs */}
      <div className="lp-orb lp-orb-1" style={{ opacity: 0.5 }} />
      <div className="lp-orb lp-orb-2" style={{ opacity: 0.3 }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/50 mb-5">
              <Lock size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Bem-vinda de volta</h1>
            <p className="text-white/50 text-sm mt-2">Entre na sua conta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="leticia@exemplo.com"
                  required
                  className="lp-input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="lp-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Esqueci minha senha
              </a>
            </div>

            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0d0d20] px-3 text-white/30 text-xs">ou</span>
            </div>
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-white/40">
            Ainda não tem conta?{' '}
            <Link href="/cadastro" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Criar conta grátis
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-white/30 text-xs hover:text-white/60 transition-colors">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}
