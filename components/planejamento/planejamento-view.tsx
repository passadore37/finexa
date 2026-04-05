'use client';

import { useState, useMemo, useEffect } from 'react';
import { Receipt, Wallet, PiggyBank, CalendarDays, Pencil, Check,
         X as XIcon, Info, Save, Loader2, RefreshCw, Sun, ArrowRight,
         TrendingUp, Zap, Shield, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsuarioContext } from '@/hooks/use-usuario-context';
import { useMesContext } from '@/hooks/use-mes-context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ContaFixa { id: string; descricao: string; valor: number; categoria: string; }
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type Aba = 'configurar' | 'metodologia' | 'orcamento';

const fmt  = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const fmtD = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function getSemanasDoMes(mes?: number, ano?: number) {
  const hoje = new Date();
  const m = mes !== undefined ? mes : hoje.getMonth();
  const a = ano !== undefined ? ano : hoje.getFullYear();
  const ultimo = new Date(a, m + 1, 0);
  const semanas: Array<{ numero: number; label: string; inicio: number; fim: number; dias: number }> = [];
  let cur = new Date(a, m, 1);
  let num = 1;
  while (cur <= ultimo) {
    const fim = new Date(cur);
    fim.setDate(cur.getDate() + (6 - cur.getDay()));
    if (fim > ultimo) fim.setTime(ultimo.getTime());
    const dias = fim.getDate() - cur.getDate() + 1;
    const ml = (m + 1).toString().padStart(2, '0');
    semanas.push({ numero: num, label: `${cur.getDate().toString().padStart(2,'0')}–${fim.getDate().toString().padStart(2,'0')}/${ml}`, inicio: cur.getDate(), fim: fim.getDate(), dias });
    cur = new Date(fim); cur.setDate(cur.getDate() + 1); num++;
  }
  return semanas;
}

export function PlanejamentoView() {
  const { usuariaAtiva } = useUsuarioContext();
  const isGeral = usuariaAtiva === 'casal';
  const [aba, setAba] = useState<Aba>('configurar');
  const [salLet, setSalLet]     = useState(0);
  const [salGio, setSalGio]     = useState(0);
  const [pctLet, setPctLet]     = useState(10); // investimento individual Letícia
  const [pctGio, setPctGio]     = useState(10); // investimento individual Giovanna
  const [contasFixas, setContasFixas] = useState<ContaFixa[]>([]);
  const [editandoId, setEditandoId]   = useState<string | null>(null);
  const [editValor, setEditValor]     = useState('');
  const [novaDesc, setNovaDesc]       = useState('');
  const [novoVal, setNovoVal]         = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [saveStatus, setSaveStatus]   = useState<SaveStatus>('idle');
  const [alterado, setAlterado]       = useState(false);
  const [carregando, setCarregando]   = useState(true);
  const [importando, setImportando]   = useState(false);
  const [importMsg, setImportMsg]     = useState('');
  const [transacoes, setTransacoes]   = useState<any[]>([]);

  const { mes: mesGlobal, ano: anoGlobal } = useMesContext();
  const semanas    = useMemo(() => getSemanasDoMes(mesGlobal, anoGlobal), [mesGlobal, anoGlobal]);
  const hoje       = new Date();
  const diaHoje    = mesGlobal === hoje.getMonth() && anoGlobal === hoje.getFullYear() ? hoje.getDate() : 32;
  const diasNoMes  = new Date(anoGlobal, mesGlobal + 1, 0).getDate();
  const semanaAtual = semanas.find(s => diaHoje >= s.inicio && diaHoje <= s.fim)?.numero ?? semanas.length;

  // Label do mês visualizado
  const MESES_NOMES_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const mesLabel = `${MESES_NOMES_PT[mesGlobal]} ${anoGlobal}`;


  useEffect(() => {
    if (aba === 'orcamento') {
      // Sempre rebusca quando muda o mês ou a aba
      fetch(`/api/transacoes?mes=${mesGlobal}&ano=${anoGlobal}`)
        .then(r => r.json())
        .then(res => { if (res.success) setTransacoes(res.data || []); });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba, mesGlobal, anoGlobal]);

  useEffect(() => {
    fetch('/api/planejamento').then(r => r.json()).then(res => {
      if (res.success && res.data) {
        setSalLet(res.data.salario_leticia || 0);
        setSalGio(res.data.salario_giovanna || 0);
        setPctLet(res.data.percentual_investimento || 10);
        setPctGio(res.data.percentual_investimento || 10);
        if (res.data.contas_fixas?.length > 0) setContasFixas(res.data.contas_fixas);
      }
    }).finally(() => setCarregando(false));
  }, []);

  const mark = () => setAlterado(true);

  // ── Cálculos casal ──
  const salTotal     = salLet + salGio;
  const totalFixas   = contasFixas.reduce((a, c) => a + c.valor, 0);
  const propLet      = salTotal > 0 ? (salLet > 0 ? salLet / salTotal : 0) : 0.5;
  const propGio      = 1 - propLet;

  // ── Cálculos individuais ──
  const indiv = [
    { perfil: 'leticia',  nome: 'Letícia',  cor: '#82a1fd', sal: salLet, pct: pctLet, setPct: setPctLet, prop: propLet },
    { perfil: 'giovanna', nome: 'Giovanna', cor: '#ff64ca', sal: salGio, pct: pctGio, setPct: setPctGio, prop: propGio },
  ].map(p => {
    const invest     = p.sal * (p.pct / 100);
    const fixas      = totalFixas * p.prop;
    const disponivel = Math.max(0, p.sal - invest - fixas);
    return {
      ...p, invest, fixas, disponivel,
      porSemana: disponivel / (semanas.length || 1),
      porDia:    disponivel / (diasNoMes || 30),
      pctFixas:  p.sal > 0 ? (fixas / p.sal) * 100 : 0,
      pctGastos: p.sal > 0 ? (disponivel / p.sal) * 100 : 0,
    };
  });

  const disponivelTotal = indiv.reduce((a, p) => a + p.disponivel, 0);
  const porSemanaTotal  = disponivelTotal / (semanas.length || 1);
  const porDiaTotal     = disponivelTotal / (diasNoMes || 30);

  async function salvar() {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/planejamento', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salario_leticia: salLet, salario_giovanna: salGio,
          percentual_investimento: Math.round((pctLet + pctGio) / 2),
          contas_fixas: contasFixas }),
      });
      const data = await res.json();
      setSaveStatus(data.success ? 'saved' : 'error');
      if (data.success) { setAlterado(false); window.dispatchEvent(new CustomEvent('planejamento-atualizado')); }
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch { setSaveStatus('error'); setTimeout(() => setSaveStatus('idle'), 3000); }
  }

  function salvarEdicao(id: string) {
    const v = parseFloat(editValor.replace(',', '.'));
    if (!isNaN(v) && v >= 0) { setContasFixas(prev => prev.map(c => c.id === id ? { ...c, valor: v } : c)); mark(); }
    setEditandoId(null);
  }

  function adicionarConta() {
    const v = parseFloat(novoVal.replace(',', '.'));
    if (!novaDesc || isNaN(v) || v <= 0) return;
    setContasFixas(prev => [...prev, { id: Date.now().toString(), descricao: novaDesc, valor: v, categoria: 'Outros' }]);
    setNovaDesc(''); setNovoVal(''); setAdicionando(false); mark();
  }

  async function importarFixas() {
    setImportando(true); setImportMsg('');
    try {
      const res  = await fetch('/api/fixas-mensais', { method: 'POST' });
      const data = await res.json();
      setImportMsg(data.success ? data.message : 'Erro ao importar');
      if (data.success) window.dispatchEvent(new CustomEvent('planejamento-atualizado'));
    } catch { setImportMsg('Erro'); }
    finally { setImportando(false); setTimeout(() => setImportMsg(''), 4000); }
  }

  if (carregando) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Planejamento</p>
          <h2 className="text-xl font-black text-foreground">Planejamento Financeiro</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure, entenda a metodologia e acompanhe seu saldo disponível semanal.</p>
        </div>
        {alterado && (
          <button onClick={salvar} disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white flex-shrink-0"
            style={{ background: saveStatus === 'saved' ? '#1D9E75' : saveStatus === 'error' ? '#E24B4A' : 'var(--primary)' }}>
            {saveStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : saveStatus === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? 'Salvo!' : 'Salvar'}
          </button>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {([
          { id: 'configurar',  label: 'Configurar',       icon: Wallet },
          { id: 'metodologia', label: 'Metodologia',      icon: PiggyBank },
          { id: 'orcamento',   label: 'Orçamento Semanal', icon: CalendarDays },
        ] as const).map(tab => {
          const Icon = tab.icon;
          const active = aba === tab.id;
          return (
            <button key={tab.id} onClick={() => setAba(tab.id)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
              style={active ? { background: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' } : { color: 'var(--muted-foreground)' }}>
              <Icon className="h-3.5 w-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══ CONFIGURAR ═══ */}
      {aba === 'configurar' && (
        <div className="space-y-4">

          {/* Salários */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white" style={{ background: 'var(--primary)' }}>1</span>
                Salários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Letícia',  cor: '#82a1fd', val: salLet, set: (v: number) => { setSalLet(v); mark(); } },
                  { label: 'Giovanna', cor: '#ff64ca', val: salGio, set: (v: number) => { setSalGio(v); mark(); } },
                ].map(s => (
                  <div key={s.label}>
                    <label className="text-[10px] uppercase tracking-widest block mb-2 font-bold" style={{ color: s.cor }}>{s.label}</label>
                    <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-3 py-2.5">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <input type="number" value={s.val || ''} onChange={e => s.set(parseFloat(e.target.value) || 0)} placeholder="0"
                        className="flex-1 bg-transparent text-sm text-foreground focus:outline-none" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-xs text-muted-foreground">Total combinado</span>
                <span className="text-xl font-black tabular-nums text-foreground">{fmt(salTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Investimento individual */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white bg-[#1D9E75]">2</span>
                Investimento — individual por perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {indiv.map(p => (
                <div key={p.perfil}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold" style={{ color: p.cor }}>{p.nome}</label>
                    <span className="text-xs text-muted-foreground">{fmt(p.invest)}/mês</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={30} step={1} value={p.pct}
                      onChange={e => { p.setPct(parseInt(e.target.value)); mark(); }}
                      className="flex-1" style={{ accentColor: p.cor }} />
                    <span className="text-lg font-black tabular-nums min-w-[44px]" style={{ color: p.cor }}>{p.pct}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Despesas Fixas */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white bg-[#E24B4A]">3</span>
                Despesas Fixas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contasFixas.map(conta => (
                <div key={conta.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 group border border-transparent hover:border-border transition-colors">
                  <span className="text-sm text-foreground flex-1">{conta.descricao}</span>
                  {editandoId === conta.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">R$</span>
                      <input type="number" value={editValor} autoFocus
                        onChange={e => setEditValor(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && salvarEdicao(conta.id)}
                        className="w-24 bg-secondary border border-primary rounded-lg px-2 py-1 text-sm focus:outline-none" />
                      <button onClick={() => salvarEdicao(conta.id)} className="text-[#1D9E75]"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditandoId(null)} className="text-muted-foreground"><XIcon className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold tabular-nums text-[#E24B4A]">{fmt(conta.valor)}</span>
                      <button onClick={() => { setEditandoId(conta.id); setEditValor(conta.valor.toString()); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => { setContasFixas(prev => prev.filter(c => c.id !== conta.id)); mark(); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-[#E24B4A]">
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {adicionando ? (
                <div className="flex gap-2 pt-1">
                  <input type="text" placeholder="Descrição" value={novaDesc} onChange={e => setNovaDesc(e.target.value)}
                    className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input type="number" placeholder="Valor" value={novoVal} onChange={e => setNovoVal(e.target.value)}
                    className="w-28 bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  <button onClick={adicionarConta} className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold">+</button>
                  <button onClick={() => setAdicionando(false)} className="px-3 py-2 rounded-xl border border-border text-muted-foreground"><XIcon className="h-4 w-4" /></button>
                </div>
              ) : (
                <button onClick={() => setAdicionando(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 pt-1">
                  + Adicionar despesa fixa
                </button>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button onClick={importarFixas} disabled={importando}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50">
                  {importando ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Lançar fixas deste mês no dashboard
                </button>
                {importMsg && <span className={`text-xs ${importMsg.includes('Erro') ? 'text-[#E24B4A]' : 'text-[#1D9E75]'}`}>{importMsg}</span>}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#E24B4A]/10 border border-[#E24B4A]/20 mt-1">
                <span className="text-xs text-muted-foreground">Total fixo mensal</span>
                <span className="text-xl font-black tabular-nums text-[#E24B4A]">{fmt(totalFixas)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ METODOLOGIA ═══ */}
      {aba === 'metodologia' && (
        <div className="space-y-5">

          {/* Conceito */}
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5">
            <p className="text-sm font-bold text-foreground mb-1">💡 A ideia central</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Antes de gastar qualquer coisa, o dinheiro passa por <strong className="text-foreground">3 filtros</strong> em sequência.
              O que sobrar é o seu <strong className="text-primary">saldo disponível</strong> — você pode gastar sem culpa.
            </p>
          </div>

          {/* Fluxo visual por perfil — lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {indiv.map(p => (
              <Card key={p.perfil} className="border-border bg-card overflow-hidden">
                <div className="h-1 w-full" style={{ background: p.cor }} />
                <CardHeader className="pb-1 pt-3 px-3">
                  <CardTitle className="text-xs font-bold" style={{ color: p.cor }}>
                    {p.nome} — {Math.round(p.prop * 100)}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 pb-3 px-3">
                  {[
                    { icon: Wallet,     label: 'Salário',                  val: p.sal,    cor: 'var(--foreground)' },
                    { icon: TrendingUp, label: `Invest. (${p.pct}%)`,      val: p.invest, cor: '#4ADE80' },
                    { icon: Receipt,    label: 'Fixas',                    val: p.fixas,  cor: '#E24B4A' },
                  ].map((etapa, i) => {
                    const Icon = etapa.icon;
                    return (
                      <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg border"
                        style={{ background: `${etapa.cor}10`, borderColor: `${etapa.cor}20` }}>
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3 w-3 flex-shrink-0" style={{ color: etapa.cor }} />
                          <span className="text-[10px] text-muted-foreground">{etapa.label}</span>
                        </div>
                        <span className="text-xs font-black tabular-nums" style={{ color: etapa.cor }}>{fmt(etapa.val)}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-lg border-2"
                    style={{ background: `${p.cor}12`, borderColor: `${p.cor}40` }}>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3 flex-shrink-0" style={{ color: p.cor }} />
                      <span className="text-[10px] font-bold text-foreground">Disponível</span>
                    </div>
                    <span className="text-sm font-black tabular-nums" style={{ color: p.cor }}>{fmt(p.disponivel)}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden flex gap-0.5 mt-1">
                    {[
                      { w: p.pct,       bg: '#1D9E75' },
                      { w: p.pctFixas,  bg: '#E24B4A' },
                      { w: p.pctGastos, bg: p.cor },
                    ].map((seg, i) => (
                      <div key={i} className="h-full rounded-sm"
                        style={{ width: `${seg.w}%`, background: seg.bg, minWidth: seg.w > 0 ? '3px' : '0' }} />
                    ))}
                  </div>
                  <p className="text-[9px] text-muted-foreground text-center">{fmt(p.porDia)}/dia · {fmt(p.porSemana)}/sem</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Níveis de saúde financeira */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">Saúde financeira do seu saldo disponível</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Shield, cor: '#E24B4A', nivel: 'Atenção',    cond: (p: typeof indiv[0]) => p.pctGastos < 20, msg: 'Fixas muito altas. Considere renegociar.' },
                { icon: Zap,    cor: '#EF9F27', nivel: 'Moderado',   cond: (p: typeof indiv[0]) => p.pctGastos >= 20 && p.pctGastos < 35, msg: 'Espaço razoável. Evite gastos supérfluos.' },
                { icon: TrendingUp, cor: '#1D9E75', nivel: 'Saudável', cond: (p: typeof indiv[0]) => p.pctGastos >= 35, msg: 'Ótimo equilíbrio. Continue assim!' },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <div key={i} className="space-y-1.5">
                    {indiv.filter(row.cond).map(p => (
                      <div key={p.perfil} className="flex items-center gap-3 p-3 rounded-xl border"
                        style={{ background: `${row.cor}10`, borderColor: `${row.cor}25` }}>
                        <Icon className="h-4 w-4 flex-shrink-0" style={{ color: row.cor }} />
                        <div className="flex-1">
                          <p className="text-xs font-bold" style={{ color: row.cor }}>{p.nome} — {row.nivel}</p>
                          <p className="text-[10px] text-muted-foreground">{row.msg}</p>
                        </div>
                        <span className="text-xs font-bold tabular-nums" style={{ color: row.cor }}>{Math.round(p.pctGastos)}% livre</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Metodologia inspirada no <strong className="text-foreground">Método dos Saldo Disponívels</strong>: separe o dinheiro por destino antes de gastar.
              O acompanhamento real dos gastos acontece na aba <strong className="text-foreground">Gastos</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ═══ ORÇAMENTO SEMANAL ═══ */}
      {aba === 'orcamento' && (
        <div className="space-y-5">

          {/* KPIs principais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border-2 border-primary/30 bg-primary/8 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Por semana</span>
              </div>
              <p className="text-3xl font-black tabular-nums text-primary">{fmt(porSemanaTotal)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{semanas.length} semanas · casal</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-[#ffa857]/30 bg-[#ffa857]/8 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Sun className="h-4 w-4 text-[#ffa857]" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Por dia</span>
              </div>
              <p className="text-3xl font-black tabular-nums text-[#ffa857]">{fmt(porDiaTotal)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{diasNoMes} dias · casal</p>
            </div>
          </div>

          {/* Saldo individual */}
          <div className="grid grid-cols-2 gap-3">
            {indiv.map(p => (
              <div key={p.perfil} className="p-3 rounded-xl border" style={{ borderColor: `${p.cor}30`, background: `${p.cor}08` }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: p.cor }}>{p.nome}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Semana</span>
                    <span className="font-black tabular-nums" style={{ color: p.cor }}>{fmt(p.porSemana)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Dia</span>
                    <span className="font-bold tabular-nums" style={{ color: p.cor }}>{fmt(p.porDia)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendário compacto estilo heatmap */}
          {(() => {
            const hoje2 = new Date();
            const primeiroDia = new Date(hoje2.getFullYear(), hoje2.getMonth(), 1).getDay();

            // Calcular gasto por dia por perfil usando regra de rateio
            const salarios = { leticia: salLet, giovanna: salGio };
            const gastoPorDia: Record<number, { leticia: number; giovanna: number; total: number }> = {};

            transacoes.forEach((t: any) => {
              if (t.recorrente) return; // fixas não contam no orçamento variável
              const d   = new Date(t.data + 'T12:00:00');
              const dia = d.getDate();
              if (!gastoPorDia[dia]) gastoPorDia[dia] = { leticia: 0, giovanna: 0, total: 0 };

              const val = Number(t.valor);
              const div = t.divisao || 'pessoal';
              const perf = t.perfil || 'casal';

              // Rateio por perfil
              let vLet = 0, vGio = 0;
              if (div === 'pessoal') {
                if (perf === 'leticia')  vLet = val;
                else if (perf === 'giovanna') vGio = val;
                else { vLet = val * propLet; vGio = val * propGio; }
              } else if (div === '50/50') {
                vLet = val / 2; vGio = val / 2;
              } else {
                // X/Y format
                const parts = div.split('/').map(Number);
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                  const tot = parts[0] + parts[1];
                  vLet = val * (parts[0] / tot);
                  vGio = val * (parts[1] / tot);
                } else {
                  vLet = val * propLet; vGio = val * propGio;
                }
              }
              gastoPorDia[dia].leticia  += vLet;
              gastoPorDia[dia].giovanna += vGio;
              gastoPorDia[dia].total    += val;
            });

            // Verificar se dia ultrapassou saldo diário
            const celulas = Array.from({ length: primeiroDia }, (_, i) => null as null)
              .concat(Array.from({ length: diasNoMes }, (_, i) => i + 1));

            return (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-foreground">
                    {mesLabel}
                  </p>
                  <span className="text-[10px] text-muted-foreground">{fmt(porDiaTotal)}/dia disponível</span>
                </div>

                {/* Header dias da semana */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {['D','S','T','Q','Q','S','S'].map((d, i) => (
                    <div key={i} className="text-center text-[9px] text-muted-foreground font-bold">{d}</div>
                  ))}
                </div>

                {/* Grid compacto */}
                <div className="grid grid-cols-7 gap-0.5">
                  {celulas.map((dia, idx) => {
                    if (!dia) return <div key={`e-${idx}`} className="w-7 h-7" />;
                    const isHoje2  = dia === diaHoje;
                    const isFuturo = dia > diaHoje;
                    const gastos   = gastoPorDia[dia];
                    const totalDia = gastos?.total ?? 0;
                    const overLet  = gastos ? gastos.leticia  > indiv[0].porDia : false;
                    const overGio  = gastos ? gastos.giovanna > indiv[1].porDia : false;
                    const overAny  = overLet || overGio;
                    const semana   = semanas.find(s => dia >= s.inicio && dia <= s.fim);
                    const semIdx   = semana ? semana.numero - 1 : 0;
                    const semCores = ['#5330ff','#82a1fd','#ff64ca','#ffa857','#01b695'];

                    // Cor do fundo do dia
                    let bg = `${semCores[semIdx % semCores.length]}22`;
                    if (isHoje2) bg = 'var(--primary)';
                    if (!isFuturo && totalDia > 0 && overAny) bg = '#E24B4A25';
                    if (!isFuturo && totalDia > 0 && !overAny) bg = '#1D9E7525';

                    return (
                      <div key={dia}
                        className="w-7 h-7 rounded-md flex flex-col items-center justify-center relative text-center"
                        style={{ background: bg, opacity: isFuturo ? 0.3 : 1 }}
                        title={gastos ? `Let: ${fmt(gastos.leticia)} | Gio: ${fmt(gastos.giovanna)}` : ''}>
                        <span className="text-[9px] font-bold leading-none"
                          style={{ color: isHoje2 ? '#fff' : 'var(--foreground)' }}>
                          {dia}
                        </span>
                        {/* Dots de perfil */}
                        {!isFuturo && gastos && (
                          <div className="flex gap-[2px] mt-[2px]">
                            <div className="w-[4px] h-[4px] rounded-full"
                              style={{ background: overLet ? '#E24B4A' : '#82a1fd', opacity: gastos.leticia > 0 ? 1 : 0.2 }} />
                            <div className="w-[4px] h-[4px] rounded-full"
                              style={{ background: overGio ? '#E24B4A' : '#ff64ca', opacity: gastos.giovanna > 0 ? 1 : 0.2 }} />
                          </div>
                        )}
                        {isHoje2 && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />}
                      </div>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border">
                  {[
                    { cor: '#1D9E7525', border: '#1D9E75', label: 'Dentro do orçamento' },
                    { cor: '#E24B4A25', border: '#E24B4A', label: 'Ultrapassou' },
                    { cor: 'transparent', border: 'var(--border)', label: 'Sem gastos' },
                  ].map(l => (
                    <span key={l.label} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                      <span className="w-3 h-3 rounded-sm border" style={{ background: l.cor, borderColor: l.border }} />
                      {l.label}
                    </span>
                  ))}
                  <span className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                    <span className="flex gap-[2px]">
                      <span className="w-[4px] h-[4px] rounded-full bg-[#82a1fd]" />
                      <span className="w-[4px] h-[4px] rounded-full bg-[#ff64ca]" />
                    </span>
                    Letícia · Giovanna
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Cards de semanas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {semanas.map((s, i) => {
              const isAtual = s.numero === semanaAtual;
              const isPast  = s.numero < semanaAtual;
              const cores   = ['#5330ff','#82a1fd','#ff64ca','#ffa857','#01b695'];
              const cor     = cores[i % cores.length];

              // Gasto acumulado da semana
              const gastoSemLet = transacoes
                .filter((t: any) => {
                  if (t.recorrente) return false;
                  const d = new Date(t.data + 'T12:00:00').getDate();
                  return d >= s.inicio && d <= s.fim;
                })
                .reduce((acc: number, t: any) => {
                  const val = Number(t.valor);
                  const div = t.divisao || 'pessoal';
                  const perf = t.perfil || 'casal';
                  if (div === 'pessoal') return acc + (perf === 'leticia' ? val : 0);
                  if (div === '50/50') return acc + val / 2;
                  return acc + val * propLet;
                }, 0);

              const gastoSemGio = transacoes
                .filter((t: any) => {
                  if (t.recorrente) return false;
                  const d = new Date(t.data + 'T12:00:00').getDate();
                  return d >= s.inicio && d <= s.fim;
                })
                .reduce((acc: number, t: any) => {
                  const val = Number(t.valor);
                  const div = t.divisao || 'pessoal';
                  const perf = t.perfil || 'casal';
                  if (div === 'pessoal') return acc + (perf === 'giovanna' ? val : 0);
                  if (div === '50/50') return acc + val / 2;
                  return acc + val * propGio;
                }, 0);

              const pctUsadoLet = indiv[0].porSemana > 0 ? Math.min((gastoSemLet / indiv[0].porSemana) * 100, 100) : 0;
              const pctUsadoGio = indiv[1].porSemana > 0 ? Math.min((gastoSemGio / indiv[1].porSemana) * 100, 100) : 0;

              return (
                <div key={s.numero} className="p-4 rounded-xl border transition-all"
                  style={{ borderColor: isAtual ? cor : 'var(--border)', background: isAtual ? `${cor}10` : 'var(--secondary)', opacity: isPast ? 0.7 : 1 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ background: cor }} />
                      <span className="text-sm font-black text-foreground">Semana {s.numero}</span>
                      {isAtual && <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-black text-white" style={{ background: cor }}>hoje</span>}
                      {isPast  && <span className="text-[9px] text-muted-foreground">encerrada</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{s.label} · {s.dias}d</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Saldo semanal</p>
                      <p className="text-xl font-black tabular-nums" style={{ color: cor }}>{fmt(porSemanaTotal)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Por dia</p>
                      <p className="text-xl font-black tabular-nums text-[#ffa857]">{fmt(porDiaTotal)}</p>
                    </div>
                  </div>

                  {/* Progresso semana atual */}
                  {isAtual && (
                    <div className="mb-3 p-2 rounded-lg bg-secondary/50">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Dia {diaHoje - s.inicio + 1} de {s.dias}</span>
                        <span>{Math.round(((diaHoje - s.inicio + 1) / s.dias) * 100)}% da semana</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${((diaHoje - s.inicio + 1) / s.dias) * 100}%`, background: cor }} />
                      </div>
                    </div>
                  )}

                  {/* Gasto por perfil com barra */}
                  {indiv.map((p, pi) => {
                    const gasto   = pi === 0 ? gastoSemLet : gastoSemGio;
                    const pctUsado = pi === 0 ? pctUsadoLet : pctUsadoGio;
                    const over    = gasto > p.porSemana;
                    const diasComprometidos = p.porDia > 0 ? Math.ceil(gasto / p.porDia) : 0;
                    return (
                      <div key={p.perfil} className="pt-2 border-t border-border/40">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold" style={{ color: p.cor }}>{p.nome}</span>
                          <div className="flex items-center gap-2">
                            {over && (
                              <span className="text-[9px] text-[#E24B4A] font-bold">
                                comprometeu {diasComprometidos}d
                              </span>
                            )}
                            <span className="text-[10px] font-bold tabular-nums" style={{ color: over ? '#E24B4A' : p.cor }}>
                              {fmt(gasto)}/{fmt(p.porSemana)}
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(pctUsado, 100)}%`, background: over ? '#E24B4A' : p.cor }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
            <Star className="h-4 w-4 text-[#ffa857] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              O que sobrar de uma semana pode ser usado na seguinte ou poupado.
              Gastos recorrentes (fixas) não entram no saldo disponível — já foram descontados no planejamento.
              O acompanhamento completo aparece na aba <strong className="text-foreground">Gastos</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
