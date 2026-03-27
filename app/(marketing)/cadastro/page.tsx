'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Users, UserCircle, CheckCircle2 } from 'lucide-react';

const planos = [
  {
    id: 'individual',
    nome: 'Individual',
    preco: 'R$ 19/mês',
    desc: '1 perfil',
    icone: User,
  },
  {
    id: 'casal',
    nome: 'Casal',
    preco: 'R$ 29/mês',
    desc: '2 perfis · Mais popular',
    icone: Users,
    popular: true,
  },
  {
    id: 'familia',
    nome: 'Família',
    preco: 'R$ 39/mês',
    desc: 'Até 4 perfis',
    icone: UserCircle,
  },
];

export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [planoSelecionado, setPlanoSelecionado] = useState('casal');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen lp-root flex items-center justify-center px-4 py-20">
      {/* Background orbs */}
      <div className="lp-orb lp-orb-1" style={{ opacity: 0.5 }} />
      <div className="lp-orb lp-orb-2" style={{ opacity: 0.3 }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/50 mb-5">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Crie sua conta</h1>
            <p className="text-white/50 text-sm mt-2">7 dias grátis · Sem cartão de crédito</p>
          </div>

          {/* Seleção de plano */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
              Escolha seu plano
            </label>
            <div className="grid grid-cols-3 gap-2">
              {planos.map((p) => {
                const Icon = p.icone;
                const selecionado = planoSelecionado === p.id;
                return (
                  <button
                    key={p.id}
                    id={`plano-${p.id}`}
                    type="button"
                    onClick={() => setPlanoSelecionado(p.id)}
                    className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
                      selecionado
                        ? 'bg-indigo-600/30 border-indigo-500 text-white'
                        : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20 hover:text-white/80'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black bg-amber-400 text-[#0a0a1a] px-1.5 py-0.5 rounded-full whitespace-nowrap">
                        POPULAR
                      </span>
                    )}
                    <Icon size={16} />
                    <span className="text-xs font-bold leading-none mt-1">{p.nome}</span>
                    <span className="text-[10px] leading-none opacity-70">{p.preco}</span>
                    {selecionado && (
                      <CheckCircle2 size={12} className="text-indigo-400 absolute top-2 right-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Seu nome
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Letícia Passadore"
                  required
                  className="lp-input pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email-cadastro" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="email-cadastro"
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
              <label htmlFor="password-cadastro" className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Escolha uma senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  id="password-cadastro"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
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

            <button
              id="btn-cadastro"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Criar minha conta <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/25 text-xs mt-5 leading-relaxed">
            Ao criar sua conta, você concorda com nossos{' '}
            <a href="#" className="underline hover:text-white/50 transition-colors">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="underline hover:text-white/50 transition-colors">Política de Privacidade</a>.
          </p>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0d0d20] px-3 text-white/30 text-xs">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-white/40">
            Já tem conta?{' '}
            <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Entrar
            </Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-white/30 text-xs hover:text-white/60 transition-colors">
            ← Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}
