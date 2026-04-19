'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Loader2, Users, Wallet, CalendarDays,
         Shield, UserPlus, Copy, Mail, Lock, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

type Plano = 'individual' | 'casal' | 'familia';

interface MembroFamilia {
  email: string;
  podeVerGeral: boolean;
  podeVerOutros: boolean;
  linkGerado?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { perfil, user, reloadPerfil } = useAuth();
  const [salvando, setSalvando] = useState(false);
  const isInvitee = user?.user_metadata?.is_invitee || false;

  // Dados do onboarding
  const [plano, setPlano]         = useState<Plano>('casal');
  const [nome, setNome]           = useState('');
  const [salario, setSalario]     = useState('');
  const [salParceiro, setSalParceiro] = useState('');
  const [fixas, setFixas]         = useState([{ descricao: '', valor: '' }]);
  const [emailParceiro, setEmailParceiro] = useState('');
  const [linkConvite, setLinkConvite] = useState('');
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [membros, setMembros]     = useState<MembroFamilia[]>([{ email: '', podeVerGeral: true, podeVerOutros: true }]);
  const [linksGerados, setLinksGerados] = useState<{email: string; url: string}[]>([]);
  const [privacidade, setPrivacidade] = useState('aberta');

  // Passo atual
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome ?? '');
      setPlano((perfil.plano as Plano) ?? 'casal');
    }
  }, [perfil]);

  // Passos por perfil
  const passos = {
    individual: ['plano', 'perfil', 'fixas', 'pronto'],
    casal:      ['plano', 'perfil', 'fixas', 'convite', 'pronto'],
    familia:    ['plano', 'perfil', 'fixas', 'privacidade', 'convites', 'pronto'],
    convidado:  ['perfil', 'pronto']
  };

  const etapas = passos[isInvitee ? 'convidado' : plano];
  const etapaAtual = etapas[passo];
  const isUltimo = passo === etapas.length - 1;
  const totalPassos = etapas.length - 1; // sem contar 'pronto'

  async function gerarLinkConvite(email: string): Promise<string> {
    const res = await fetch('/api/convite', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return data.url ?? '';
  }

  async function avancar() {
    // Salvar ao sair do passo 'perfil'
    if (etapaAtual === 'perfil') {
      setSalvando(true);
      await fetch('/api/onboarding', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome, salario: parseFloat(salario) || 0,
          salario_parceiro: isInvitee ? undefined : parseFloat(salParceiro) || 0,
          plano: isInvitee ? undefined : plano, 
          is_master: !isInvitee,
        }),
      });
      // Recarregar perfil para o header mostrar o nome correto
      await reloadPerfil?.();
      setSalvando(false);
    }

    // Salvar fixas ao sair do passo 'fixas'
    if (etapaAtual === 'fixas') {
      const contasFixas = fixas
        .filter(f => f.descricao && parseFloat(f.valor) > 0)
        .map(f => ({ id: Date.now().toString() + Math.random(), descricao: f.descricao, valor: parseFloat(f.valor), categoria: 'Outros' }));
      setSalvando(true);
      await fetch('/api/onboarding', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          salario: parseFloat(salario) || 0,
          salario_parceiro: isInvitee ? undefined : parseFloat(salParceiro) || 0,
          contas_fixas: contasFixas,
          plano: isInvitee ? undefined : plano,
          is_master: !isInvitee,
        }),
      });
      await reloadPerfil?.();
      setSalvando(false);
    }

    // Salvar modo de privacidade Família
    if (etapaAtual === 'privacidade') {
      setSalvando(true);
      await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_master: true, privacidade }),
      });
      setSalvando(false);
    }

    // Gerar link de convite para casal
    if (etapaAtual === 'convite' && emailParceiro && !linkConvite) {
      setSalvando(true);
      const url = await gerarLinkConvite(emailParceiro);
      setLinkConvite(url);
      setSalvando(false);
      return; // ficar na tela para mostrar o link
    }

    // Gerar links para família
    if (etapaAtual === 'convites') {
      setSalvando(true);
      const links: {email: string; url: string}[] = [];
      for (const m of membros.filter(m => m.email)) {
        const url = await gerarLinkConvite(m.email);
        links.push({ email: m.email, url });
      }
      setLinksGerados(links);
      setSalvando(false);
      if (links.length > 0) return;
    }

    if (etapaAtual === 'pronto') {
      router.push('/dashboard');
      return;
    }

    setPasso(p => p + 1);
  }

  function copiarLink(link: string, idx?: number) {
    navigator.clipboard.writeText(link);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  const fmt = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? '' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#5330ff] flex items-center justify-center font-black text-white text-2xl mx-auto mb-3"
            style={{ boxShadow: '4px 4px 0 #82a1fd60' }}>F</div>
          {etapaAtual !== 'pronto' && (
            <>
              <h1 className="text-2xl font-black text-foreground">Vamos começar!</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Passo {Math.min(passo + 1, totalPassos)} de {totalPassos}
              </p>
            </>
          )}
        </div>

        {/* Barra de progresso */}
        {etapaAtual !== 'pronto' && (
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-[#5330ff] rounded-full transition-all duration-500"
              style={{ width: `${(passo / totalPassos) * 100}%` }} />
          </div>
        )}

        {/* ── PASSO: PLANO ── */}
        {etapaAtual === 'plano' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black text-foreground">Confirme seu plano</h2>
            <p className="text-sm text-muted-foreground">Você escolheu o plano abaixo. Confirme para continuar.</p>
            <div className="space-y-2">
              {([
                { id: 'individual', label: 'Individual', desc: '1 pessoa · Controle pessoal', cor: '#01b695' },
                { id: 'casal',      label: 'Casal',      desc: '2 pessoas · Divisão proporcional', cor: '#5330ff' },
                { id: 'familia',    label: 'Família',    desc: 'Até 4 pessoas · Visão consolidada', cor: '#ffa857' },
              ] as const).map(p => (
                <button key={p.id} onClick={() => setPlano(p.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all"
                  style={plano === p.id
                    ? { borderColor: p.cor, background: `${p.cor}12` }
                    : { borderColor: 'var(--border)', background: 'transparent' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${p.cor}20` }}>
                    <Users className="h-5 w-5" style={{ color: p.cor }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  {plano === p.id && <Check className="h-4 w-4" style={{ color: p.cor }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PASSO: PERFIL ── */}
        {etapaAtual === 'perfil' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black text-foreground">Suas informações</h2>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Como quer ser chamado(a)?</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
                className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                {plano === 'individual' ? 'Seu salário' : 'Seu salário mensal'}
              </label>
              <div className="flex items-center gap-2 bg-background border-2 border-border rounded-xl px-4 py-3 focus-within:border-[#5330ff] transition-colors">
                <span className="text-sm text-muted-foreground">R$</span>
                <input type="number" value={salario} onChange={e => setSalario(e.target.value)} placeholder="0"
                  className="flex-1 bg-transparent text-foreground focus:outline-none" />
              </div>
            </div>
            {!isInvitee && plano !== 'individual' && (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Salário estimado do cônjuge/parceiro(a) <span className="normal-case text-[10px]">(pode alterar depois)</span>
                </label>
                <div className="flex items-center gap-2 bg-background border-2 border-border rounded-xl px-4 py-3 focus-within:border-[#5330ff] transition-colors">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <input type="number" value={salParceiro} onChange={e => setSalParceiro(e.target.value)} placeholder="0"
                    className="flex-1 bg-transparent text-foreground focus:outline-none" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Usado para divisão proporcional. O cônjuge/parceiro(a) confirma o valor no próprio onboarding.</p>
              </div>
            )}
          </div>
        )}

        {/* ── PASSO: FIXAS ── */}
        {etapaAtual === 'fixas' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black text-foreground">Contas fixas mensais</h2>
              <p className="text-sm text-muted-foreground mt-1">Aluguel, condomínio, internet... Pode pular e adicionar depois na aba Planejamento.</p>
            </div>
            <div className="space-y-2">
              {fixas.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" placeholder="Ex: Aluguel" value={f.descricao}
                    onChange={e => setFixas(prev => prev.map((x, idx) => idx === i ? { ...x, descricao: e.target.value } : x))}
                    className="flex-1 bg-background border-2 border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#5330ff] transition-colors" />
                  <div className="flex items-center gap-1 w-28 bg-background border-2 border-border rounded-xl px-3 py-2.5 focus-within:border-[#5330ff] transition-colors">
                    <span className="text-xs text-muted-foreground">R$</span>
                    <input type="number" placeholder="0" value={f.valor}
                      onChange={e => setFixas(prev => prev.map((x, idx) => idx === i ? { ...x, valor: e.target.value } : x))}
                      className="flex-1 bg-transparent text-sm focus:outline-none" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setFixas(prev => [...prev, { descricao: '', valor: '' }])}
              className="text-xs text-[#5330ff] font-bold hover:underline">+ Adicionar outra</button>
          </div>
        )}

        {/* ── PASSO: CONVITE CASAL ── */}
        {etapaAtual === 'convite' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black text-foreground">Convide seu cônjuge/parceiro(a)</h2>
            <p className="text-sm text-muted-foreground">
              {linkConvite ? 'Link gerado! Compartilhe com seu cônjuge/parceiro(a).' : 'Digite o email para gerar o link de acesso.'}
            </p>

            {!linkConvite ? (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Email do cônjuge/parceiro(a)</label>
                <input type="email" value={emailParceiro} onChange={e => setEmailParceiro(e.target.value)}
                  placeholder="parceiro@email.com"
                  className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-[#5330ff] transition-colors" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/20">
                  <p className="text-xs font-bold text-[#1D9E75] mb-2">✓ Link gerado para {emailParceiro}</p>
                  <p className="text-xs text-muted-foreground break-all">{linkConvite}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => copiarLink(linkConvite)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-bold transition-all"
                    style={linkCopiado ? { background: '#1D9E75', color: 'white', borderColor: '#1D9E75' } : {}}>
                    <Copy className="h-4 w-4" />
                    {linkCopiado ? 'Copiado!' : 'Copiar link'}
                  </button>
                  <a href={`mailto:${emailParceiro}?subject=Convite Finexa&body=Acesse: ${linkConvite}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#5330ff] text-white text-sm font-bold">
                    <Mail className="h-4 w-4" />Enviar email
                  </a>
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">Pode pular e convidar depois na aba Planejamento.</p>
          </div>
        )}

        {/* ── PASSO: PRIVACIDADE FAMÍLIA ── */}
        {etapaAtual === 'privacidade' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#ffa857]" />
              <h2 className="text-lg font-black text-foreground">Configurar privacidade</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Como mestre da família você decide o que cada membro pode ver. Pode alterar depois.
            </p>
            <div className="space-y-3">
              {([
                { id: 'aberta', label: 'Família aberta', desc: 'Todos veem tudo', icon: Eye, cor: '#01b695' },
                { id: 'restrita', label: 'Família restrita', desc: 'Cada um vê só o próprio dashboard', icon: Lock, cor: '#ffa857' },
                { id: 'personalizada', label: 'Personalizado', desc: 'Você define quem vê o quê', icon: Shield, cor: '#5330ff' },
              ] as const).map(op => {
                const Icon = op.icon;
                return (
                  <button key={op.id} className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all hover:border-[#5330ff]/40"
                    style={{ borderColor: privacidade === op.id ? op.cor : 'var(--border)', background: privacidade === op.id ? `${op.cor}12` : 'transparent' }}
                    onClick={() => setPrivacidade(op.id)}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${op.cor}20` }}>
                      <Icon className="h-4 w-4" style={{ color: op.cor }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{op.label}</p>
                      <p className="text-xs text-muted-foreground">{op.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground">A configuração detalhada fica disponível na aba Planejamento após o onboarding.</p>
          </div>
        )}

        {/* ── PASSO: CONVITES FAMÍLIA ── */}
        {etapaAtual === 'convites' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#ffa857]" />
              <h2 className="text-lg font-black text-foreground">Convidar membros</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {linksGerados.length > 0 ? 'Links gerados! Compartilhe com cada membro.' : 'Adicione os emails dos membros da família.'}
            </p>

            {linksGerados.length === 0 ? (
              <>
                <div className="space-y-2">
                  {membros.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="email" placeholder={`Membro ${i + 1} — email`} value={m.email}
                        onChange={e => setMembros(prev => prev.map((x, idx) => idx === i ? { ...x, email: e.target.value } : x))}
                        className="flex-1 bg-background border-2 border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#ffa857] transition-colors" />
                    </div>
                  ))}
                </div>
                {membros.length < 3 && (
                  <button onClick={() => setMembros(prev => [...prev, { email: '', podeVerGeral: true, podeVerOutros: true }])}
                    className="text-xs text-[#ffa857] font-bold hover:underline">+ Adicionar outro membro</button>
                )}
              </>
            ) : (
              <div className="space-y-3">
                {linksGerados.map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/20 space-y-2">
                    <p className="text-xs font-bold text-[#1D9E75]">✓ {item.email}</p>
                    <p className="text-[10px] text-muted-foreground break-all bg-secondary/50 rounded-lg px-2 py-1.5 select-all">
                      {item.url}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(item.url); setLinkCopiado(true); setTimeout(() => setLinkCopiado(false), 2000); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-secondary transition-colors"
                        style={linkCopiado ? { background: '#1D9E75', color: 'white', borderColor: '#1D9E75' } : {}}>
                        <Copy className="h-3 w-3" />{linkCopiado ? 'Copiado!' : 'Copiar'}
                      </button>
                      <a href={`mailto:${item.email}?subject=Convite%20Finexa&body=Acesse%20o%20link%20para%20entrar%20no%20Finexa:%20${encodeURIComponent(item.url)}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#5330ff] text-white">
                        <Mail className="h-3 w-3" />Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PASSO: PRONTO ── */}
        {etapaAtual === 'pronto' && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-[#1D9E75]" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Tudo pronto, {nome}! 🎉</h2>
            <p className="text-sm text-muted-foreground">
              Sua conta está configurada. Vamos para o dashboard!
            </p>
            <div className="p-3 rounded-xl bg-[#5330ff]/8 border border-[#5330ff]/20 text-left space-y-1.5">
              <p className="text-xs font-bold text-foreground">O que você pode fazer agora:</p>
              {[
                '📊 Ver seu dashboard financeiro',
                '💸 Lançar seus primeiros gastos',
                plano !== 'individual' ? '👥 Aguardar seu parceiro aceitar o convite' : null,
                '🎯 Criar suas primeiras metas',
              ].filter(Boolean).map((item, i) => (
                <p key={i} className="text-xs text-muted-foreground">{item}</p>
              ))}
            </div>
          </div>
        )}

        {/* Botões de navegação */}
        <div className="flex gap-3">
          {passo > 0 && etapaAtual !== 'pronto' && (
            <button onClick={() => setPasso(p => p - 1)}
              className="px-5 py-3 rounded-xl border-2 border-border text-sm font-bold text-muted-foreground hover:bg-secondary transition-colors">
              Voltar
            </button>
          )}
          <button onClick={avancar} disabled={salvando}
            className="flex-1 py-3 rounded-xl font-black text-base text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{ background: plano === 'familia' ? '#ffa857' : '#5330ff', boxShadow: `4px 4px 0 ${plano === 'familia' ? '#ffa85760' : '#82a1fd60'}` }}>
            {salvando ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {salvando ? 'Salvando...'
              : etapaAtual === 'pronto' ? 'Ir para o dashboard →'
              : etapaAtual === 'convite' && !linkConvite && emailParceiro ? 'Gerar link de convite'
              : etapaAtual === 'convites' && linksGerados.length === 0 && membros.some(m => m.email) ? 'Gerar links de convite'
              : 'Próximo'}
            {!salvando && etapaAtual !== 'pronto' && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Pular passo */}
        {['convite', 'convites', 'fixas', 'privacidade'].includes(etapaAtual) && (
          <button onClick={() => setPasso(p => p + 1)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
            Pular por agora →
          </button>
        )}
      </div>
    </div>
  );
}
