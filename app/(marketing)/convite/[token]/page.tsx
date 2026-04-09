'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';

export default function ConvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus]   = useState<'carregando' | 'valido' | 'invalido'>('carregando');
  const [familia, setFamilia] = useState<{ nome: string; plano: string } | null>(null);
  const [emailConvite, setEmailConvite] = useState('');

  // Form de cadastro inline
  const [nome, setNome]       = useState('');
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');
  const [etapa, setEtapa]     = useState<'cadastro' | 'onboarding'>('cadastro');
  const [userId, setUserId]   = useState('');

  // Onboarding do membro convidado
  const [nomeDisplay, setNomeDisplay] = useState('');
  const [salario, setSalario] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch(`/api/convite?token=${token}`).then(r => r.json()).then(data => {
      if (data.ok) {
        setFamilia(data.familia);
        setEmailConvite(data.email ?? '');
        setEmail(data.email ?? '');
        setStatus('valido');
      } else setStatus('invalido');
    });
  }, [token]);

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) { setErro('Senha deve ter pelo menos 8 caracteres.'); return; }
    setLoading(true); setErro('');
    try {
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha, nome, plano: familia?.plano ?? 'casal' }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || 'Erro ao criar conta.'); return; }

      // Aceitar convite
      if (data.user_id) {
        await fetch('/api/convite', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, user_id: data.user_id }),
        });
        setUserId(data.user_id);
        setNomeDisplay(nome);
        setEtapa('onboarding');
      }
    } catch { setErro('Erro de conexão.'); }
    finally { setLoading(false); }
  }

  async function handleOnboarding() {
    setSalvando(true);
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nomeDisplay,
        salario: parseFloat(salario) || 0,
        is_master: false,
        plano: familia?.plano ?? 'casal',
      }),
    });
    setSalvando(false);
    router.push('/dashboard');
  }

  if (status === 'carregando') return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (status === 'invalido') return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-[#EF9F27] mx-auto" />
        <h1 className="text-xl font-black text-foreground">Convite inválido</h1>
        <p className="text-sm text-muted-foreground">Este link é inválido ou já foi utilizado.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#5330ff]/8 rounded-full blur-[120px]" />
      </div>
      <div className="w-full max-w-md space-y-6">

        {etapa === 'cadastro' ? (
          <>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#5330ff] flex items-center justify-center font-black text-white text-3xl mx-auto"
                style={{ boxShadow: '4px 4px 0 #82a1fd60' }}>F</div>
              <h1 className="text-2xl font-black text-foreground">Você foi convidado(a)! 💜</h1>
              <p className="text-sm text-muted-foreground">
                Entre na família <strong className="text-foreground">{familia?.nome}</strong> no Finexa.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <form onSubmit={handleCadastro} className="space-y-4">
                {[
                  { label: 'Seu nome', value: nome, set: setNome, type: 'text', placeholder: 'Como quer ser chamado(a)' },
                  { label: 'E-mail',   value: email, set: setEmail, type: 'email', placeholder: 'seu@email.com' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{f.label}</label>
                    <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} required
                      placeholder={f.placeholder}
                      className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Senha</label>
                  <div className="relative">
                    <input type={mostrar ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} required
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 pr-12 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
                    <button type="button" onClick={() => setMostrar(!mostrar)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {erro && <div className="p-3 rounded-xl border border-red-400/30 bg-red-900/20 text-sm font-bold text-red-400">{erro}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl font-black text-base text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? 'Criando conta...' : 'Criar conta e entrar →'}
                </button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Já tem conta? <a href="/login" className="text-[#5330ff] font-bold hover:underline">Entrar</a>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mx-auto">
                <Check className="h-7 w-7 text-[#1D9E75]" />
              </div>
              <h1 className="text-2xl font-black text-foreground">Conta criada! 🎉</h1>
              <p className="text-sm text-muted-foreground">Confirme seu e-mail e complete seu perfil.</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-black text-foreground">Suas informações</h2>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Como quer ser chamado(a)?</label>
                <input type="text" value={nomeDisplay} onChange={e => setNomeDisplay(e.target.value)}
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Seu salário mensal</label>
                <div className="flex items-center gap-2 bg-background border-2 border-border rounded-xl px-4 py-3 focus-within:border-[#5330ff] transition-colors">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <input type="number" value={salario} onChange={e => setSalario(e.target.value)} placeholder="0"
                    className="flex-1 bg-transparent text-foreground focus:outline-none" />
                </div>
              </div>
              <button onClick={handleOnboarding} disabled={salvando}
                className="w-full py-3.5 rounded-xl font-black text-base text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
                {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {salvando ? 'Salvando...' : 'Ir para o dashboard →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
