'use client';

import { useState } from 'react';
import { Lock, Plus, X, Check, Loader2, Pencil, Trash2 } from 'lucide-react';
import type { ContaFixaConfig } from '@/lib/types';

interface ContasFixasPanelProps {
  contasFixas: ContaFixaConfig[];
  totalMensal: number;
  onAtualizar?: () => void;
}

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function ContasFixasPanel({ contasFixas: contasIniciais, totalMensal, onAtualizar }: ContasFixasPanelProps) {
  const [modalAberto, setModalAberto]     = useState(false);
  const [contas, setContas]               = useState<ContaFixaConfig[]>(contasIniciais);
  const [novaDesc, setNovaDesc]           = useState('');
  const [novoVal, setNovoVal]             = useState('');
  const [adicionando, setAdicionando]     = useState(false);
  const [salvando, setSalvando]           = useState(false);
  const [erro, setErro]                   = useState('');
  const [sucesso, setSucesso]             = useState(false);

  const totalAtual = contas.reduce((a, c) => a + Number(c.valor), 0);

  function abrirModal() {
    setContas([...contasIniciais]);
    setNovaDesc('');
    setNovoVal('');
    setAdicionando(false);
    setErro('');
    setSucesso(false);
    setModalAberto(true);
  }

  function remover(id: string) {
    setContas(prev => prev.filter(c => c.id !== id));
  }

  function adicionar() {
    if (!novaDesc.trim() || !novoVal || Number(novoVal) <= 0) {
      setErro('Preencha descrição e valor maior que zero.');
      return;
    }
    setContas(prev => [...prev, {
      id: `fixa-${Date.now()}`,
      descricao: novaDesc.trim(),
      valor: Number(novoVal),
      categoria: 'Despesas Fixas',
    }]);
    setNovaDesc('');
    setNovoVal('');
    setAdicionando(false);
    setErro('');
  }

  async function salvar() {
    setSalvando(true);
    setErro('');
    try {
      const res = await fetch('/api/planejamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contas_fixas: contas }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
      setSucesso(true);
      setTimeout(() => {
        setModalAberto(false);
        setSucesso(false);
        onAtualizar?.();
        // Disparar evento para o dashboard recarregar os dados
        window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
      }, 800);
    } catch (e: any) {
      setErro(e.message || 'Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      {/* ── CARD ────────────────────────────────────────────────── */}
      <div className="nb-card bg-card flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="label-uppercase text-muted-foreground text-xs font-black tracking-widest">
            Despesas Fixas
          </span>
          <button
            onClick={abrirModal}
            className="text-xs font-black text-primary hover:underline transition-colors"
          >
            Editar
          </button>
        </div>

        {contasIniciais.length === 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border/50">
              <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Nenhuma despesa fixa configurada ainda.</p>
            </div>
            <button
              onClick={abrirModal}
              className="nb-btn w-full flex items-center justify-center gap-2 py-3 text-sm font-black"
            >
              <Plus className="h-4 w-4" />
              Adicionar Conta
            </button>
          </div>
        ) : (
          <>
            {/* KPI */}
            <div className="p-4 rounded-xl border border-border/50 bg-secondary/40 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Total Mensal em Fixas
                </p>
                <p className="text-2xl font-black tabular-nums text-foreground">{fmt(totalMensal)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Comprometidas todos os meses</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/40">
                <Lock className="h-4 w-4 text-primary" />
              </div>
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {contasIniciais.map((conta, i) => (
                <div key={conta.id || i}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-secondary/30 border border-border/40">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{conta.descricao}</p>
                    <p className="text-xs text-muted-foreground">{conta.categoria || 'Despesas Fixas'} · Recorrente</p>
                  </div>
                  <span className="text-sm font-black text-foreground ml-4 shrink-0">{fmt(conta.valor)}</span>
                </div>
              ))}
            </div>

            {/* Dica */}
            <p className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl p-3">
              <strong className="text-foreground">💡 Dica:</strong> Essas contas são registradas automaticamente como transações recorrentes a cada mês no histórico.
            </p>

            {/* Botão adicionar */}
            <button
              onClick={abrirModal}
              className="nb-btn w-full flex items-center justify-center gap-2 py-3 text-sm font-black"
            >
              <Plus className="h-4 w-4" />
              Adicionar Conta
            </button>
          </>
        )}
      </div>

      {/* ── MODAL ───────────────────────────────────────────────── */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setModalAberto(false); }}
        >
          <div className="nb-card bg-card w-full max-w-md flex flex-col gap-4 p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-foreground">Despesas Fixas</h2>
              <button onClick={() => setModalAberto(false)}
                className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-secondary/40 border border-border/50">
              <span className="text-xs text-muted-foreground font-bold">Total mensal</span>
              <span className="text-base font-black tabular-nums text-foreground">{fmt(totalAtual)}</span>
            </div>

            {/* Lista editável */}
            <div className="flex flex-col gap-2">
              {contas.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma conta fixa ainda.</p>
              )}
              {contas.map((conta, i) => (
                <div key={conta.id || i}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary/30 border border-border/40">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{conta.descricao}</p>
                    <p className="text-xs text-muted-foreground">{fmt(conta.valor)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remover(conta.id!)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Formulário nova conta */}
            {adicionando ? (
              <div className="flex flex-col gap-2 p-3 rounded-xl border-2 border-primary/30 bg-primary/5">
                <p className="text-xs font-black text-foreground">Nova conta fixa</p>
                <input
                  type="text"
                  placeholder="Descrição (ex: Aluguel)"
                  value={novaDesc}
                  onChange={e => setNovaDesc(e.target.value)}
                  autoFocus
                  className="w-full bg-background border-2 border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
                <input
                  type="number"
                  placeholder="Valor (ex: 1500)"
                  value={novoVal}
                  onChange={e => setNovoVal(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && adicionar()}
                  className="w-full bg-background border-2 border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />
                {erro && <p className="text-xs text-red-500 font-bold">{erro}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={adicionar}
                    className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-black flex items-center justify-center gap-1.5">
                    <Check className="h-3.5 w-3.5" /> Adicionar
                  </button>
                  <button type="button" onClick={() => { setAdicionando(false); setErro(''); }}
                    className="px-4 py-2 rounded-xl border-2 border-border text-muted-foreground text-sm font-bold">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setAdicionando(true); setErro(''); }}
                className="flex items-center gap-2 text-sm font-black text-primary hover:underline transition-colors"
              >
                <Plus className="h-4 w-4" /> Adicionar conta fixa
              </button>
            )}

            {erro && !adicionando && (
              <p className="text-xs text-red-500 font-bold">{erro}</p>
            )}

            {/* Botão salvar */}
            <button
              type="button"
              onClick={salvar}
              disabled={salvando || sucesso}
              className="nb-btn w-full py-3.5 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
              style={sucesso ? { background: '#01b695', borderColor: '#01b695', color: 'white' } : {}}
            >
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              {sucesso && <Check className="h-4 w-4" />}
              {sucesso ? 'Salvo!' : salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}