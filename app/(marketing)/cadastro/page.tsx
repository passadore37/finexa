'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Lock, Mail, User, Users, UserCircle, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/logo';

const planos = [
  {
    id: 'individual',
    nome: 'Individual',
    preco: 'R$ 19',
    desc: 'Seu controle pessoal',
    icone: User,
  },
  {
    id: 'casal',
    nome: 'Casal',
    preco: 'R$ 34',
    desc: 'Mais popular p/ duplas',
    icone: Users,
    popular: true,
  },
  {
    id: 'familia',
    nome: 'Família',
    preco: 'R$ 59',
    desc: 'Até 5 perfis integrados',
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
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gray-50/50">
      {/* Background Decoração Glassmorphism */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#5330ff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#ff64ca]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white/80 backdrop-blur-xl border border-black/5 p-8 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex mb-4 hover:rotate-6 transition-transform">
              <Logo showText={false} className="scale-125" />
            </div>
            <h1 className="text-3xl font-black text-[#08080f] tracking-tight">
              Crie sua conta
            </h1>
            <p className="text-[#08080f]/50 font-bold mt-2">
              Teste qualquer plano grátis por 14 dias
            </p>
          </div>

          {/* Seleção de plano - Premium Glass */}
          <div className="mb-10">
            <label className="block text-[10px] font-black text-[#08080f]/40 uppercase tracking-[0.2em] mb-4 text-center">
              Selecione o melhor plano para você
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {planos.map((p) => {
                const Icon = p.icone;
                const selecionado = planoSelecionado === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanoSelecionado(p.id)}
                    className={`relative flex flex-col items-center gap-3 py-6 px-3 rounded-2xl border transition-all cursor-pointer ${
                      selecionado
                        ? 'bg-white border-[#5330ff] shadow-xl shadow-[#5330ff]/10 ring-2 ring-[#5330ff]/10 translate-y-[-4px]'
                        : 'bg-white/40 border-black/5 hover:border-black/20 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-black bg-[#ff64ca] text-white px-2 py-0.5 rounded-full shadow-lg">
                        POPULAR
                      </span>
                    )}
                    <div className={`${selecionado ? 'text-[#5330ff]' : 'text-[#08080f]/40'}`}>
                       <Icon size={24} />
                    </div>
                    <div className="text-center">
                       <p className={`text-sm font-black ${selecionado ? 'text-[#08080f]' : 'text-[#08080f]/60'}`}>{p.nome}</p>
                       <p className={`text-[10px] font-bold ${selecionado ? 'text-[#5330ff]' : 'text-[#08080f]/30'}`}>{p.preco}<span className="opacity-50">/mês</span></p>
                    </div>
                    {selecionado && (
                      <div className="absolute top-2 right-2 text-[#01b695]">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block text-xs font-bold text-[#08080f]/60 uppercase tracking-widest pl-2 mb-2">
                  Nome
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#5330ff] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-black/5 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff]/20 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-[#08080f]/60 uppercase tracking-widest pl-2 mb-2">
                  E-mail
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#5330ff] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@mail.com"
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-black/5 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff]/20 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#08080f]/60 uppercase tracking-widest pl-2 mb-2">
                Sua Senha
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-[#5330ff] transition-colors">
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
                  className="w-full pl-11 pr-12 py-4 bg-gray-50 border border-black/5 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-[#5330ff]/20 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#08080f]/30 hover:text-[#08080f] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[#5330ff] text-white font-black text-xl rounded-[1.5rem] shadow-xl shadow-[#5330ff]/20 hover:bg-[#4320ee] hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Iniciar Teste de 14 dias <ArrowRight size={22} />
                </div>
              )}
            </button>
          </form>

          <p className="text-center text-[#08080f]/30 font-bold text-[10px] mt-8 leading-relaxed uppercase tracking-widest">
            Ao criar sua conta, você aceita nossos{' '}
            <a href="#" className="underline hover:text-[#08080f]">Termos</a>
            {' '}e{' '}
            <a href="#" className="underline hover:text-[#08080f]">Privacidade</a>.
          </p>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-black/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black text-[#08080f]/20 tracking-widest">
              <span className="bg-white px-4">OU</span>
            </div>
          </div>

          <p className="text-center font-bold text-[#08080f]/50">
            Já possui uma conta?{' '}
            <Link href="/login" className="text-[#ff64ca] hover:underline">
              Fazer Login
            </Link>
          </p>
        </div>

        {/* Home Back */}
        <p className="text-center mt-10">
          <Link href="/" className="font-bold text-[#08080f]/30 hover:text-[#08080f] transition-all flex items-center justify-center gap-2">
            ← Voltar para o início
          </Link>
        </p>
      </div>
    </div>
  );
}
