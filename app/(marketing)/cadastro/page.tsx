'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Users, UserCircle, CheckCircle2 } from 'lucide-react';
import { NeobrutalistButton, NeobrutalistCard } from '@/components/neobrutalist';
import { Logo } from '@/components/logo';

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
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 lp-noise">
      <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <NeobrutalistCard className="!p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex mb-4">
              <Logo showText={false} className="scale-125" />
            </div>
            <h1 className="text-3xl font-black text-[#08080f] dark:text-white tracking-tighter">
              Crie sua conta
            </h1>
            <p className="text-[#08080f]/60 dark:text-white/60 font-bold mt-2 italic">
              7 dias grátis · Sem cartão de crédito
            </p>
          </div>

          {/* Seleção de plano - Neobrutalist Style */}
          <div className="mb-10">
            <label className="block text-xs font-black text-[#08080f] dark:text-white uppercase tracking-widest mb-4">
              Escolha seu plano
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {planos.map((p) => {
                const Icon = p.icone;
                const selecionado = planoSelecionado === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanoSelecionado(p.id)}
                    className={`relative flex flex-col items-center gap-2.5 py-5 px-3 border-2 transition-all cursor-pointer ${
                      selecionado
                        ? 'bg-[#fff245] border-[#08080f] shadow-[4px_4px_0px_0px_rgba(8,8,15,1)] -translate-x-1 -translate-y-1'
                        : 'bg-white dark:bg-[#111118] border-[#08080f]/10 dark:border-white/10 hover:border-[#08080f] dark:hover:border-white opacity-60 hover:opacity-100'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black bg-[#ff64ca] text-white px-2 py-0.5 border-2 border-[#08080f] shadow-[2px_2px_0px_0px_rgba(8,8,15,1)] whitespace-nowrap z-10">
                        POPULAR
                      </span>
                    )}
                    <Icon size={20} className={selecionado ? 'text-[#08080f]' : 'text-[#08080f]/40 dark:text-white/40'} />
                    <span className={`text-sm font-black text-[#08080f] ${selecionado ? 'opacity-100' : 'opacity-40 dark:text-white'}`}>{p.nome}</span>
                    <span className={`text-[11px] font-bold ${selecionado ? 'text-[#08080f]/70' : 'text-[#08080f]/30 dark:text-white/30'}`}>{p.preco}</span>
                    {selecionado && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 size={16} className="text-[#08080f]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block text-xs font-black text-[#08080f] dark:text-white uppercase tracking-widest mb-2">
                  Seu nome
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#08080f]/40 dark:text-white/40 group-focus-within:text-[#5330ff] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Leticia Passadore"
                    required
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#111118] font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff] transition-all"
                  />
                </div>
              </div>

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
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#111118] font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff] transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black text-[#08080f] dark:text-white uppercase tracking-widest mb-2">
                Escolha uma senha
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
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-[#08080f] dark:border-white bg-white dark:bg-[#111118] font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff] transition-all"
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

            <NeobrutalistButton 
              type="submit" 
              className="w-full py-4 text-lg mt-4" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Criar minha conta <ArrowRight size={20} />
                </>
              )}
            </NeobrutalistButton>
          </form>

          <p className="text-center font-bold text-[#08080f]/30 dark:text-white/30 text-[10px] mt-8 leading-relaxed uppercase tracking-widest">
            Ao clicar, você concorda com nossos{' '}
            <a href="#" className="underline hover:text-[#08080f] dark:hover:text-white">Termos</a>
            {' '}e{' '}
            <a href="#" className="underline hover:text-[#08080f] dark:hover:text-white">Privacidade</a>.
          </p>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[#08080f]/10 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-[#111118] px-4 font-black text-[#08080f]/30 dark:text-white/30 text-xs tracking-widest">
                OU
              </span>
            </div>
          </div>

          <p className="text-center font-bold text-[#08080f]/60 dark:text-white/60">
            Já tem conta?{' '}
            <Link href="/login" className="text-[#ff64ca] hover:underline">
              Entrar agora
            </Link>
          </p>
        </NeobrutalistCard>

        {/* Back to home */}
        <p className="text-center mt-8">
          <Link href="/" className="font-bold text-[#08080f]/40 dark:text-white/40 hover:text-[#08080f] dark:hover:text-white transition-colors inline-flex items-center gap-2">
            ← Voltar para o início
          </Link>
        </p>
      </div>
    </div>
  );
}
