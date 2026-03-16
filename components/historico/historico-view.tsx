'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X, Loader2, ChevronDown } from 'lucide-react';
import { CATEGORIAS_DISPONIVEIS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transacao {
  id: string;
  data: string;
  valor: number;
  categoria: string;
  descricao: string;
  perfil: string;
  divisao: string;
  parcela_atual: number;
  total_parcelas: number;
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

const CORES_CAT: Record<string, string> = {
  'Alimentação': '#D4537E', 'Transporte': '#378ADD', 'Lazer': '#EF9F27',
  'Casa': '#1D9E75', 'Assinaturas': '#7F77DD', 'Saúde': '#E24B4A',
  'Gatos': '#C4843E', 'Moradia': '#4A90A4', 'Compras': '#A85D32',
  'Educação': '#2D6B9A', 'Energia': '#854F0B', 'Gás': '#5A7A52', 'Outros': '#666666',
};

export function HistoricoView() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [confirmandoDelete, setConfirmandoDelete] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/transacoes')
      .then(r => r.json())
      .then(res => { if (res.success) setTransacoes(res.data || []); })
      .finally(() => setCarregando(false));
  }, []);

  function iniciarEdicao(t: Transacao) {
    setEditandoId(t.id);
    setEditValor(String(t.valor));
    setEditCategoria(t.categoria);
    setEditDescricao(t.descricao);
  }

  async function salvarEdicao(id: string) {
    const res = await fetch('/api/transacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        valor: parseFloat(editValor.replace(',', '.')),
        categoria: editCategoria,
        descricao: editDescricao,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setTransacoes(prev => prev.map(t => t.id === id ? data.data : t));
      window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
    }
    setEditandoId(null);
  }

  async function deletar(id: string) {
    await fetch(`/api/transacoes?id=${id}`, { method: 'DELETE' });
    setTransacoes(prev => prev.filter(t => t.id !== id));
    setConfirmandoDelete(null);
    window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
  }

  if (carregando) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );

  const total = transacoes.reduce((acc, t) => acc + t.valor, 0);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="label-uppercase text-muted-foreground">Histórico do mês</CardTitle>
          <span className="text-xs text-muted-foreground">{transacoes.length} lançamentos · {fmt(total)}</span>
        </div>
      </CardHeader>
      <CardContent>
        {transacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum lançamento ainda</p>
        ) : (
          <div className="max-h-[22rem] overflow-y-auto space-y-1">
            {transacoes.map(t => {
              const cor = CORES_CAT[t.categoria] || '#666';
              const isEditando = editandoId === t.id;
              const isConfirmando = confirmandoDelete === t.id;

              if (isEditando) {
                return (
                  <div key={t.id} className="p-3 rounded-lg border border-primary/40 bg-primary/5 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 flex-1 bg-secondary border border-border rounded-lg px-2">
                        <span className="text-xs text-muted-foreground">R$</span>
                        <input type="number" value={editValor} onChange={e => setEditValor(e.target.value)} autoFocus
                          className="flex-1 bg-transparent py-1.5 text-sm text-foreground focus:outline-none" />
                      </div>
                      <input type="text" value={editDescricao} onChange={e => setEditDescricao(e.target.value)}
                        className="flex-1 bg-secondary border border-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:outline-none" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIAS_DISPONIVEIS.map(cat => (
                        <button key={cat} onClick={() => setEditCategoria(cat)}
                          className="px-2 py-0.5 rounded text-[10px] font-medium transition-all"
                          style={editCategoria === cat
                            ? { background: CORES_CAT[cat] || '#666', color: 'white' }
                            : { background: `${CORES_CAT[cat] || '#666'}22`, color: CORES_CAT[cat] || '#666' }
                          }>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => salvarEdicao(t.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs">
                        <Check className="h-3 w-3" />Salvar
                      </button>
                      <button onClick={() => setEditandoId(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 group transition-colors">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground truncate">{t.descricao}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${cor}22`, color: cor }}>{t.categoria}</span>
                      {t.total_parcelas > 1 && <span className="text-[10px] text-muted-foreground flex-shrink-0">{t.parcela_atual}/{t.total_parcelas}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                      {t.perfil && t.perfil !== 'casal' && <span className="text-[10px] text-muted-foreground">{t.perfil}</span>}
                      {t.divisao === '50/50' && <span className="text-[10px] text-muted-foreground">50/50</span>}
                      {t.divisao === 'pessoal' && <span className="text-[10px] text-muted-foreground">Pessoal</span>}
                    </div>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-foreground flex-shrink-0">{fmt(t.valor)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => iniciarEdicao(t)} className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {isConfirmando ? (
                      <>
                        <button onClick={() => deletar(t.id)} className="p-1 rounded bg-[#A32D2D]/20 text-[#E24B4A]"><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setConfirmandoDelete(null)} className="p-1 rounded hover:bg-secondary text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmandoDelete(t.id)} className="p-1 rounded hover:bg-[#A32D2D]/20 text-muted-foreground hover:text-[#E24B4A]">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
