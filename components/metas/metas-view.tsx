'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, Pencil, X as XIcon, Loader2, Target, PiggyBank, TrendingUp } from 'lucide-react';
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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/40 mb-2 leading-none">Objetivos</p>
        <h2 className="text-3xl font-black text-[#08080f] tracking-tighter">Metas financeiras</h2>
      </div>

      {/* Reserva de emergência */}
      <Card className="border-white/50 bg-white/40 shadow-xl shadow-[#EF9F27]/5 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-[#08080f]/40 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#EF9F27]/10">
              <PiggyBank className="h-4 w-4 text-[#EF9F27]" />
            </div>
            Reserva de emergência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block px-1">Valor atual guardado</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#08080f]/30">R$</span>
                <input type="number" value={reservaAtual} onChange={e => setReservaAtual(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black/[0.03] border border-black/5 rounded-2xl pl-10 pr-4 py-4 text-xl font-black text-[#08080f] focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#EF9F27]/10 transition-all tabular-nums" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block px-1">Meta (6 meses)</label>
              <div className="w-full bg-black/[0.02] border border-black/5 rounded-2xl px-5 py-4 flex items-center h-[58px]">
                <p className="text-xl font-black text-[#08080f]/60 tabular-nums">{fmt(metaEmergencia)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline mb-1">
              <p className="text-2xl font-black text-[#08080f] tabular-nums">{Math.round(pctReserva)}% <span className="text-[10px] uppercase font-bold tracking-widest text-[#08080f]/30">da meta conquistada</span></p>
              <p className="text-[10px] font-bold text-[#08080f]/40 uppercase tracking-wider">Falta {fmt(Math.max(0, metaEmergencia - parseFloat(reservaAtual || '0')))}</p>
            </div>
            <div className="h-4 rounded-full bg-black/5 p-1">
              <div className="h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${pctReserva}%`, background: pctReserva >= 100 ? '#37cc94' : pctReserva >= 50 ? '#EF9F27' : '#ff64ca' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metas de economia individuais */}
      <Card className="border-white/50 bg-white/40 shadow-xl shadow-[#4ADE80]/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-[#08080f]/40 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#4ADE80]/10">
              <TrendingUp className="h-4 w-4 text-[#4ADE80]" />
            </div>
            Metas de economia mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: '🌸 Letícia', val: metaLeticia, set: setMetaLeticia, salario: planejamento?.salario_leticia || 0, cor: '#5330ff' },
              { label: '💜 Giovanna', val: metaGiovanna, set: setMetaGiovanna, salario: planejamento?.salario_giovanna || 0, cor: '#ff64ca' },
            ].map(p => {
              const pct = p.salario > 0 ? Math.round((parseFloat(p.val || '0') / p.salario) * 100) : 0;
              return (
                <div key={p.label} className="p-5 rounded-[2rem] bg-white border border-black/5 shadow-sm space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block">{p.label}</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#08080f]/30">R$</span>
                    <input type="number" value={p.val} onChange={e => p.set(e.target.value)}
                      placeholder="ex: 1000"
                      className="w-full bg-black/[0.03] border border-black/5 rounded-2xl pl-10 pr-4 py-4 text-xl font-black text-[#08080f] focus:outline-none focus:bg-white focus:ring-4 transition-all tabular-nums" 
                      style={{ '--tw-ring-color': `${p.cor}10` } as any} />
                  </div>
                  {p.salario > 0 && <p className="text-[10px] font-bold text-[#08080f]/30 uppercase tracking-widest">{pct}% do salário</p>}
                </div>
              );
            })}
          </div>
          <button onClick={salvarPlanejamento} disabled={salvandoPlano}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-3xl bg-[#5330ff] text-white text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-xl shadow-[#5330ff]/20">
            {salvandoPlano ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
            Salvar metas
          </button>
        </CardContent>
      </Card>

      {/* Metas conjuntas */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/40 mb-2 leading-none">Objetivos do casal</p>
            <h3 className="text-2xl font-black text-[#08080f] tracking-tighter">Metas conjuntas</h3>
          </div>
          <button onClick={() => setCriando(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#5330ff] text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#5330ff]/20">
            <Plus className="h-4 w-4 stroke-[3px]" />Nova meta
          </button>
        </div>

        {/* Form nova meta */}
        {criando && (
          <Card className="border-[#5330ff]/20 bg-[#5330ff]/5 mb-8 rounded-[2.5rem] p-4 animate-in zoom-in-95 duration-500">
            <CardContent className="pt-4 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block px-1">Título</label>
                  <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Viagem para Europa"
                    className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold text-[#08080f] focus:outline-none focus:ring-4 focus:ring-[#5330ff]/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block px-1">Valor alvo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#08080f]/20">R$</span>
                    <input type="number" value={valorAlvo} onChange={e => setValorAlvo(e.target.value)} placeholder="0"
                      className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-4 text-sm font-bold text-[#08080f] focus:outline-none focus:ring-4 focus:ring-[#5330ff]/10 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block px-1">Já guardado</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#08080f]/20">R$</span>
                    <input type="number" value={valorAtual} onChange={e => setValorAtual(e.target.value)} placeholder="0"
                      className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-4 text-sm font-bold text-[#08080f] focus:outline-none focus:ring-4 focus:ring-[#5330ff]/10 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block px-1">Data alvo (opcional)</label>
                  <input type="date" value={dataAlvo} onChange={e => setDataAlvo(e.target.value)}
                    className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold text-[#08080f] focus:outline-none focus:ring-4 focus:ring-[#5330ff]/10 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block mb-4 px-1">Escolha um ícone</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className={`w-11 h-11 rounded-xl text-xl transition-all ${emoji === e ? 'bg-white shadow-lg ring-2 ring-[#5330ff] scale-110' : 'bg-black/5 hover:bg-black/10 hover:scale-105'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={criarMeta} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-[#5330ff] text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-xl shadow-[#5330ff]/20">
                  <Check className="h-4 w-4 stroke-[3px]" />CRIAR META
                </button>
                <button onClick={() => setCriando(false)} className="px-6 py-4 rounded-2xl bg-black/5 text-[#08080f]/40 hover:bg-black/10 transition-all">
                  <XIcon className="h-5 w-5" />
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

        <div className="grid grid-cols-1 gap-4">
          {metasAtivas.map(meta => {
            const pct = meta.valor_alvo > 0 ? Math.min((meta.valor_atual / meta.valor_alvo) * 100, 100) : 0;
            const falta = Math.max(0, meta.valor_alvo - meta.valor_atual);
            const isEditando = editandoId === meta.id;
            return (
              <Card key={meta.id} className="border-white/50 bg-white/40 shadow-xl shadow-black/5 group overflow-hidden animate-in fade-in duration-500 rounded-[2rem]">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-500">
                        {meta.emoji}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#08080f] tracking-tighter leading-tight">{meta.titulo}</h3>
                        {meta.data_alvo && (
                          <div className="flex items-center gap-1 mt-1">
                            <CalendarDays className="h-3 w-3 text-[#08080f]/20" />
                            <p className="text-[10px] font-bold text-[#08080f]/30 uppercase tracking-widest">
                              até {new Date(meta.data_alvo).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                      <button onClick={() => concluirMeta(meta.id)} className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all">
                        <Check className="h-5 w-5 stroke-[3px]" />
                      </button>
                      <button onClick={() => deletarMeta(meta.id)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="h-5 w-5 stroke-[2.5px]" />
                      </button>
                    </div>
                  </div>

                  {/* Progresso */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20 leading-none">Conquistado</p>
                        <p className="text-2xl font-black text-[#08080f] tabular-nums leading-none">{fmt(meta.valor_atual)}</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20 leading-none">Objetivo</p>
                        <p className="text-xl font-black text-[#08080f]/40 tabular-nums leading-none">{fmt(meta.valor_alvo)}</p>
                      </div>
                    </div>
                    <div className="h-5 rounded-full bg-black/5 p-1 relative overflow-hidden">
                       {/* Efeito de brilho na barra */}
                      <div className="h-full rounded-full transition-all duration-1000 relative shadow-inner overflow-hidden"
                        style={{ width: `${pct}%`, background: meta.cor }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30">
                      <span>{Math.round(pct)}% CONCLUÍDO</span>
                      <span>FALTA {fmt(falta)}</span>
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
                      className="w-full py-4 rounded-2xl bg-black/[0.03] border border-black/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/40 hover:text-[#5330ff] hover:bg-[#5330ff]/5 hover:border-[#5330ff]/20 transition-all flex items-center justify-center gap-2">
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
    <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 flex-1 bg-white border-2 border-[#5330ff]/30 rounded-2xl px-4 shadow-inner">
        <span className="text-xs font-black text-[#5330ff]/40">R$</span>
        <input type="number" value={novo} onChange={e => setNovo(e.target.value)} autoFocus
          className="flex-1 bg-transparent py-3 text-sm font-black text-[#08080f] focus:outline-none tabular-nums" />
      </div>
      <button onClick={() => onSalvar(parseFloat(novo) || 0)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#5330ff] text-white shadow-lg shadow-[#5330ff]/20 hover:scale-105 transition-all"><Check className="h-5 w-5 stroke-[3px]" /></button>
      <button onClick={onCancelar} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/5 text-[#08080f]/40 hover:bg-black/10 transition-all"><XIcon className="h-5 w-5" /></button>
    </div>
  );
}
