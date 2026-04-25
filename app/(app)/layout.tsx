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
  Shield, UserPlus, Copy, Mail, Loader2, Check, Trash2
} from 'lucide-react';
import { useState } from 'react';

// ─── Modal de configurações ───────────────────────────────────────────────────
function ModalConfig({ onFechar }: { onFechar: () => void }) {
  const { perfil } = useAuth();
  const { membros, carregando } = useMembros();
  const [aba, setAba]           = useState<'plano' | 'membros' | 'privacidade'>('plano');

  const planoAtual  = (perfil?.plano as PlanoId) || 'casal';
  const isMaster    = perfil?.is_master ?? false;
  const upgrades    = getUpgrades(planoAtual);
  const planoInfo   = getPlano(planoAtual);
  const maxMembros  = planoInfo.maxMembros;
  const podeConvite = isMaster && planoAtual !== 'individual';
  const membrosExtra = Math.max(0, membros.length - maxMembros);

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

  const abas = [
    { id: 'plano',       label: 'Meu plano',  icon: CreditCard },
    { id: 'membros',     label: 'Membros',     icon: Users },
    ...(planoAtual === 'familia' ? [{ id: 'privacidade', label: 'Privacidade', icon: Shield }] : []),
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
