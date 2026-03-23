'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIAS_DISPONIVEIS } from '@/lib/types';

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
  recorrente?: boolean;
  responsavel?: string;
  tipo?: string;
}

type Perfil = 'leticia' | 'giovanna' | 'casal';

interface Props {
  categoriaFiltro?: string | null;
  perfil?: Perfil;
  proporcao?: number; // proporção do salário (ex: 0.57 para leticia)
}

const CORES_CAT: Record<string, string> = {
  Alimentação: '#ff64ca', Transporte: '#82a1fd', Lazer: '#ffa857',
  Casa: '#01b695', Assinaturas: '#7f77dd', Saúde: '#e24b4a',
  Gatos: '#dffd6e', Moradia: '#5330ff', Compras: '#de7ed1',
  Educação: '#378add', Energia: '#fff245', Gás: '#008257', Outros: '#888780',
};

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

// Calcula valor da transação para o perfil ativo com rateio correto
function valorRateado(t: Transacao, perfil: Perfil, prop: number): number {
  if (perfil === 'casal') return t.valor;
  if (t.recorrente) return t.valor * prop;              // fixa: proporcional ao salário
  if (t.responsavel === perfil) return t.valor;          // gasto próprio: valor total
  if (t.responsavel === 'casal' || !t.responsavel || t.divisao === '50/50') return t.valor / 2; // 50/50
  return 0;                                              // gasto da outra pessoa: não entra
}

// Verifica se transação pertence ao perfil
function pertenceAoPerfil(t: Transacao, perfil: Perfil): boolean {
  if (perfil === 'casal') return true;
  if (t.tipo === 'receita') return t.responsavel === perfil;
  return t.recorrente === true ||
    t.responsavel === perfil ||
    t.responsavel === 'casal' ||
    !t.responsavel ||
    t.divisao === '50/50';
}

export function HistoricoView({ categoriaFiltro, perfil = 'casal', proporcao = 0.5 }: Props) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [confirmandoDelete, setConfirmandoDelete] = useState<string | null>(null);

  useEffect(() => {
    buscarTransacoes();
    const handler = () => buscarTransacoes();
    window.addEventListener('planejamento-atualizado', handler);
    return () => window.removeEventListener('planejamento-atualizado', handler);
  }, []);

  function buscarTransacoes() {
    setCarregando(true);
    fetch('/api/transacoes')
      .then(r => r.json())
      .then(res => { if (res.success) setTransacoes(res.data || []); })
      .finally(() => setCarregando(false));
  }

  // Filtrar por perfil ativo
  const transacoesPerfil = transacoes.filter(t => pertenceAoPerfil(t, perfil));

  // Aplicar filtro de categoria (highlight/dim, não esconde)
  const totalGeral = transacoesPerfil.reduce((acc, t) => acc + valorRateado(t, perfil, proporcao), 0);
  const totalFiltrado = categoriaFiltro
    ? transacoesPerfil.filter(t => t.categoria === categoriaFiltro).reduce((acc, t) => acc + valorRateado(t, perfil, proporcao), 0)
    : totalGeral;
  const countFiltrado = categoriaFiltro
    ? transacoesPerfil.filter(t => t.categoria === categoriaFiltro).length
    : transacoesPerfil.length;

  function iniciarEdicao(t: Transacao) {
    setEditandoId(t.id);
    setEditValor(String(t.valor));
    setEditCategoria(t.categoria);
    setEditDescricao(t.descricao);
    setConfirmandoDelete(null);
  }

  async function salvarEdicao(id: string) {
    const res = await fetch('/api/transacoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, valor: parseFloat(editValor.replace(',', '.')), categoria: editCategoria, descricao: editDescricao }),
    });
    const data = await res.json();
    if (data.success) setTransacoes(prev => prev.map(t => t.id === id ? { ...t, ...data.data } : t));
    window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
    setEditandoId(null);
  }

  async function deletar(id: string) {
    await fetch(`/api/transacoes?id=${id}`, { method: 'DELETE' });
    setTransacoes(prev => prev.filter(t => t.id !== id));
    setConfirmandoDelete(null);
    window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
  }

  if (carregando) return (
    <Card className="border bg-card">
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );

  return (
    <Card className="border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="label-uppercase text-muted-foreground">Histórico do mês</CardTitle>
            {categoriaFiltro && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: CORES_CAT[categoriaFiltro] || '#888', color: ['#dffd6e','#fff245','#ffa857'].includes(CORES_CAT[categoriaFiltro]) ? '#000' : '#fff' }}>
                {categoriaFiltro}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {categoriaFiltro
              ? `${countFiltrado} de ${transacoesPerfil.length} · ${fmt(totalFiltrado)}`
              : `${transacoesPerfil.length} lançamentos · ${fmt(totalGeral)}`
            }
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {transacoesPerfil.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            Nenhum lançamento ainda
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transacoesPerfil.map(t => {
              const cor = CORES_CAT[t.categoria] || '#888';
              const isDestacado = !categoriaFiltro || t.categoria === categoriaFiltro;
              const isDimmed = !!categoriaFiltro && !isDestacado;
              const isEditando = editandoId === t.id;
              const isConfirmando = confirmandoDelete === t.id;
              const valorExibido = valorRateado(t, perfil, proporcao);

              if (isEditando) {
                return (
                  <div key={t.id} className="p-3 space-y-2 bg-secondary/30">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1 flex-1 bg-card border border-primary rounded-lg px-2">
                        <span className="text-xs text-muted-foreground">R$</span>
                        <input type="number" value={editValor} onChange={e => setEditValor(e.target.value)}
                          autoFocus className="flex-1 bg-transparent py-2 text-sm text-foreground focus:outline-none" />
                      </div>
                      <input type="text" value={editDescricao} onChange={e => setEditDescricao(e.target.value)}
                        className="flex-1 bg-card border border-border rounded-lg px-2 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIAS_DISPONIVEIS.map(cat => (
                        <button key={cat} onClick={() => setEditCategoria(cat)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all"
                          style={editCategoria === cat
                            ? { background: CORES_CAT[cat] || '#888', color: '#000' }
                            : { background: `${CORES_CAT[cat] || '#888'}20`, color: CORES_CAT[cat] || '#888' }}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => salvarEdicao(t.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-white"
                        style={{ background: 'var(--indigo)' }}>
                        <Check className="h-3 w-3" />Salvar
                      </button>
                      <button onClick={() => setEditandoId(null)}
                        className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-secondary">
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={t.id}
                  className="flex items-center gap-3 px-4 py-3 group transition-all duration-150"
                  style={{
                    opacity: isDimmed ? 0.25 : 1,
                    background: isDestacado && categoriaFiltro ? `${cor}12` : 'transparent',
                    borderLeft: `3px solid ${isDestacado && categoriaFiltro ? cor : 'transparent'}`,
                  }}
                >
                  <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: cor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm text-foreground font-medium truncate">{t.descricao}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                        style={{ background: `${cor}20`, color: cor }}>
                        {t.categoria}
                      </span>
                      {t.total_parcelas > 1 && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {t.parcela_atual}/{t.total_parcelas}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(t.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                      {t.perfil && t.perfil !== 'casal' && (
                        <span className="text-[11px] text-muted-foreground capitalize">{t.perfil}</span>
                      )}
                      {/* Mostrar divisão real */}
                      {t.divisao && perfil !== 'casal' && (
                        <span className="text-[11px] text-muted-foreground">{t.divisao}</span>
                      )}
                    </div>
                  </div>

                  {/* Valor com rateio aplicado */}
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {fmt(valorExibido)}
                    </span>
                    {/* Mostrar valor original se diferente (para contexto) */}
                    {perfil !== 'casal' && valorExibido !== t.valor && (
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        total: {fmt(t.valor)}
                      </span>
                    )}
                  </div>

                  {/* Ações: sempre visíveis no mobile */}
                  <div className="flex gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => iniciarEdicao(t)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    {isConfirmando ? (
                      <>
                        <button onClick={() => deletar(t.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-destructive"
                          style={{ background: 'rgba(226,75,74,0.12)' }}>
                          <Check className="h-4 w-4" />
                        </button>
                        <button onClick={() => setConfirmandoDelete(null)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary text-muted-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmandoDelete(t.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(226,75,74,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Trash2 className="h-4 w-4" />
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
