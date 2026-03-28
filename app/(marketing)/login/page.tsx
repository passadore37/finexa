'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';
import { NeobrutalistButton, NeobrutalistCard } from '@/components/neobrutalist';
import { Logo } from '@/components/logo';

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
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 lp-noise">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <NeobrutalistCard className="!p-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex mb-6">
              <Logo showText={false} className="scale-125" />
            </div>
            <h1 className="text-3xl font-black text-[#08080f] dark:text-white tracking-tighter">
              Bem-vinda de volta
            </h1>
            <p className="text-[#08080f]/60 dark:text-white/60 font-bold mt-2">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-black text-[#08080f] dark:text-white uppercase tracking-widest mb-2">
                E-mail
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#08080f]/40 dark:text-white/40 group-focus-within:text-[#5330ff] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="leticia@exemplo.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#111118] font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff] focus:ring-offset-2 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black text-[#08080f] dark:text-white uppercase tracking-widest mb-2">
                Senha
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#08080f]/40 dark:text-white/40 group-focus-within:text-[#5330ff] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#111118] font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff] focus:ring-offset-2 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#08080f]/40 hover:text-[#08080f] dark:text-white/40 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="#" className="text-sm font-bold text-[#5330ff] hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <NeobrutalistButton 
              type="submit" 
              className="w-full py-4 text-lg" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar <ArrowRight size={20} />
                </>
              )}
            </NeobrutalistButton>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[#08080f]/10 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-[#111118] px-4 font-black text-[#08080f]/30 dark:text-white/30 text-xs uppercase tracking-widest">
                ou
              </span>
            </div>
          </div>

          {/* Footer link */}
          <p className="text-center font-bold text-[#08080f]/60 dark:text-white/60">
            Ainda não tem conta?{' '}
            <Link href="/cadastro" className="text-[#ff64ca] hover:underline">
              Criar conta grátis
            </Link>
          </p>
        </NeobrutalistCard>

        {/* Back to home */}
        <p className="text-center mt-8">
          <Link href="/" className="font-bold text-[#08080f]/40 dark:text-white/40 hover:text-[#08080f] dark:hover:text-white transition-colors inline-flex items-center gap-2">
            ← Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}
