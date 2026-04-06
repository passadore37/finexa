'use client';

import { useState } from 'react';
import { MessageSquare, X, Check, Loader2, Bug, Lightbulb, Heart, HelpCircle } from 'lucide-react';
import { useUsuarioContext } from '@/hooks/use-usuario-context';

const TIPOS = [
  { id: 'bug',      label: 'Bug',       icon: Bug,         cor: '#E24B4A' },
  { id: 'sugestao', label: 'Sugestão',  icon: Lightbulb,   cor: '#EF9F27' },
  { id: 'elogio',   label: 'Elogio',    icon: Heart,       cor: '#1D9E75' },
  { id: 'outro',    label: 'Outro',     icon: HelpCircle,  cor: '#5330ff' },
];

export function FeedbackModal() {
  const { usuariaAtiva } = useUsuarioContext();
  const [aberto, setAberto]     = useState(false);
  const [tipo, setTipo]         = useState('sugestao');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado]   = useState(false);

  async function enviar() {
    if (!mensagem.trim()) return;
    setEnviando(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo, mensagem, perfil: usuariaAtiva,
          pagina: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      });
      setEnviado(true);
      setTimeout(() => { setAberto(false); setEnviado(false); setMensagem(''); setTipo('sugestao'); }, 2000);
    } catch { /* silencioso */ }
    finally { setEnviando(false); }
  }

  return (
    <>
      {/* Botão flutuante */}
      <button onClick={() => setAberto(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{ background: '#5330ff', boxShadow: '3px 3px 0 #82a1fd60' }}
        title="Enviar feedback">
        <MessageSquare className="h-5 w-5 text-white" />
      </button>

      {/* Modal */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4">

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-foreground">Enviar feedback</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Sua opinião melhora o Finexa 💜</p>
              </div>
              <button onClick={() => setAberto(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {enviado ? (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1D9E75]/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-[#1D9E75]" />
                </div>
                <p className="text-sm font-bold text-foreground">Recebido! Obrigada 💜</p>
              </div>
            ) : (
              <>
                {/* Tipo */}
                <div className="grid grid-cols-4 gap-2">
                  {TIPOS.map(t => {
                    const Icon = t.icon;
                    const active = tipo === t.id;
                    return (
                      <button key={t.id} onClick={() => setTipo(t.id)}
                        className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold transition-all border"
                        style={active
                          ? { background: `${t.cor}15`, color: t.cor, borderColor: `${t.cor}40` }
                          : { color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                        }>
                        <Icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Mensagem */}
                <textarea value={mensagem} onChange={e => setMensagem(e.target.value)}
                  placeholder="Descreva o bug, sugestão ou elogio..."
                  rows={4} maxLength={500}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />

                <div className="flex gap-2">
                  <button onClick={() => setAberto(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-border text-muted-foreground hover:bg-secondary transition-colors">
                    Cancelar
                  </button>
                  <button onClick={enviar} disabled={enviando || !mensagem.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                    style={{ background: '#5330ff' }}>
                    {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {enviando ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
