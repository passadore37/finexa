'use client';

import { Logo } from '@/components/logo';
import { TabNav } from '@/components/tab-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { FeedbackModal } from '@/components/beta/feedback-modal';
import { useAuth } from '@/hooks/use-auth';
import { useMembros } from '@/hooks/use-membros';
import { LogOut, ChevronDown, Settings, Users, UserPlus, Copy, Mail, Loader2, X } from 'lucide-react';
import { useState } from 'react';

function ModalGerenciar({ onFechar }: { onFechar: () => void }) {
  const { perfil } = useAuth();
  const { membros, carregando } = useMembros();
  const [emailNovo, setEmailNovo]   = useState('');
  const [gerando, setGerando]       = useState(false);
  const [linkGerado, setLinkGerado] = useState('');
  const [copiado, setCopiado]       = useState(false);

  const isMaster = perfil?.is_master;
  const plano    = perfil?.plano ?? 'casal';
  const maxMembros = plano === 'individual' ? 1 : plano === 'casal' ? 2 : 4;

  async function gerarConvite() {
    if (!emailNovo) return;
    setGerando(true);
    const res  = await fetch('/api/convite', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailNovo }),
    });
    const data = await res.json();
    setLinkGerado(data.url ?? '');
    setGerando(false);
  }

  function copiar() {
    navigator.clipboard.writeText(linkGerado);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-foreground">Gerenciar membros</h3>
          <button onClick={onFechar} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Lista de membros */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
            Membros ativos ({membros.length}/{maxMembros})
          </p>
          {carregando ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-2">
              {membros.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: m.cor }}>
                    {m.nome[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{m.nome}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {m.id === perfil?.id ? 'Você' : 'Membro'}{i === 0 && perfil?.is_master ? ' · Mestre' : ''}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#1D9E75]" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Convidar novo membro — só master e se não atingiu limite */}
        {isMaster && membros.length < maxMembros && plano !== 'individual' && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Convidar membro</p>
            {!linkGerado ? (
              <>
                <input type="email" value={emailNovo} onChange={e => setEmailNovo(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <button onClick={gerarConvite} disabled={gerando || !emailNovo}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: 'var(--primary)' }}>
                  {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {gerando ? 'Gerando...' : 'Gerar convite'}
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/20">
                  <p className="text-[10px] font-bold text-[#1D9E75] mb-1">✓ Link gerado para {emailNovo}</p>
                  <p className="text-[10px] text-muted-foreground break-all">{linkGerado}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={copiar}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-border hover:bg-secondary transition-colors"
                    style={copiado ? { background: '#1D9E75', color: 'white', borderColor: '#1D9E75' } : {}}>
                    <Copy className="h-3.5 w-3.5" />{copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                  <a href={`mailto:${emailNovo}?subject=Convite Finexa&body=Acesse: ${linkGerado}`}
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

        {membros.length >= maxMembros && isMaster && plano === 'familia' && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Limite de {maxMembros} membros atingido.{' '}
              <a href="/plano" className="text-primary font-bold hover:underline">Fazer upgrade</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { perfil, signOut } = useAuth();
  const [menuAberto, setMenuAberto]       = useState(false);
  const [modalGerenciar, setModalGerenciar] = useState(false);

  const plano = perfil?.plano ?? 'casal';
  const temGerenciamento = plano !== 'individual';

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
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-black text-primary">
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
                      <p className="text-xs font-black text-foreground truncate">{perfil?.nome ?? 'Usuário'}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        Plano {plano} {perfil?.is_master ? '· Mestre' : ''}
                      </p>
                    </div>

                    {temGerenciamento && (
                      <button onClick={() => { setMenuAberto(false); setModalGerenciar(true); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        Gerenciar membros
                      </button>
                    )}

                    <button onClick={() => { setMenuAberto(false); signOut(); }}
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

      {modalGerenciar && <ModalGerenciar onFechar={() => setModalGerenciar(false)} />}
    </>
  );
}
