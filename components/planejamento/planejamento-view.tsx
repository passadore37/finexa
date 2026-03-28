'use client';

import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Receipt, Wallet, PiggyBank, CalendarDays, Pencil, Check, X as XIcon, Info, Save, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  salarioLeticia: number;
  salarioGiovanna: number;
}

interface ContaFixa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function fmt(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getSemanasDoMes(): Array<{ numero: number; label: string }> {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const semanas = [];
  let inicio = new Date(primeiroDia);
  let num = 1;
  while (inicio <= ultimoDia) {
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + (6 - inicio.getDay()));
    if (fim > ultimoDia) fim.setTime(ultimoDia.getTime());
    const dI = inicio.getDate().toString().padStart(2, '0');
    const dF = fim.getDate().toString().padStart(2, '0');
    semanas.push({ numero: num, label: `Sem ${num} — ${dI} a ${dF}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}` });
    inicio = new Date(fim);
    inicio.setDate(inicio.getDate() + 1);
    num++;
  }
  return semanas;
}

const CONTAS_FIXAS_PADRAO: ContaFixa[] = [
  { id: '1', descricao: 'Aluguel', valor: 2200, categoria: 'Moradia' },
  { id: '2', descricao: 'Condomínio', valor: 650, categoria: 'Moradia' },
  { id: '3', descricao: 'Plano de Saúde', valor: 890, categoria: 'Saúde' },
  { id: '4', descricao: 'Internet', valor: 120, categoria: 'Assinaturas' },
  { id: '5', descricao: 'Streaming', valor: 69, categoria: 'Assinaturas' },
  { id: '6', descricao: 'Gás', valor: 80, categoria: 'Casa' },
  { id: '7', descricao: 'Energia', valor: 180, categoria: 'Casa' },
];

export function PlanejamentoView({ salarioLeticia, salarioGiovanna }: Props) {
  const [salLet, setSalLet] = useState(salarioLeticia || 8500);
  const [salGio, setSalGio] = useState(salarioGiovanna || 6500);
  const [pctInvestimento, setPctInvestimento] = useState(10);
  const [contasFixas, setContasFixas] = useState<ContaFixa[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [importandoFixas, setImportandoFixas] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [alterado, setAlterado] = useState(false);

  const semanas = useMemo(() => getSemanasDoMes(), []);
  const hoje = new Date();

  const semanaAtual = useMemo(() => {
    const semanasMes = getSemanasDoMes();
    const dia = hoje.getDate();
    for (let i = 0; i < semanasMes.length; i++) {
      const partes = semanasMes[i].label.split('—')[1]?.trim().split(' ') || [];
      const ini = parseInt(partes[0]);
      const fim = parseInt(semanasMes[i].label.split('a ')[1]?.split('/')[0] || '0');
      if (dia >= ini && dia <= fim) return i + 1;
    }
    return 1;
  }, []);

  // Carregar dados do Supabase ao montar
  useEffect(() => {
    fetch('/api/planejamento')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setSalLet(res.data.salario_leticia);
          setSalGio(res.data.salario_giovanna);
          setPctInvestimento(res.data.percentual_investimento);
          if (res.data.contas_fixas?.length > 0) {
            setContasFixas(res.data.contas_fixas);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  // Marcar como alterado quando qualquer valor muda
  const marcarAlterado = () => setAlterado(true);

  async function importarFixasMes() {
    setImportandoFixas(true);
    setImportMsg('');
    try {
      const res = await fetch('/api/fixas-mensais', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setImportMsg(data.message);
        window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
      } else {
        setImportMsg('Erro ao importar');
      }
    } catch {
      setImportMsg('Erro ao importar');
    } finally {
      setImportandoFixas(false);
      setTimeout(() => setImportMsg(''), 4000);
    }
  }

  async function salvar() {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/planejamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salario_leticia: salLet,
          salario_giovanna: salGio,
          percentual_investimento: pctInvestimento,
          contas_fixas: contasFixas,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('saved');
        setAlterado(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }

  const salarioTotal = salLet + salGio;
  const investimento = salarioTotal * (pctInvestimento / 100);
  const totalFixas = contasFixas.reduce((a, c) => a + c.valor, 0);
  const disponivelGastos = Math.max(0, salarioTotal - investimento - totalFixas);
  const porSemana = semanas.length > 0 ? disponivelGastos / semanas.length : 0;
  const pctFixas = salarioTotal > 0 ? (totalFixas / salarioTotal) * 100 : 0;
  const pctGastos = salarioTotal > 0 ? (disponivelGastos / salarioTotal) * 100 : 0;

  function iniciarEdicao(conta: ContaFixa) {
    setEditandoId(conta.id);
    setEditValor(conta.valor.toString());
  }

  function salvarEdicao(id: string) {
  const novoVal = parseFloat(editValor.replace(',', '.'));
  if (!isNaN(novoVal) && novoVal >= 0) {
    setContasFixas(prev => prev.map(c => c.id === id ? { ...c, valor: novoVal } : c));
    salvar(); // salva direto, sem precisar clicar no botão
  }
  setEditandoId(null);
}

  function removerConta(id: string) {
    setContasFixas(prev => prev.filter(c => c.id !== id));
    marcarAlterado();
  }

  function adicionarConta() {
    const valor = parseFloat(novoValor.replace(',', '.'));
    if (!novaDescricao || isNaN(valor) || valor <= 0) return;
    setContasFixas(prev => [...prev, { id: Date.now().toString(), descricao: novaDescricao, valor, categoria: 'Outros' }]);
    setNovaDescricao('');
    setNovoValor('');
    setAdicionando(false);
    marcarAlterado();
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header com botão salvar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 mb-2 leading-none">Planejamento</p>
          <h2 className="text-4xl font-black text-[#08080f] tracking-tighter">Despesas Fixas</h2>
          <p className="text-xs font-bold text-[#08080f]/40 mt-2 uppercase tracking-widest">Salário → investimento → fixas → envelope semanal</p>
        </div>

        <button
          onClick={salvar}
          disabled={saveStatus === 'saving' || !alterado}
          className={`flex items-center justify-center gap-3 px-8 py-4 rounded-3xl text-sm font-black uppercase tracking-widest transition-all shadow-xl ${
            saveStatus === 'saved'
              ? 'bg-[#37cc94] text-white shadow-[#37cc94]/20'
              : saveStatus === 'error'
              ? 'bg-[#ff64ca] text-white shadow-[#ff64ca]/20'
              : alterado
              ? 'bg-[#5330ff] text-white hover:scale-105 active:scale-95 shadow-[#5330ff]/20'
              : 'bg-black/5 text-[#08080f]/20 cursor-not-allowed shadow-none border border-black/5'
          }`}
        >
          {saveStatus === 'saving' ? (
            <><Loader2 className="h-4 w-4 animate-spin" />SALVANDO...</>
          ) : saveStatus === 'saved' ? (
            <><Check className="h-5 w-5 stroke-[3px]" />SALVO</>
          ) : saveStatus === 'error' ? (
            <><XIcon className="h-5 w-5" />ERRO</>
          ) : (
            <><Save className="h-5 w-5" />{alterado ? 'SALVAR' : 'SEM ALTERAÇÕES'}</>
          )}
        </button>
      </div>

      {alterado && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold text-center animate-pulse">
          VOCÊ TEM ALTERAÇÕES NÃO SALVAS
        </div>
      )}

      {/* Etapa 1 — Salários */}
      <Card className="border-white/50 bg-white/40 shadow-xl shadow-black/5 p-6 space-y-8 rounded-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-[#5330ff]/10 text-[#5330ff] flex items-center justify-center font-black text-lg">1</div>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-[#5330ff]/40" />
            <h3 className="text-xl font-black text-[#08080f] tracking-tighter">Salários Combinados</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {[
            { label: '🌸 Letícia', val: salLet, set: (v: number) => { setSalLet(v); marcarAlterado(); } },
            { label: '💜 Giovanna', val: salGio, set: (v: number) => { setSalGio(v); marcarAlterado(); } },
          ].map(s => (
            <div key={s.label} className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 block px-2">{s.label}</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#08080f]/30">R$</span>
                <input
                  type="number"
                  value={s.val}
                  onChange={e => s.set(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/[0.03] border border-black/5 rounded-2xl pl-12 pr-6 py-5 text-2xl font-black text-[#08080f] focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#5330ff]/10 transition-all tabular-nums"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="p-8 rounded-[2rem] bg-[#5330ff] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-[#5330ff]/20">
          <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Total bruto mensal</span>
          <span className="text-4xl font-black tabular-nums">{fmt(salarioTotal)}</span>
        </div>
      </Card>

      {/* Etapa 2 — Investimento */}
      <Card className="border-white/50 bg-white/40 shadow-xl shadow-black/5 p-6 space-y-8 rounded-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-[#37cc94]/10 text-[#37cc94] flex items-center justify-center font-black text-lg">2</div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-[#37cc94]/40" />
            <h3 className="text-xl font-black text-[#08080f] tracking-tighter">Investimento Primeiro</h3>
          </div>
        </div>

        <div className="space-y-12 py-4">
          <div className="relative px-2">
            <input
              type="range" min={0} max={30} step={1} value={pctInvestimento}
              onChange={e => { setPctInvestimento(parseInt(e.target.value)); marcarAlterado(); }}
              className="w-full h-3 bg-black/5 rounded-full appearance-none cursor-pointer accent-[#37cc94]"
            />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#37cc94] text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
              {pctInvestimento}%
            </div>
          </div>
          <div className="p-8 rounded-[2rem] bg-[#37cc94] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-[#37cc94]/20">
            <div className="text-center sm:text-left">
              <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60 block mb-1">Separar para o futuro</span>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Antes de pagar qualquer conta</p>
            </div>
            <span className="text-4xl font-black tabular-nums">{fmt(investimento)}</span>
          </div>
        </div>
      </Card>

      {/* Etapa 3 — Despesas Fixas */}
      <Card className="border-white/50 bg-white/40 shadow-xl shadow-black/5 p-6 space-y-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.25rem] bg-[#ff64ca]/10 text-[#ff64ca] flex items-center justify-center font-black text-lg">3</div>
            <div className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-[#ff64ca]/40" />
              <h3 className="text-xl font-black text-[#08080f] tracking-tighter">Despesas Fixas</h3>
            </div>
          </div>
          <div className="hidden sm:block text-right">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20">Comprometido</p>
             <p className="text-xl font-black text-[#ff64ca] tabular-nums">{fmt(totalFixas)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {contasFixas.map(conta => (
            <div key={conta.id} className="flex items-center justify-between p-5 rounded-3xl bg-white border border-black/5 shadow-sm group hover:shadow-md transition-all">
              <span className="text-sm font-bold text-[#08080f] flex-1">{conta.descricao}</span>
              {editandoId === conta.id ? (
                <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#08080f]/30">R$</span>
                    <input
                      type="number" value={editValor}
                      onChange={e => setEditValor(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && salvarEdicao(conta.id)}
                      autoFocus
                      className="w-28 bg-black/[0.03] border border-[#5330ff]/40 rounded-xl pl-8 pr-3 py-2 text-sm font-bold text-[#08080f] focus:outline-none focus:bg-white transition-all"
                    />
                  </div>
                  <button onClick={() => salvarEdicao(conta.id)} className="w-10 h-10 rounded-xl bg-[#37cc94]/10 text-[#37cc94] flex items-center justify-center hover:bg-[#37cc94] hover:text-white transition-all">
                    <Check className="h-5 w-5 stroke-[3px]" />
                  </button>
                  <button onClick={() => setEditandoId(null)} className="w-10 h-10 rounded-xl bg-black/5 text-[#08080f]/20 flex items-center justify-center hover:bg-black/10 transition-all">
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <span className="text-lg font-black tabular-nums text-[#ff64ca]">{fmt(conta.valor)}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500">
                    <button onClick={() => iniciarEdicao(conta)} className="w-9 h-9 rounded-xl bg-black/[0.03] text-[#08080f]/30 flex items-center justify-center hover:bg-[#5330ff]/10 hover:text-[#5330ff] transition-all">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => removerConta(conta.id)} className="w-9 h-9 rounded-xl bg-red-500/5 text-red-500/30 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Ferramentas de importação e adição */}
          <div className="pt-4 flex flex-col gap-6">
            <button
              onClick={importarFixasMes}
              disabled={importandoFixas}
              className="group flex items-center gap-3 self-start text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20 hover:text-[#5330ff] transition-all"
            >
              <div className={`p-2 rounded-lg bg-black/[0.02] group-hover:bg-[#5330ff]/10 transition-all ${importandoFixas ? 'animate-spin' : ''}`}>
                <RefreshCw className="h-4 w-4" />
              </div>
              {importMsg || 'Sincronizar com lançamentos do mês'}
            </button>

            {adicionando ? (
              <div className="flex flex-col sm:flex-row gap-4 p-6 rounded-[2rem] bg-black/[0.02] border border-black/5 animate-in slide-in-from-top-4 duration-500">
                <input type="text" placeholder="Ex: Novo Streaming" value={novaDescricao}
                  onChange={e => setNovaDescricao(e.target.value)}
                  className="flex-1 bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-bold text-[#08080f] focus:outline-none focus:ring-4 focus:ring-[#5330ff]/10 transition-all" />
                <div className="relative sm:w-40">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#08080f]/30">R$</span>
                  <input type="number" placeholder="0" value={novoValor}
                    onChange={e => setNovoValor(e.target.value)}
                    className="w-full bg-white border border-black/5 rounded-2xl pl-10 pr-4 py-4 text-sm font-bold text-[#08080f] focus:outline-none focus:ring-4 focus:ring-[#5330ff]/10 transition-all" />
                </div>
                <div className="flex gap-2">
                  <button onClick={adicionarConta} className="flex-1 sm:flex-none px-6 py-4 rounded-2xl bg-[#5330ff] text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#5330ff]/20">ADICIONAR</button>
                  <button onClick={() => setAdicionando(false)} className="px-6 py-4 rounded-2xl bg-black/5 text-[#08080f]/40 hover:bg-black/10 transition-all"><XIcon className="h-5 w-5" /></button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdicionando(true)} className="w-full py-5 rounded-[2rem] border-2 border-dashed border-black/5 text-[10px] font-black uppercase tracking-[0.3em] text-[#08080f]/20 hover:text-[#5330ff] hover:border-[#5330ff]/20 hover:bg-[#5330ff]/5 transition-all">
                + ADICIONAR DESPESA FIXA
              </button>
            )}
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-[#ff64ca] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-[#ff64ca]/20">
          <div className="text-center sm:text-left">
             <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60 block mb-1">Total comprometido</span>
             <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{Math.round(pctFixas)}% dos salários combinados</p>
          </div>
          <span className="text-4xl font-black tabular-nums">{fmt(totalFixas)}</span>
        </div>
      </Card>

      {/* Etapa 4 — Gastos Semanais */}
      <Card className="border-white/50 bg-white/40 shadow-xl shadow-black/5 p-6 space-y-10 rounded-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[1.25rem] bg-[#EF9F27]/10 text-[#EF9F27] flex items-center justify-center font-black text-lg">4</div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-[#EF9F27]/40" />
            <h3 className="text-xl font-black text-[#08080f] tracking-tighter">Budget Semanal</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Coluna resumo visual */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-xl space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20 mb-2 leading-none">Disponível para o mês</p>
                <p className="text-5xl font-black text-[#EF9F27] tabular-nums tracking-tighter">{fmt(disponivelGastos)}</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Salário total', val: fmt(salarioTotal), cor: 'text-[#08080f]/60' },
                  { label: `Investimento`, val: `− ${fmt(investimento)}`, cor: 'text-[#37cc94]' },
                  { label: 'Despesas fixas', val: `− ${fmt(totalFixas)}`, cor: 'text-[#ff64ca]' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-[#08080f]/20">{item.label}</span>
                    <span className={`tabular-nums ${item.cor}`}>{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-black/5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20 leading-none mb-1">Por semana</span>
                    <p className="text-xs font-bold text-[#08080f]/40 uppercase tracking-widest">Em {semanas.length} semanas</p>
                  </div>
                  <p className="text-3xl font-black text-[#5330ff] tabular-nums tracking-tighter">{fmt(porSemana)}</p>
                </div>
              </div>
            </div>

            {/* Barra de distribuição */}
            <div className="px-2 space-y-6">
              <div className="h-8 rounded-full overflow-hidden flex shadow-inner bg-black/5 p-1">
                {[
                  { w: pctInvestimento, bg: '#37cc94', label: 'INV' },
                  { w: pctFixas, bg: '#ff64ca', label: 'FIX' },
                  { w: pctGastos, bg: '#EF9F27', label: 'GAS' },
                ].map((seg, i) => (
                  <div key={i} className="h-full flex items-center justify-center text-[8px] font-black text-white transition-all duration-1000 rounded-full"
                    style={{ width: `${seg.w}%`, background: seg.bg, margin: '0 1px' }}>
                    {seg.w > 12 ? seg.label : ''}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-6 justify-center">
                {[{ cor: '#37cc94', label: 'INVESTIMENTO' }, { cor: '#ff64ca', label: 'FIXAS' }, { cor: '#EF9F27', label: 'GASTOS' }].map(item => (
                  <span key={item.label} className="flex items-center gap-2 text-[8px] font-black tracking-[0.2em] text-[#08080f]/30">
                    <span className="w-2 h-2 rounded-full" style={{ background: item.cor }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna Semanas */}
          <div className="lg:col-span-7 space-y-4">
            {semanas.map(semana => {
              const isAtual = semana.numero === semanaAtual;
              const isPast = semana.numero < semanaAtual;
              return (
                <div key={semana.numero} className={`p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden ${
                  isAtual 
                  ? 'border-[#5330ff]/20 bg-white shadow-xl shadow-[#5330ff]/5 scale-[1.02] z-10' 
                  : 'border-black/5 bg-black/[0.02] opacity-60'
                }`}>
                  {isAtual && <div className="absolute top-0 right-0 h-1 w-20 bg-[#5330ff] rounded-bl-xl" />}
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-[#08080f] tracking-tighter">Semana {semana.numero}</span>
                        {isAtual && <span className="text-[8px] font-black uppercase tracking-widest bg-[#5330ff] text-white px-3 py-1 rounded-full">Atual</span>}
                      </div>
                      <p className="text-[10px] font-bold text-[#08080f]/30 uppercase tracking-[0.1em]">{semana.label.split('—')[1]?.trim()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-[#08080f]/20 uppercase tracking-widest mb-1">Envelope</p>
                      <p className={`text-2xl font-black tabular-nums tracking-tighter ${isAtual ? 'text-[#5330ff]' : 'text-[#08080f]/60'}`}>
                        {fmt(porSemana)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="p-6 rounded-[1.5rem] bg-black/5 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-white shadow-sm">
                <Info className="h-4 w-4 text-[#5330ff]" />
              </div>
              <p className="text-[10px] font-bold text-[#08080f]/40 leading-relaxed uppercase tracking-[0.05em]">
                Planeje para não ultrapassar o envelope. O saldo restante pode ser acumulado para a semana seguinte ou poupado para metas futuras.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
