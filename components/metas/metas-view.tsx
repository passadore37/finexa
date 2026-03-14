'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Pencil, X, Loader2, Target, PiggyBank, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Meta {
  id: string;
  titulo: string;
  descricao?: string;
  valor_alvo: number;
  valor_atual: number;
  cor: string;
  emoji: string;
  data_alvo?: string;
  concluida: boolean;
}

interface Planejamento {
  reserva_atual: number;
  meta_economia_leticia: number;
  meta_economia_giovanna: number;
  salario_leticia: number;
  salario_giovanna: number;
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

const EMOJIS = ['🎯','✈️','🏠','🚗','💍','🎓','🏖️','💻','🐾','🎸','📱','🏋️'];
const CORES = ['#D4537E','#7B5EA7','#1D9E75','#378ADD','#EF9F27','#E24B4A'];

export function MetasView() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [planejamento, setPlanejamento] = useState<Planejamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvandoPlano, setSalvandoPlano] = useState(false);

  // Form nova meta
  const [titulo, setTitulo] = useState('');
  const [valorAlvo, setValorAlvo] = useState('');
  const [valorAtual, setValorAtual] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [cor, setCor] = useState('#D4537E');
  const [dataAlvo, setDataAlvo] = useState('');

  // Form planejamento
  const [reservaAtual, setReservaAtual] = useState('');
  const [metaLeticia, setMetaLeticia] = useState('');
  const [metaGiovanna, setMetaGiovanna] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/metas').then(r => r.json()),
      fetch('/api/planejamento').then(r => r.json()),
    ]).then(([metasRes, planoRes]) => {
      if (metasRes.success) setMetas(metasRes.data || []);
      if (planoRes.success && planoRes.data) {
        const p = planoRes.data;
        setPlanejamento(p);
        setReservaAtual(String(p.reserva_atual || ''));
        setMetaLeticia(String(p.meta_economia_leticia || ''));
        setMetaGiovanna(String(p.meta_economia_giovanna || ''));
      }
    }).finally(() => setCarregando(false));
  }, []);

  async function criarMeta() {
    if (!titulo || !valorAlvo) return;
    const res = await fetch('/api/metas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo, emoji, cor,
        valor_alvo: parseFloat(valorAlvo.replace(',', '.')),
        valor_atual: parseFloat(valorAtual.replace(',', '.')) || 0,
        data_alvo: dataAlvo || null,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMetas(prev => [data.data, ...prev]);
      setCriando(false);
      setTitulo(''); setValorAlvo(''); setValorAtual(''); setDataAlvo('');
      setEmoji('🎯'); setCor('#D4537E');
    }
  }

  async function atualizarDeposito(id: string, novoValor: number) {
    const res = await fetch('/api/metas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, valor_atual: novoValor }),
    });
    const data = await res.json();
    if (data.success) setMetas(prev => prev.map(m => m.id === id ? data.data : m));
    setEditandoId(null);
  }

  async function deletarMeta(id: string) {
    await fetch(`/api/metas?id=${id}`, { method: 'DELETE' });
    setMetas(prev => prev.filter(m => m.id !== id));
  }

  async function concluirMeta(id: string) {
    const res = await fetch('/api/metas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, concluida: true }),
    });
    const data = await res.json();
    if (data.success) setMetas(prev => prev.map(m => m.id === id ? data.data : m));
  }

  async function salvarPlanejamento() {
    setSalvandoPlano(true);
    await fetch('/api/planejamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        salario_leticia: planejamento?.salario_leticia || 0,
        salario_giovanna: planejamento?.salario_giovanna || 0,
        percentual_investimento: 10,
        contas_fixas: [],
        reserva_atual: parseFloat(reservaAtual.replace(',', '.')) || 0,
        meta_economia_leticia: parseFloat(metaLeticia.replace(',', '.')) || 0,
        meta_economia_giovanna: parseFloat(metaGiovanna.replace(',', '.')) || 0,
      }),
    });
    setSalvandoPlano(false);
    window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
  }

  const metaEmergencia = 30000; // poderia vir de env
  const pctReserva = metaEmergencia > 0 ? Math.min((parseFloat(reservaAtual) / metaEmergencia) * 100, 100) : 0;
  const metasAtivas = metas.filter(m => !m.concluida);
  const metasConcluidas = metas.filter(m => m.concluida);

  if (carregando) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Objetivos</p>
        <h2 className="text-xl font-medium text-foreground">Metas financeiras</h2>
      </div>

      {/* Reserva de emergência */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-[#EF9F27]" />
            Reserva de emergência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Valor atual guardado</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">R$</span>
                <input type="number" value={reservaAtual} onChange={e => setReservaAtual(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Meta (6 meses de despesas)</label>
              <p className="text-sm font-medium text-foreground px-3 py-2 bg-secondary/50 rounded-lg">{fmt(metaEmergencia)}</p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>{Math.round(pctReserva)}% da meta</span>
              <span>Falta {fmt(Math.max(0, metaEmergencia - parseFloat(reservaAtual || '0')))}</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctReserva}%`, background: pctReserva >= 100 ? '#3B6D11' : pctReserva >= 50 ? '#EF9F27' : '#E24B4A' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metas de economia individuais */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#4ADE80]" />
            Meta de economia mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: '🌸 Letícia', val: metaLeticia, set: setMetaLeticia, salario: planejamento?.salario_leticia || 0 },
              { label: '💜 Giovanna', val: metaGiovanna, set: setMetaGiovanna, salario: planejamento?.salario_giovanna || 0 },
            ].map(p => {
              const pct = p.salario > 0 ? Math.round((parseFloat(p.val || '0') / p.salario) * 100) : 0;
              return (
                <div key={p.label} className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">{p.label}</label>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <input type="number" value={p.val} onChange={e => p.set(e.target.value)}
                      placeholder="ex: 1000"
                      className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  {p.salario > 0 && <p className="text-[10px] text-muted-foreground">{pct}% do salário</p>}
                </div>
              );
            })}
          </div>
          <button onClick={salvarPlanejamento} disabled={salvandoPlano}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50">
            {salvandoPlano ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Salvar metas de economia + reserva
          </button>
        </CardContent>
      </Card>

      {/* Metas conjuntas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Objetivos do casal</p>
            <h3 className="text-base font-medium text-foreground">Metas conjuntas</h3>
          </div>
          <button onClick={() => setCriando(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">
            <Plus className="h-4 w-4" />Nova meta
          </button>
        </div>

        {/* Form nova meta */}
        {criando && (
          <Card className="border-primary/40 bg-primary/5 mb-4">
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Título</label>
                  <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Viagem para Europa"
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Valor alvo</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <input type="number" value={valorAlvo} onChange={e => setValorAlvo(e.target.value)} placeholder="0"
                      className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Já guardado</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <input type="number" value={valorAtual} onChange={e => setValorAtual(e.target.value)} placeholder="0"
                      className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Data alvo (opcional)</label>
                  <input type="date" value={dataAlvo} onChange={e => setDataAlvo(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className={`w-9 h-9 rounded-lg text-lg transition-all ${emoji === e ? 'bg-primary/20 ring-1 ring-primary' : 'bg-secondary hover:bg-secondary/80'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Cor</label>
                <div className="flex gap-2">
                  {CORES.map(c => (
                    <button key={c} onClick={() => setCor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${cor === c ? 'ring-2 ring-offset-2 ring-offset-background' : ''}`}
                      style={{ background: c, ringColor: c }} />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={criarMeta} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
                  <Check className="h-4 w-4" />Criar meta
                </button>
                <button onClick={() => setCriando(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de metas */}
        {metasAtivas.length === 0 && !criando && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma meta criada ainda</p>
            <p className="text-xs text-muted-foreground mt-1">Crie uma meta para acompanhar seu progresso</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metasAtivas.map(meta => {
            const pct = meta.valor_alvo > 0 ? Math.min((meta.valor_atual / meta.valor_alvo) * 100, 100) : 0;
            const falta = Math.max(0, meta.valor_alvo - meta.valor_atual);
            const isEditando = editandoId === meta.id;
            return (
              <Card key={meta.id} className="border-border bg-card group">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{meta.titulo}</p>
                        {meta.data_alvo && (
                          <p className="text-[10px] text-muted-foreground">
                            até {new Date(meta.data_alvo).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => concluirMeta(meta.id)} className="p-1.5 rounded-lg hover:bg-[#3B6D11]/20 text-muted-foreground hover:text-[#3B6D11]" title="Concluir">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deletarMeta(meta.id)} className="p-1.5 rounded-lg hover:bg-[#A32D2D]/20 text-muted-foreground hover:text-[#E24B4A]" title="Excluir">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progresso */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium tabular-nums">{fmt(meta.valor_atual)}</span>
                      <span className="text-muted-foreground tabular-nums">{fmt(meta.valor_alvo)}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: meta.cor }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{Math.round(pct)}% concluído</span>
                      <span>Falta {fmt(falta)}</span>
                    </div>
                  </div>

                  {/* Depositar */}
                  {isEditando ? (
                    <DepositarForm
                      valorAtual={meta.valor_atual}
                      onSalvar={novoVal => atualizarDeposito(meta.id, novoVal)}
                      onCancelar={() => setEditandoId(null)}
                    />
                  ) : (
                    <button onClick={() => setEditandoId(meta.id)}
                      className="mt-3 w-full py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center justify-center gap-1">
                      <Pencil className="h-3 w-3" />Atualizar valor guardado
                    </button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Metas concluídas */}
        {metasConcluidas.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Concluídas 🎉</p>
            <div className="space-y-2">
              {metasConcluidas.map(meta => (
                <div key={meta.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#3B6D11]/10 border border-[#3B6D11]/20 opacity-75">
                  <span className="text-xl">{meta.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground line-through">{meta.titulo}</p>
                    <p className="text-xs text-muted-foreground">{fmt(meta.valor_alvo)} guardados</p>
                  </div>
                  <Check className="h-4 w-4 text-[#3B6D11]" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DepositarForm({ valorAtual, onSalvar, onCancelar }: { valorAtual: number; onSalvar: (v: number) => void; onCancelar: () => void }) {
  const [novo, setNovo] = useState(String(valorAtual));
  return (
    <div className="mt-3 flex gap-2">
      <div className="flex items-center gap-1 flex-1 bg-secondary border border-primary rounded-lg px-2">
        <span className="text-xs text-muted-foreground">R$</span>
        <input type="number" value={novo} onChange={e => setNovo(e.target.value)} autoFocus
          className="flex-1 bg-transparent py-1.5 text-sm text-foreground focus:outline-none" />
      </div>
      <button onClick={() => onSalvar(parseFloat(novo) || 0)} className="px-2 py-1.5 rounded-lg bg-primary text-white text-xs"><Check className="h-3.5 w-3.5" /></button>
      <button onClick={onCancelar} className="px-2 py-1.5 rounded-lg border border-border text-xs text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
    </div>
  );
}
