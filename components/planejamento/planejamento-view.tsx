'use client';

import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Receipt, Wallet, PiggyBank, CalendarDays, Pencil, Check, X, Info, Save, Loader2 } from 'lucide-react';
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
  const [contasFixas, setContasFixas] = useState<ContaFixa[]>(CONTAS_FIXAS_PADRAO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValor, setEditValor] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
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
      marcarAlterado();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Header com botão salvar */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Metodologia</p>
          <h2 className="text-xl font-medium text-foreground">Planejamento mensal</h2>
          <p className="text-sm text-muted-foreground mt-1">Salário → investimento → contas fixas → gastos semanais</p>
        </div>

        {/* Botão salvar */}
        <button
          onClick={salvar}
          disabled={saveStatus === 'saving' || !alterado}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
            saveStatus === 'saved'
              ? 'bg-[#3B6D11]/20 text-[#4ADE80] border border-[#3B6D11]/30'
              : saveStatus === 'error'
              ? 'bg-[#A32D2D]/20 text-[#E24B4A] border border-[#A32D2D]/30'
              : alterado
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-secondary text-muted-foreground border border-border cursor-not-allowed'
          }`}
        >
          {saveStatus === 'saving' ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
          ) : saveStatus === 'saved' ? (
            <><Check className="h-4 w-4" />Salvo</>
          ) : saveStatus === 'error' ? (
            <><X className="h-4 w-4" />Erro</>
          ) : (
            <><Save className="h-4 w-4" />{alterado ? 'Salvar' : 'Salvo'}</>
          )}
        </button>
      </div>

      {alterado && (
        <div className="p-3 rounded-lg bg-[#854F0B]/10 border border-[#854F0B]/30">
          <p className="text-xs text-[#EF9F27]">Você tem alterações não salvas. Clique em <strong>Salvar</strong> para persistir.</p>
        </div>
      )}

      {/* Etapa 1 — Salários */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold flex items-center justify-center">1</span>
            <Wallet className="h-4 w-4 text-primary" />
            Salário do mês
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Letícia', val: salLet, set: (v: number) => { setSalLet(v); marcarAlterado(); } },
              { label: 'Giovanna', val: salGio, set: (v: number) => { setSalGio(v); marcarAlterado(); } },
            ].map(s => (
              <div key={s.label}>
                <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">{s.label}</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <input
                    type="number"
                    value={s.val}
                    onChange={e => s.set(parseFloat(e.target.value) || 0)}
                    className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border-l-2 border-primary flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total combinado</span>
            <span className="text-xl font-medium tabular-nums text-foreground">{fmt(salarioTotal)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Etapa 2 — Investimento */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#3B6D11]/30 text-[#4ADE80] text-[10px] font-semibold flex items-center justify-center">2</span>
            <TrendingUp className="h-4 w-4 text-[#4ADE80]" />
            Investimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="range" min={5} max={30} step={1} value={pctInvestimento}
              onChange={e => { setPctInvestimento(parseInt(e.target.value)); marcarAlterado(); }}
              className="flex-1 accent-primary"
            />
            <span className="text-lg font-medium tabular-nums text-[#4ADE80] min-w-[40px]">{pctInvestimento}%</span>
          </div>
          <div className="p-3 rounded-lg bg-[#3B6D11]/10 border-l-2 border-[#3B6D11] flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Separar antes de qualquer gasto</p>
            <span className="text-xl font-medium tabular-nums text-[#4ADE80]">{fmt(investimento)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Etapa 3 — Contas Fixas */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#A32D2D]/30 text-[#E24B4A] text-[10px] font-semibold flex items-center justify-center">3</span>
            <Receipt className="h-4 w-4 text-[#E24B4A]" />
            Contas fixas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contasFixas.map(conta => (
            <div key={conta.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 group">
              <span className="text-sm text-foreground flex-1">{conta.descricao}</span>
              {editandoId === conta.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">R$</span>
                  <input
                    type="number" value={editValor}
                    onChange={e => setEditValor(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && salvarEdicao(conta.id)}
                    autoFocus
                    className="w-24 bg-secondary border border-primary rounded px-2 py-1 text-sm text-foreground focus:outline-none"
                  />
                  <button onClick={() => salvarEdicao(conta.id)} className="text-[#3B6D11]"><Check className="h-4 w-4" /></button>
                  <button onClick={() => setEditandoId(null)} className="text-muted-foreground"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-[#E24B4A]">{fmt(conta.valor)}</span>
                  <button onClick={() => iniciarEdicao(conta)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => removerConta(conta.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-[#E24B4A] text-xs">✕</button>
                </div>
              )}
            </div>
          ))}

          {adicionando ? (
            <div className="flex gap-2 pt-1">
              <input type="text" placeholder="Descrição" value={novaDescricao}
                onChange={e => setNovaDescricao(e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <input type="text" placeholder="Valor" value={novoValor}
                onChange={e => setNovoValor(e.target.value)}
                className="w-28 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              <button onClick={adicionarConta} className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">+</button>
              <button onClick={() => setAdicionando(false)} className="px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <button onClick={() => setAdicionando(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              + Adicionar conta fixa
            </button>
          )}

          <div className="p-3 rounded-lg bg-[#A32D2D]/10 border-l-2 border-[#A32D2D] flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{Math.round(pctFixas)}% do salário comprometido</span>
            <span className="text-xl font-medium tabular-nums text-[#E24B4A]">{fmt(totalFixas)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Etapa 4 — Gastos Semanais */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#854F0B]/30 text-[#EF9F27] text-[10px] font-semibold flex items-center justify-center">4</span>
            <CalendarDays className="h-4 w-4 text-[#EF9F27]" />
            Orçamento semanal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
            {[
              { label: 'Salário total', val: fmt(salarioTotal), cor: '' },
              { label: `− Investimento (${pctInvestimento}%)`, val: `− ${fmt(investimento)}`, cor: 'text-[#4ADE80]' },
              { label: '− Contas fixas', val: `− ${fmt(totalFixas)}`, cor: 'text-[#E24B4A]' },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={`tabular-nums ${item.cor || 'text-foreground'}`}>{item.val}</span>
              </div>
            ))}
            <div className="h-px bg-border" />
            <div className="flex justify-between">
              <span className="text-sm font-medium text-foreground">Para gastos variáveis</span>
              <span className="text-lg font-medium tabular-nums text-[#EF9F27]">{fmt(disponivelGastos)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Dividido em {semanas.length} semanas</span>
              <span className="text-sm font-medium tabular-nums text-primary">{fmt(porSemana)}/semana</span>
            </div>
          </div>

          {/* Barra de distribuição */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Distribuição do salário</p>
            <div className="h-8 rounded-full overflow-hidden flex">
              {[
                { w: pctInvestimento, bg: '#3B6D11', label: `${pctInvestimento}%` },
                { w: pctFixas, bg: '#A32D2D', label: `${Math.round(pctFixas)}%` },
                { w: pctGastos, bg: '#854F0B', label: `${Math.round(pctGastos)}%` },
              ].map((seg, i) => (
                <div key={i} className="h-full flex items-center justify-center text-[10px] font-medium text-white transition-all duration-500"
                  style={{ width: `${seg.w}%`, background: seg.bg }}>
                  {seg.w > 8 ? seg.label : ''}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2">
              {[{ cor: '#3B6D11', label: 'Investimento' }, { cor: '#A32D2D', label: 'Fixas' }, { cor: '#854F0B', label: 'Gastos' }].map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: item.cor }} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Cards de semanas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {semanas.map(semana => {
              const isAtual = semana.numero === semanaAtual;
              const isPast = semana.numero < semanaAtual;
              return (
                <div key={semana.numero} className={`p-4 rounded-lg border transition-all ${isAtual ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-secondary/30'} ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground">Semana {semana.numero}</span>
                    {isAtual && <span className="text-[9px] uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full">atual</span>}
                    {isPast && <span className="text-[9px] uppercase tracking-wider text-muted-foreground">encerrada</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{semana.label.split('—')[1]?.trim()}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-medium tabular-nums text-primary">{fmt(porSemana)}</span>
                    <span className="text-xs text-muted-foreground">disponível</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              O que sobrar de uma semana pode ser usado na seguinte ou poupado. O acompanhamento real aparece na aba <strong className="text-foreground">Gastos</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumo final */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { corBg: '#3B6D11', corTexto: '#4ADE80', icon: TrendingUp, label: 'Investimento mensal', val: fmt(investimento), sub: `${pctInvestimento}% do salário total` },
          { corBg: '#A32D2D', corTexto: '#E24B4A', icon: Receipt, label: 'Comprometido em fixas', val: fmt(totalFixas), sub: `${Math.round(pctFixas)}% do salário total` },
          { corBg: 'D4537E', corTexto: '#D4537E', icon: PiggyBank, label: 'Envelope semanal', val: fmt(porSemana), sub: `${Math.round(pctGastos)}% do salário · ${semanas.length} semanas` },
        ].map((card, i) => (
          <div key={i} className="p-4 rounded-xl border" style={{ background: `${card.corBg}1A`, borderColor: `${card.corBg}33` }}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon className="h-4 w-4" style={{ color: card.corTexto }} />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{card.label}</span>
            </div>
            <p className="text-2xl font-medium tabular-nums" style={{ color: card.corTexto }}>{card.val}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Botão salvar fixo no rodapé mobile */}
      {alterado && (
        <div className="fixed bottom-4 right-4 z-50 sm:hidden">
          <button
            onClick={salvar}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white text-sm font-medium shadow-lg hover:bg-primary/90 transition-all"
          >
            {saveStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar alterações
          </button>
        </div>
      )}
    </div>
  );
}
