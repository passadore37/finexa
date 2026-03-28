'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gray-50/50">
      {/* Background Decoração Glassmorphism */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5330ff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#ff64ca]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 p-8 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex mb-6 hover:scale-110 transition-transform duration-300">
              <Logo showText={false} className="scale-125" />
            </div>
            <h1 className="text-3xl font-black text-[#08080f] tracking-tight">
              Bem-vinda de volta
            </h1>
            <p className="text-[#08080f]/50 font-bold mt-2">
              Continue sua jornada financeira agora
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#08080f]/60 uppercase tracking-widest pl-2 mb-2">
                E-mail
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#08080f]/30 group-focus-within:text-[#5330ff] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail cadastrado"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-black/5 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff]/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#08080f]/60 uppercase tracking-widest pl-2 mb-2">
                Sua Senha
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#08080f]/30 group-focus-within:text-[#5330ff] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-black/5 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff]/20 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#08080f]/40 hover:text-[#08080f] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end p-1">
              <Link href="#" className="text-sm font-bold text-[#5330ff] hover:underline">
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#5330ff] text-white font-black text-xl rounded-2xl shadow-xl shadow-[#5330ff]/20 hover:bg-[#4320ee] hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Entrar <ArrowRight size={20} />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black text-[#08080f]/20 tracking-widest">
              <span className="bg-white px-4">OU</span>
            </div>
          </div>

          {/* Footer link */}
          <p className="text-center font-bold text-[#08080f]/50">
            Novo por aqui?{' '}
            <Link href="/cadastro" className="text-[#ff64ca] hover:underline">
              Crie sua conta
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-10">
          <Link href="/" className="font-bold text-[#08080f]/30 hover:text-[#08080f] transition-all flex items-center justify-center gap-2">
             ← Voltar para a página inicial
          </Link>
        </p>
      </div>
    </div>
  );
}
