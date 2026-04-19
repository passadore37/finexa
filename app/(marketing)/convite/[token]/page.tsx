'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, AlertTriangle, Eye, EyeOff, Users } from 'lucide-react';

// BUG-01 / BUG-02 / BUG-07 / BUG-12:
// Antes, a página aceitava o convite (PATCH) e fazia o onboarding inline ANTES da confirmação
// de email, sem sessão. Isso causava 401 em /api/onboarding e family_id nunca era salvo.
// Agora o fluxo é: cadastro → PATCH convite → /verificar-email → login → /onboarding (via is_invitee)

export default function ConvitePage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus]   = useState<'carregando' | 'valido' | 'invalido'>('carregando');
  const [familia, setFamilia] = useState<{ nome: string; plano: string } | null>(null);
  const [emailConvite, setEmailConvite] = useState('');

  const [nome, setNome]       = useState('');
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro]       = useState('');
  const [concluido, setConcluido] = useState(false);

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
      // BUG-07: is_invitee: true para onboarding simplificado
      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha, nome, plano: familia?.plano ?? 'casal', is_invitee: true }),
      });
      const data = await res.json();
      if (!res.ok) { setErro(data.error || 'Erro ao criar conta.'); return; }

      // BUG-01: PATCH convite feito aqui (sem sessão, mas API usa service_role e valida email)
      // O family_id é vinculado antes da confirmação de email — correto agora com
      // validação de email no PATCH (BUG-05 fix)
      if (data.user_id) {
        await fetch('/api/convite', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, user_id: data.user_id }),
        });
      }

      // BUG-02: Não mais onboarding inline sem sessão.
      // Usuário vai confirmar email → login → /onboarding (que detecta is_invitee=true)
      setConcluido(true);
    } catch { setErro('Erro de conexão.'); }
    finally { setLoading(false); }
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

  // BUG-12: Tela de conclusão redirecionando para verificar-email, não para dashboard direto
  if (concluido) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#5330ff]/15 flex items-center justify-center mx-auto">
          <Users className="h-8 w-8 text-[#5330ff]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground mb-2">Quase lá! 🎉</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sua conta foi criada e você já está vinculado à família <strong className="text-foreground">{familia?.nome}</strong>.<br />
            Confirme seu e-mail para entrar e completar seu perfil.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-[#5330ff]/8 border border-[#5330ff]/20 text-left space-y-1.5">
          <p className="text-xs font-black text-foreground">Próximos passos:</p>
          <p className="text-xs text-muted-foreground">📧 Confirme seu e-mail <strong>{email}</strong></p>
          <p className="text-xs text-muted-foreground">🔐 Faça login com a senha que criou</p>
          <p className="text-xs text-muted-foreground">👤 Complete seu perfil (nome + salário)</p>
          <p className="text-xs text-muted-foreground">📊 Acesse o dashboard da família</p>
        </div>
        <a href={`/verificar-email?email=${encodeURIComponent(email)}`}
          className="block py-3 rounded-xl font-black text-base text-white text-center"
          style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
          Ver instruções de confirmação →
        </a>
        <a href={`/login?email=${encodeURIComponent(email)}`}
          className="block text-sm font-bold text-[#5330ff] hover:underline">
          Já confirmei → Fazer login
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#5330ff]/8 rounded-full blur-[120px]" />
      </div>
      <div className="w-full max-w-md space-y-6">
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
              { label: 'E-mail',   value: email, set: setEmail, type: 'email', placeholder: 'seu@email.com',
                // Se o email veio do convite, deixa como readonly para evitar troca
                readonly: !!emailConvite },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">{f.label}</label>
                <input type={f.type} value={f.value} onChange={e => !f.readonly && f.set(e.target.value)} required
                  placeholder={f.placeholder} readOnly={f.readonly}
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors read-only:opacity-70 read-only:cursor-not-allowed" />
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
      </div>
    </div>
  );
}
