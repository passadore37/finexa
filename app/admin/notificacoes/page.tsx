'use client';

import { useState } from 'react';
import { Bell, Send, Loader2, Check, AlertCircle, ArrowLeft, Users, Zap } from 'lucide-react';
import Link from 'next/link';

const SUGESTOES = [
  { title: '🎙️ Novidade: Lançamento por voz!', body: 'Agora você pode lançar gastos falando. Toque no microfone na tela de lançar e experimente!', url: '/lancar' },
  { title: '💡 Dica do Finexa', body: 'Sabia que você pode ver a evolução dos seus gastos mês a mês? Acesse o Dashboard e explore!', url: '/dashboard' },
  { title: '🎯 Suas metas te esperam', body: 'Que tal conferir como estão seus objetivos financeiros este mês?', url: '/metas' },
  { title: '📊 Fechamento do mês', body: 'O mês está acabando! Confira seu resumo financeiro e planeje o próximo.', url: '/dashboard' },
];

export default function NotificacoesAdminPage() {
  const [adminToken, setAdminToken] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [title,    setTitle]    = useState('');
  const [body,     setBody]     = useState('');
  const [url,      setUrl]      = useState('/dashboard');
  const [apenasTrials, setApenasTrials] = useState(false);
  const [status,   setStatus]   = useState<'idle' | 'enviando' | 'sucesso' | 'erro'>('idle');
  const [resultado, setResultado] = useState<{ enviados: number; falhas: number } | null>(null);
  const [erroMsg,  setErroMsg]  = useState('');

  function autenticar() {
    if (adminToken.length > 8) setAutenticado(true);
    else setErroMsg('Token inválido');
  }

  function usarSugestao(s: typeof SUGESTOES[0]) {
    setTitle(s.title);
    setBody(s.body);
    setUrl(s.url);
  }

  async function enviar() {
    if (!title || !body) return;
    setStatus('enviando');
    setErroMsg('');

    try {
      const res = await fetch('/api/push/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminToken,
        },
        body: JSON.stringify({ title, body, url, apenas_trial: apenasTrials }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Erro ao enviar');

      setResultado({ enviados: data.enviados, falhas: data.falhas });
      setStatus('sucesso');
      setTimeout(() => { setStatus('idle'); setResultado(null); }, 6000);
    } catch (err: any) {
      setErroMsg(err.message);
      setStatus('erro');
      setTimeout(() => { setStatus('idle'); setErroMsg(''); }, 4000);
    }
  }

  // Tela de autenticação
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="nb-card bg-card p-8">
            <div className="w-12 h-12 rounded-xl bg-[#5330ff]/20 flex items-center justify-center mb-6">
              <Bell className="h-6 w-6 text-[#5330ff]" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-1">Notificações</h1>
            <p className="text-sm text-muted-foreground mb-6">Digite o token de admin para continuar</p>

            <input
              type="password"
              placeholder="Token admin"
              value={adminToken}
              onChange={e => setAdminToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && autenticar()}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground mb-3 focus:outline-none focus:ring-2 focus:ring-[#5330ff]"
            />

            {erroMsg && (
              <p className="text-xs text-red-500 mb-3">{erroMsg}</p>
            )}

            <button
              onClick={autenticar}
              className="w-full py-3 rounded-xl text-sm font-black text-white"
              style={{ background: '#5330ff' }}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-foreground">Enviar Notificação</h1>
            <p className="text-sm text-muted-foreground">Broadcast para todos os usuários com push ativo</p>
          </div>
        </div>

        {/* Sugestões rápidas */}
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
            Sugestões rápidas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGESTOES.map(s => (
              <button
                key={s.title}
                onClick={() => usarSugestao(s)}
                className="text-left p-3 rounded-xl border-2 border-border hover:border-[#5330ff]/40 bg-card transition-colors"
              >
                <p className="text-xs font-black text-foreground truncate">{s.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{s.body}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <div className="nb-card bg-card p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
              Título
            </label>
            <input
              type="text"
              placeholder="Ex: 🎙️ Novidade no Finexa"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={50}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#5330ff]"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{title.length}/50</p>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
              Mensagem
            </label>
            <textarea
              placeholder="Ex: Agora você pode lançar gastos por voz. Experimente!"
              value={body}
              onChange={e => setBody(e.target.value)}
              maxLength={120}
              rows={3}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#5330ff]"
            />
            <p className="text-[10px] text-muted-foreground mt-1 text-right">{body.length}/120</p>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
              Link ao tocar
            </label>
            <select
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#5330ff]"
            >
              <option value="/dashboard">Dashboard</option>
              <option value="/lancar">Lançar gasto</option>
              <option value="/metas">Metas</option>
              <option value="/plano">Planos</option>
            </select>
          </div>

          {/* Filtro de público */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
            <button
              onClick={() => setApenasTrials(!apenasTrials)}
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${apenasTrials ? 'bg-[#5330ff]' : 'bg-border'}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${apenasTrials ? 'left-5' : 'left-0.5'}`} />
            </button>
            <div>
              <p className="text-xs font-bold text-foreground">Apenas usuários em trial</p>
              <p className="text-[11px] text-muted-foreground">
                {apenasTrials ? 'Enviará só para quem está no período gratuito' : 'Enviará para todos os usuários'}
              </p>
            </div>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="p-4 rounded-xl border-2 border-dashed border-[#5330ff]/30 bg-[#5330ff]/05">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#5330ff] mb-2">Preview</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5330ff] flex items-center justify-center flex-shrink-0">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{title || '...'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{body || '...'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {status === 'sucesso' && resultado && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 dark:bg-green-950/30 dark:border-green-900">
              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Enviado para <strong>{resultado.enviados}</strong> dispositivo{resultado.enviados !== 1 ? 's' : ''}
                {resultado.falhas > 0 && ` (${resultado.falhas} falha${resultado.falhas !== 1 ? 's' : ''})`}
              </p>
            </div>
          )}

          {status === 'erro' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-900">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{erroMsg}</p>
            </div>
          )}

          {/* Botão enviar */}
          <button
            onClick={enviar}
            disabled={!title || !body || status === 'enviando'}
            className="w-full py-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            style={{ background: '#5330ff' }}
          >
            {status === 'enviando' ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="h-4 w-4" /> Enviar notificação</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}