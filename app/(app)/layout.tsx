'use client';

import { Logo } from '@/components/logo';
import { TabNav } from '@/components/tab-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { FeedbackModal } from '@/components/beta/feedback-modal';
import { useAuth } from '@/hooks/use-auth';
import { useMembros } from '@/hooks/use-membros';
import { getUpgrades, getPlano, PRECO_MEMBRO_EXTRA } from '@/lib/planos';
import type { PlanoId } from '@/lib/planos';
import {
  LogOut, ChevronDown, Settings, X, Users, CreditCard,
  Shield, UserPlus, Copy, Mail, Loader2, Check, Trash2,
  Wallet, Plus, Trash, Bell, BellOff, Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePlano } from '@/hooks/use-plano';

// ─── Modal de configurações ───────────────────────────────────────────────────
function ModalConfig({ onFechar }: { onFechar: () => void }) {
  const { perfil } = useAuth();
  const { membros, carregando } = useMembros();
  const [aba, setAba]           = useState<'plano' | 'financas' | 'membros' | 'privacidade'>('plano');

  const planoAtual  = (perfil?.plano as PlanoId) || 'casal';
  const isMaster    = perfil?.is_master ?? false;
  const upgrades    = getUpgrades(planoAtual);
  const planoInfo   = getPlano(planoAtual);
  const maxMembros  = planoInfo.maxMembros;
  const podeConvite = isMaster && planoAtual !== 'individual';
  const membrosExtra = Math.max(0, membros.length - maxMembros);
  const { ehCasal } = usePlano();

  // Estados aba Finanças
  const [salMembro0, setSalMembro0]   = useState('');
  const [salMembro1, setSalMembro1]   = useState('');
  const [contasFixas, setContasFixas] = useState<{ descricao: string; valor: string }[]>([]);
  const [salvandoFin, setSalvandoFin] = useState(false);
  const [finSalvo, setFinSalvo]       = useState(false);

  useEffect(() => {
    if (aba !== 'financas') return;
    fetch('/api/planejamento', { credentials: 'include' })
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          setSalMembro0(res.data.salario_membro0 > 0 ? String(res.data.salario_membro0) : '');
          setSalMembro1(res.data.salario_membro1 > 0 ? String(res.data.salario_membro1) : '');
          setContasFixas(
            (res.data.contas_fixas ?? []).map((f: any) => ({
              descricao: f.descricao ?? '',
              valor: f.valor > 0 ? String(f.valor) : '',
            }))
          );
        }
      });
  }, [aba]);

  async function salvarFinancas() {
    setSalvandoFin(true);
    const fixas = contasFixas
      .filter(f => f.descricao && f.valor)
      .map(f => ({ descricao: f.descricao, valor: Number(f.valor) }));
    await fetch('/api/planejamento', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salario_membro0: Number(salMembro0) || 0,
        salario_membro1: Number(salMembro1) || 0,
        contas_fixas: fixas,
      }),
    });
    setSalvandoFin(false);
    setFinSalvo(true);
    setTimeout(() => setFinSalvo(false), 2500);
  }

  // Convite
  const [emailNovo, setEmailNovo]   = useState('');
  const [gerando, setGerando]       = useState(false);
  const [linkGerado, setLinkGerado] = useState('');
  const [copiado, setCopiado]       = useState(false);

  async function gerarConvite() {
    if (!emailNovo) return;
    setGerando(true);
    try {
      const res  = await fetch('/api/convite', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailNovo }),
      });
      const data = await res.json();
      if (data.url) setLinkGerado(data.url);
    } catch {}
    setGerando(false);
  }

  function copiar() {
    navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  // Estados aba Notificações
  const [pushAtivo,      setPushAtivo]      = useState<boolean | null>(null);
  const [historico,      setHistorico]      = useState<{ title: string; body: string; data: string }[]>([]);
  const [carregandoPush, setCarregandoPush] = useState(false);

  useEffect(() => {
    if (aba !== 'notificacoes') return;
    if (!('Notification' in window)) return;

    setPushAtivo(Notification.permission === 'granted');

    // Buscar histórico do localStorage
    try {
      const hist = JSON.parse(localStorage.getItem('push-historico') ?? '[]');
      setHistorico(hist.slice(0, 10));
    } catch {}
  }, [aba]);

  async function togglePush() {
    setCarregandoPush(true);
    try {
      if (pushAtivo) {
        // Desativar — remover subscription do banco
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/push', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setPushAtivo(false);
      } else {
        // Ativar — solicitar permissão
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') { setCarregandoPush(false); return; }

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        await fetch('/api/push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: sub.toJSON(), perfil: perfil?.role ?? 'membro' }),
        });
        setPushAtivo(true);
      }
    } catch (err) {
      console.error('[push] Erro ao toggle:', err);
    }
    setCarregandoPush(false);
  }

  const abas = [
    { id: 'plano',    label: 'Meu plano', icon: CreditCard },
    { id: 'financas', label: 'Finanças',  icon: Wallet },
    { id: 'membros',  label: 'Membros',   icon: Users },
    ...(planoAtual === 'familia' ? [{ id: 'privacidade', label: 'Privacidade', icon: Shield }] : []),
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-black text-foreground">Configurações</h3>
          <button onClick={onFechar}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-border">
          {abas.map(a => {
            const Icon = a.icon;
            return (
              <button key={a.id} onClick={() => setAba(a.id as any)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-colors"
                style={aba === a.id
                  ? { color: '#5330ff', borderBottom: '2px solid #5330ff' }
                  : { color: 'var(--muted-foreground)', borderBottom: '2px solid transparent' }
                }>
                <Icon className="h-3.5 w-3.5" />
                {a.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* ── ABA: MEU PLANO ── */}
          {aba === 'plano' && (
            <div className="space-y-4">
              {/* Plano atual */}
              <div className="p-4 rounded-xl border-2 space-y-1"
                style={{ borderColor: `${planoInfo.cor}40`, background: `${planoInfo.cor}08` }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-foreground">Plano {planoInfo.nome}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: planoInfo.cor }}>Atual</span>
                </div>
                <p className="text-xl font-black text-foreground">
                  R${planoInfo.preco + membrosExtra * PRECO_MEMBRO_EXTRA}
                  <span className="text-xs font-medium text-muted-foreground">/mês</span>
                </p>
                {membrosExtra > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    R${planoInfo.preco} base + {membrosExtra} membro(s) extra × R${PRECO_MEMBRO_EXTRA}
                  </p>
                )}
                <ul className="space-y-1 mt-2">
                  {planoInfo.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3 flex-shrink-0" style={{ color: planoInfo.cor }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upgrades disponíveis */}
              {upgrades.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Fazer upgrade
                  </p>
                  {upgrades.map(u => (
                    <div key={u.id} className="p-3.5 rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-foreground">Plano {u.nome}</span>
                        <span className="text-sm font-black text-foreground">R${u.preco}<span className="text-xs text-muted-foreground">/mês</span></span>
                      </div>
                      <p className="text-xs text-muted-foreground">{u.features[1]}</p>
                      <a href={`/plano?id=${u.id}`}
                        className="block w-full py-2 rounded-xl text-xs font-black text-white text-center"
                        style={{ background: u.cor }}>
                        Fazer upgrade para {u.nome} →
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Membro extra (só família) */}
              {planoAtual === 'familia' && isMaster && (
                <div className="p-3.5 rounded-xl border border-[#ffa857]/30 bg-[#ffa857]/05 space-y-2">
                  <p className="text-xs font-black text-foreground">Adicionar membro extra</p>
                  <p className="text-xs text-muted-foreground">
                    Seu plano inclui {maxMembros} membros. Cada membro adicional custa R${PRECO_MEMBRO_EXTRA}/mês.
                  </p>
                  <button onClick={() => setAba('membros')}
                    className="w-full py-2 rounded-xl text-xs font-black border border-[#ffa857] text-[#ffa857] hover:bg-[#ffa857]/10 transition-colors">
                    Convidar membro extra →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ABA: FINANÇAS ── */}
          {aba === 'financas' && (
            <div className="space-y-5">

              {/* Salário membro 0 */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                  {membros[0]?.nome ?? 'Membro 1'} — Salário mensal
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">R$</span>
                  <input
                    type="number"
                    value={salMembro0}
                    onChange={e => setSalMembro0(e.target.value)}
                    placeholder="0"
                    className="w-full bg-background border-2 border-border rounded-xl pl-10 pr-4 py-3 text-foreground font-bold focus:outline-none focus:border-[#5330ff] transition-colors"
                  />
                </div>
              </div>

              {/* Salário membro 1 — só casal */}
              {ehCasal && membros.length > 1 && (
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">
                    {membros[1]?.nome ?? 'Membro 2'} — Salário mensal
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">R$</span>
                    <input
                      type="number"
                      value={salMembro1}
                      onChange={e => setSalMembro1(e.target.value)}
                      placeholder="0"
                      className="w-full bg-background border-2 border-border rounded-xl pl-10 pr-4 py-3 text-foreground font-bold focus:outline-none focus:border-[#5330ff] transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Divisor */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Contas fixas
                  </label>
                  <button
                    onClick={() => setContasFixas(prev => [...prev, { descricao: '', valor: '' }])}
                    className="flex items-center gap-1 text-xs font-bold text-[#5330ff] hover:underline">
                    <Plus className="h-3 w-3" /> Adicionar
                  </button>
                </div>

                {contasFixas.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Nenhuma conta fixa cadastrada.</p>
                )}

                <div className="space-y-2">
                  {contasFixas.map((f, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Descrição (ex: Aluguel)"
                        value={f.descricao}
                        onChange={e => setContasFixas(prev => prev.map((x, idx) => idx === i ? { ...x, descricao: e.target.value } : x))}
                        className="flex-1 bg-background border-2 border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-[#5330ff] transition-colors"
                      />
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">R$</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={f.valor}
                          onChange={e => setContasFixas(prev => prev.map((x, idx) => idx === i ? { ...x, valor: e.target.value } : x))}
                          className="w-full bg-background border-2 border-border rounded-xl pl-8 pr-2 py-2.5 text-sm text-foreground focus:outline-none focus:border-[#5330ff] transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => setContasFixas(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-muted-foreground hover:text-red-500">
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão salvar */}
              <button
                onClick={salvarFinancas}
                disabled={salvandoFin}
                className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                style={{ background: '#5330ff', boxShadow: '3px 3px 0 #82a1fd60' }}>
                {salvandoFin
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                  : finSalvo
                  ? <><Check className="h-4 w-4" /> Salvo!</>
                  : 'Salvar alterações'}
              </button>
            </div>
          )}

          {/* ── ABA: MEMBROS ── */}
          {aba === 'membros' && (
            <div className="space-y-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Membros ativos ({membros.length}/{maxMembros}{membros.length > maxMembros ? ` +${membros.length - maxMembros} extra` : ''})
              </p>

              {carregando ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {membros.map((m, i) => (
                    <div key={m.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                        style={{ background: m.cor }}>
                        {m.nome[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{m.nome}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {m.id === perfil?.id ? 'Você' : 'Membro'}
                          {i === 0 && perfil?.is_master ? ' · Mestre' : ''}
                          {i >= maxMembros ? ` · +R$${PRECO_MEMBRO_EXTRA}/mês` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#1D9E75]" />
                        {isMaster && m.id !== perfil?.id && (
                          <button className="p-1 rounded-lg hover:bg-destructive/10 transition-colors opacity-40 hover:opacity-100">
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Convidar — só master em plano que permite */}
              {podeConvite && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {membros.length >= maxMembros
                      ? `Convidar membro extra (+R$${PRECO_MEMBRO_EXTRA}/mês)`
                      : 'Convidar membro'
                    }
                  </p>

                  {!linkGerado ? (
                    <div className="space-y-2">
                      <input type="email" value={emailNovo} onChange={e => setEmailNovo(e.target.value)}
                        placeholder="email@exemplo.com"
                        className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      <button onClick={gerarConvite} disabled={gerando || !emailNovo}
                        className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                        style={{ background: '#5330ff' }}>
                        {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        {gerando ? 'Gerando...' : 'Gerar link de convite'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/20">
                        <p className="text-[10px] font-bold text-[#1D9E75] mb-1">✓ Link gerado para {emailNovo}</p>
                        <p className="text-[10px] text-muted-foreground break-all select-all">{linkGerado}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={copiar}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-border hover:bg-secondary transition-colors"
                          style={copiado ? { background: '#1D9E75', color: 'white', borderColor: '#1D9E75' } : {}}>
                          <Copy className="h-3.5 w-3.5" />
                          {copiado ? 'Copiado!' : 'Copiar'}
                        </button>
                        <a href={`mailto:${emailNovo}?subject=Convite%20Finexa&body=Acesse%3A%20${encodeURIComponent(linkGerado)}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold bg-[#5330ff] text-white">
                          <Mail className="h-3.5 w-3.5" />Email
                        </a>
                      </div>
                      <button onClick={() => { setLinkGerado(''); setEmailNovo(''); }}
                        className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                        Convidar outro membro
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mensagem para não-mestres */}
              {!isMaster && planoAtual !== 'individual' && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Apenas o mestre da família pode convidar membros.
                </p>
              )}
            </div>
          )}

          {/* ── ABA: NOTIFICAÇÕES ── */}
          {aba === 'notificacoes' && (
            <div className="space-y-4">

              {/* Toggle de ativação */}
              <div className="p-4 rounded-xl border-2 border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: pushAtivo ? '#5330ff15' : 'var(--secondary)' }}>
                    {pushAtivo
                      ? <Bell className="h-4 w-4 text-[#5330ff]" />
                      : <BellOff className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">
                      {pushAtivo ? 'Notificações ativas' : 'Notificações desativadas'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {pushAtivo
                        ? 'Você receberá lembretes e alertas'
                        : 'Ative para receber lembretes de gastos'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={togglePush}
                  disabled={carregandoPush}
                  className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50 ${pushAtivo ? 'bg-[#5330ff]' : 'bg-border'}`}
                >
                  {carregandoPush
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin absolute top-1.5 left-1/2 -translate-x-1/2 text-white" />
                    : <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${pushAtivo ? 'left-7' : 'left-1'}`} />
                  }
                </button>
              </div>

              {/* Tipos de notificação */}
              {pushAtivo && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Você receberá
                  </p>
                  {[
                    { icon: '📊', titulo: 'Lembrete diário', desc: 'Todo dia às 21h se não lançou nada' },
                    { icon: '😴', titulo: 'Alerta de inatividade', desc: 'Quando ficar 3+ dias sem lançar' },
                    { icon: '⚠️', titulo: 'Limite de gastos', desc: 'Ao atingir 80% e 100% do orçamento' },
                    { icon: '⏰', titulo: 'Trial expirando', desc: 'Aviso 1, 2 e 3 dias antes de expirar' },
                    { icon: '🎉', titulo: 'Novidades', desc: 'Quando lançarmos novas funcionalidades' },
                  ].map(item => (
                    <div key={item.titulo} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                      <span className="text-base flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground">{item.titulo}</p>
                        <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <Check className="h-3.5 w-3.5 text-[#01b695] flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              {/* Histórico */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                  Últimas notificações recebidas
                </p>
                {historico.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-border text-center">
                    <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
                    <p className="text-xs text-muted-foreground">Nenhuma notificação ainda</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {historico.map((n, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border bg-secondary/30">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-foreground">{n.title}</p>
                          <p className="text-[10px] text-muted-foreground flex-shrink-0">{n.data}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{n.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── ABA: PRIVACIDADE (só família) ── */}
          {aba === 'privacidade' && (
            <div className="space-y-3">
              {!isMaster ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Apenas o mestre pode configurar a privacidade.
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Defina o que cada membro pode visualizar. Clique em um membro para ajustar.
                  </p>
                  {membros.filter(m => m.id !== perfil?.id).map(m => (
                    <div key={m.id} className="p-3 rounded-xl border border-border space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                          style={{ background: m.cor }}>
                          {m.nome[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-foreground">{m.nome}</span>
                      </div>
                      <div className="space-y-1.5">
                        {[
                          { label: 'Ver dashboard geral (consolidado)', key: 'geral' },
                          { label: 'Ver dashboard dos outros membros', key: 'outros' },
                        ].map(opt => (
                          <label key={opt.key}
                            className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer">
                            <input type="checkbox" defaultChecked
                              className="w-3.5 h-3.5 rounded accent-primary" />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: '#5330ff' }}>
                    Salvar configurações
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Layout principal ─────────────────────────────────────────────────────────
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { perfil, signOut } = useAuth();
  const [menuAberto, setMenuAberto]       = useState(false);
  const [modalConfig, setModalConfig]     = useState(false);

  const planoInfo = getPlano((perfil?.plano as PlanoId) || 'casal');

  // Ouvir mensagens do Service Worker para salvar histórico de notificações
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    function handleMsg(e: MessageEvent) {
      if (e.data?.type !== 'PUSH_RECEIVED') return;
      try {
        const hist = JSON.parse(localStorage.getItem('push-historico') ?? '[]');
        hist.unshift({ title: e.data.title, body: e.data.body, data: e.data.data });
        localStorage.setItem('push-historico', JSON.stringify(hist.slice(0, 20)));
      } catch {}
    }
    navigator.serviceWorker.addEventListener('message', handleMsg);
    return () => navigator.serviceWorker.removeEventListener('message', handleMsg);
  }, []);

  return (
    <>
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-base font-bold text-foreground leading-none tracking-tight">Finexa</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Seu dinheiro, com clareza.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div className="relative">
              <button onClick={() => setMenuAberto(!menuAberto)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border hover:bg-secondary transition-colors">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white"
                  style={{ background: planoInfo.cor }}>
                  {perfil?.nome?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-xs font-medium text-foreground hidden sm:block max-w-[100px] truncate">
                  {perfil?.nome ?? 'Usuário'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {menuAberto && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-border">
                      <p className="text-xs font-black text-foreground truncate">
                        {perfil?.nome ?? 'Usuário'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: planoInfo.cor }} />
                        <p className="text-[10px] text-muted-foreground">
                          Plano {planoInfo.nome}
                          {perfil?.is_master ? ' · Mestre' : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => { setMenuAberto(false); setModalConfig(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      Configurações
                    </button>

                    <button
                      onClick={() => { setMenuAberto(false); signOut(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#E24B4A] hover:bg-[#E24B4A]/10 transition-colors border-t border-border">
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <TabNav />
      <main className="pb-20 sm:pb-0">{children}</main>
      <FeedbackModal />

      {modalConfig && <ModalConfig onFechar={() => setModalConfig(false)} />}
    </>
  );
}