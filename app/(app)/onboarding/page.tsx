'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Loader2, Users, Wallet, CalendarDays,
         UserPlus, Copy, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

type Plano = 'individual' | 'casal';

export default function OnboardingPage() {
  const router = useRouter();
  const { perfil, user, reloadPerfil } = useAuth();
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');
  const isInvitee = user?.user_metadata?.is_invitee || false;

  const [plano, setPlano]             = useState<Plano>('casal');
  const [nome, setNome]               = useState('');
  const [salario, setSalario]         = useState('');
  const [salParceiro, setSalParceiro] = useState('');
  const [fixas, setFixas]             = useState([{ descricao: '', valor: '' }]);
  const [emailParceiro, setEmailParceiro] = useState('');
  const [linkConvite, setLinkConvite] = useState('');
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [passo, setPasso]             = useState(0);

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome ?? '');
      const p = (perfil.plano as Plano) ?? (user?.user_metadata?.plano as Plano) ?? 'casal';
      setPlano(p === 'familia' ? 'casal' : p); // fallback família → casal
    } else if (user?.user_metadata?.plano) {
      const p = user.user_metadata.plano as Plano;
      setPlano(p === 'familia' ? 'casal' : p);
    }
  }, [perfil, user]);

  const passos = {
    individual: ['boasvindas', 'plano', 'perfil', 'fixas', 'pronto'],
    casal:      ['boasvindas', 'plano', 'perfil', 'fixas', 'convite', 'pronto'],
    convidado:  ['boasvindas', 'perfil', 'pronto'],
  };

  const etapas    = passos[isInvitee ? 'convidado' : plano];
  const etapaAtual = etapas[passo];
  const totalPassos = etapas.length - 1;

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

  async function salvarPlanejamento(contasFixas?: { id: string; descricao: string; valor: number; categoria: string }[]) {
    const res = await fetch('/api/onboarding', {
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
    if (!res.ok) throw new Error('Erro ao salvar');
    reloadPerfil?.().catch(() => {});
  }

  async function pularFixas() {
    // Ao pular a etapa de fixas, ainda salva o salário preenchido na etapa anterior
    setSalvando(true);
    try {
      await salvarPlanejamento([]);
    } catch {
      // Falha silenciosa no pulo — o dado de salário pode já ter sido salvo na etapa 'perfil'
    } finally {
      setSalvando(false);
    }
    setPasso(p => p + 1);
  }

  async function avancar() {
    setErroSalvar('');

    if (etapaAtual === 'perfil') {
      if (!nome.trim()) { setErroSalvar('Por favor, preencha seu nome.'); return; }
      setSalvando(true);
      try {
        await salvarPlanejamento();
      } catch {
        setErroSalvar('Erro ao salvar. Tente novamente.');
        setSalvando(false);
        return;
      }
      setSalvando(false);
    }

    if (etapaAtual === 'fixas') {
      setSalvando(true);
      try {
        const contasFixas = fixas
          .filter(f => f.descricao && parseFloat(f.valor) > 0)
          .map(f => ({
            id: Date.now().toString() + Math.random(),
            descricao: f.descricao,
            valor: parseFloat(f.valor),
            categoria: 'Outros',
          }));
        await salvarPlanejamento(contasFixas);
      } catch {
        setErroSalvar('Erro ao salvar. Tente novamente.');
        setSalvando(false);
        return;
      }
      setSalvando(false);
    }

    if (etapaAtual === 'convite' && emailParceiro && !linkConvite) {
      setSalvando(true);
      try {
        const url = await gerarLinkConvite(emailParceiro);
        setLinkConvite(url);
      } catch {
        setErroSalvar('Erro ao gerar link. Tente novamente.');
      } finally {
        setSalvando(false);
      }
      return;
    }

    if (etapaAtual === 'pronto') {
      router.push('/dashboard');
      return;
    }

    setPasso(p => p + 1);
  }

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

        {/* ── PASSO: BOAS-VINDAS ── */}
        {etapaAtual === 'boasvindas' && (
          <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-foreground">Bem-vinda ao Finexa! 🎉</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Você foi selecionada para testar o <strong className="text-foreground">Finexa Beta</strong> — controle financeiro inteligente para casais e pessoas que querem ter clareza sobre seu dinheiro. Sem planilha. Sem complicação.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#5330ff]/8 border border-[#5330ff]/20 space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-[#5330ff]">Como você pode ajudar</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Use o app por alguns dias e nos conte o que funcionou, o que travou e o que poderia ser melhor. Use o botão roxo flutuante na tela para enviar feedback a qualquer momento.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#ffa857]/8 border border-[#ffa857]/20 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-[#ffa857]">Contribuição voluntária</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Para ajudar a manter o app e financiar melhorias, aceitamos contribuições simbólicas de <strong className="text-foreground">R$20/mês via Pix</strong>. Totalmente opcional — o acesso é gratuito durante o beta.
              </p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-xs text-muted-foreground">Chave Pix</p>
                  <p className="text-sm font-black text-foreground select-all">11992456210</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const chave = '11992456210';
                    try {
                      await navigator.clipboard.writeText(chave);
                    } catch {
                      // Fallback para ambientes sem suporte ao clipboard API (HTTP, WebView)
                      const el = document.createElement('textarea');
                      el.value = chave;
                      el.style.position = 'fixed';
                      el.style.opacity = '0';
                      document.body.appendChild(el);
                      el.focus();
                      el.select();
                      document.execCommand('copy');
                      document.body.removeChild(el);
                    }
                    setPixCopiado(true);
                    setTimeout(() => setPixCopiado(false), 2000);
                  }}
                  className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={pixCopiado
                    ? { background: '#1D9E75', color: 'white' }
                    : { background: '#ffa857', color: 'black' }}>
                  {pixCopiado ? 'Copiado! ✓' : 'Copiar'}
                </button>
              </div>
            </div>
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
              {/* Família — em breve */}
              <div className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed opacity-50 cursor-not-allowed"
                style={{ borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#ffa857]/20">
                  <Users className="h-5 w-5 text-[#ffa857]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-foreground">Família <span className="text-[10px] font-bold bg-[#ffa857]/20 text-[#ffa857] px-1.5 py-0.5 rounded-full ml-1">Em breve</span></p>
                  <p className="text-xs text-muted-foreground">Até 4 pessoas · Visão consolidada</p>
                </div>
              </div>
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
                Seu salário mensal
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
                <p className="text-[10px] text-muted-foreground mt-1">Usado para divisão proporcional.</p>
              </div>
            )}
          </div>
        )}

        {/* ── PASSO: FIXAS ── */}
        {etapaAtual === 'fixas' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black text-foreground">Contas fixas mensais</h2>
              <p className="text-sm text-muted-foreground mt-1">Aluguel, condomínio, internet... Pode pular e adicionar depois em Configurações.</p>
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
            <button type="button" onClick={() => setFixas(prev => [...prev, { descricao: '', valor: '' }])}
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
                  <button onClick={() => { navigator.clipboard.writeText(linkConvite); setLinkCopiado(true); setTimeout(() => setLinkCopiado(false), 2000); }}
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
            <p className="text-[10px] text-muted-foreground">Pode pular e convidar depois em Configurações.</p>
          </div>
        )}

        {/* ── PASSO: PRONTO ── */}
        {etapaAtual === 'pronto' && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-[#1D9E75]" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Tudo pronto, {nome}! 🎉</h2>
            <p className="text-sm text-muted-foreground">Sua conta está configurada. Vamos para o dashboard!</p>
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

        {/* Erro */}
        {erroSalvar && (
          <div className="px-4 py-3 rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-900/20 text-sm font-bold text-red-600 dark:text-red-400">
            {erroSalvar}
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
            style={{ background: '#5330ff', boxShadow: '4px 4px 0 #82a1fd60' }}>
            {salvando ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {salvando ? 'Salvando...'
              : etapaAtual === 'pronto' ? 'Ir para o dashboard →'
              : etapaAtual === 'convite' && !linkConvite && emailParceiro ? 'Gerar link de convite'
              : 'Próximo'}
            {!salvando && etapaAtual !== 'pronto' && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Pular passo */}
        {['convite', 'fixas'].includes(etapaAtual) && (
          <button
            onClick={etapaAtual === 'fixas' ? pularFixas : () => setPasso(p => p + 1)}
            disabled={salvando}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            Pular por agora →
          </button>
        )}
      </div>
    </div>
  );
}