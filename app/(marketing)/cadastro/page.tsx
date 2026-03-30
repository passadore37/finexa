'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, User, Users, Home, Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const Logo = () => (
  <div
    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-lg transition-transform hover:scale-105"
    style={{ background: '#5330ff', border: '2px solid #82a1fd', boxShadow: '2px 2px 0px 0px #82a1fd' }}
  >
    F
  </div>
);

const PLANOS = [
  {
    id: 'individual', nome: 'Individual', preco: 24,
    Icon: User, cor: '#01b695',
    desc: '1 usuário · Controle pessoal completo',
  },
  {
    id: 'casal', nome: 'Casal', preco: 34,
    Icon: Users, cor: '#5330ff',
    desc: '2 usuários · Divisão proporcional ao salário',
    destaque: true,
  },
  {
    id: 'familia', nome: 'Família', preco: 44,
    Icon: Home, cor: '#ffa857',
    desc: 'Até 4 usuários · Visão consolidada da família',
  },
];

function CadastroForm() {
  const params = useSearchParams();
  const [step, setStep] = useState(1);
  const [plano, setPlano] = useState(params.get('plano') || 'casal');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const planoSel = PLANOS.find(p => p.id === plano) || PLANOS[1];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres.'); return; }
    setLoading(true);
    setErro('');
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome, plano } },
      });
      if (error) throw error;
      window.location.href = `/plano?id=${plano}`;
    } catch (err: any) {
      setErro(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#5330ff]/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#01b695]/10 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground font-medium mb-8 transition-colors text-sm">
          <ArrowLeft size={16} /> Voltar ao início
        </Link>

        {/* Indicador de steps */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-black transition-all ${
                  step >= s ? 'bg-[#5330ff] border-[#5330ff] text-white' : 'border-border text-muted-foreground'
                }`}
                style={step >= s ? { boxShadow: '2px 2px 0 #82a1fd' } : {}}
              >
                {step > s ? <Check size={14} /> : s}
              </div>
              {s < 2 && (
                <div className={`h-0.5 w-16 transition-all ${step > s ? 'bg-[#5330ff]' : 'bg-border'}`} />
              )}
            </div>
          ))}
          <span className="text-sm text-muted-foreground font-medium ml-1">
            {step === 1 ? 'Escolha o plano' : 'Crie sua conta'}
          </span>
        </div>

        <div className="nb-card bg-card p-8">
          {step === 1 ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Logo />
                <div>
                  <h1 className="text-2xl font-black text-foreground">Escolha seu plano</h1>
                  <p className="text-sm text-muted-foreground">14 dias grátis · Sem cartão agora</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {PLANOS.map(p => {
                  const sel = plano === p.id;
                  return (
                    <button key={p.id} onClick={() => setPlano(p.id)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer"
                      style={{
                        borderColor: sel ? p.cor : 'var(--border)',
                        background: sel ? `${p.cor}12` : 'transparent',
                        boxShadow: sel ? `3px 3px 0 ${p.cor}50` : 'none',
                        transform: sel ? 'translate(-1px,-1px)' : 'none',
                      }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${p.cor}20`, border: `2px solid ${p.cor}60` }}>
                        <p.Icon size={22} style={{ color: p.cor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-lg text-foreground">{p.nome}</span>
                          {p.destaque && (
                            <span className="text-[10px] font-black bg-[#ff64ca] text-white px-2 py-0.5 rounded-full">
                              POPULAR
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{p.desc}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-black text-foreground">R${p.preco}</div>
                        <div className="text-xs text-muted-foreground">/mês</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button onClick={() => setStep(2)}
                className="nb-btn bg-[#5330ff] text-white py-4 font-black text-base w-full flex items-center justify-center gap-2"
                style={{ borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                Continuar com {planoSel.nome} <ArrowRight size={18} />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Logo />
                <div className="flex-1">
                  <h1 className="text-2xl font-black text-foreground">Crie sua conta</h1>
                  <p className="text-sm text-muted-foreground">
                    Plano {planoSel.nome} · R${planoSel.preco}/mês
                  </p>
                </div>
                <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {[
                  { label: 'Seu nome', value: nome, set: setNome, type: 'text', placeholder: 'Como prefere ser chamada' },
                  { label: 'E-mail', value: email, set: setEmail, type: 'email', placeholder: 'voce@exemplo.com' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                      {f.label}
                    </label>
                    <input
                      type={f.type} value={f.value} onChange={e => f.set(e.target.value)} required
                      placeholder={f.placeholder}
                      className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 text-foreground placeholder:text-muted-foreground/50 font-medium focus:outline-none focus:border-[#5330ff] transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Senha</label>
                  <div className="relative">
                    <input
                      type={mostrar ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} required
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-background border-2 border-border rounded-xl px-4 py-3.5 pr-12 text-foreground placeholder:text-muted-foreground/50 font-medium focus:outline-none focus:border-[#5330ff] transition-colors"
                    />
                    <button type="button" onClick={() => setMostrar(!mostrar)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {erro && (
                  <div className="border-2 border-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400">
                    {erro}
                  </div>
                )}

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ao criar sua conta você concorda com os{' '}
                  <Link href="/termos" className="text-[#5330ff] font-bold hover:underline">Termos de Uso</Link>{' '}
                  e a{' '}
                  <Link href="/privacidade" className="text-[#5330ff] font-bold hover:underline">Política de Privacidade</Link>.
                </p>

                <button type="submit" disabled={loading}
                  className="nb-btn bg-[#5330ff] text-white py-4 font-black text-base w-full mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ borderColor: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                  {loading ? 'Criando conta...' : 'Criar conta grátis — 14 dias'}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta?{' '}
            <Link href="/login" className="font-black text-[#5330ff] hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CadastroForm />
    </Suspense>
  );
}
