'use client';

import { useState, useMemo, useEffect } from 'react';
import { Receipt, Wallet, PiggyBank, CalendarDays, Pencil, Check,
         X as XIcon, Info, Save, Loader2, RefreshCw, Sun, ArrowRight,
         TrendingUp, Zap, Shield, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsuarioContext } from '@/hooks/use-usuario-context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ContaFixa { id: string; descricao: string; valor: number; categoria: string; }
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type Aba = 'configurar' | 'metodologia' | 'orcamento';

const fmt  = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const fmtD = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function getSemanasDoMes() {
  const hoje = new Date();
  const ultimo = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const semanas: Array<{ numero: number; label: string; inicio: number; fim: number; dias: number }> = [];
  let cur = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  let num = 1;
  while (cur <= ultimo) {
    const fim = new Date(cur);
    fim.setDate(cur.getDate() + (6 - cur.getDay()));
    if (fim > ultimo) fim.setTime(ultimo.getTime());
    const dias = fim.getDate() - cur.getDate() + 1;
    const m = (hoje.getMonth() + 1).toString().padStart(2, '0');
    semanas.push({ numero: num, label: `${cur.getDate().toString().padStart(2,'0')}–${fim.getDate().toString().padStart(2,'0')}/${m}`, inicio: cur.getDate(), fim: fim.getDate(), dias });
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

  const semanas    = useMemo(() => getSemanasDoMes(), []);
  const hoje       = new Date();
  const diaHoje    = hoje.getDate();
  const diasNoMes  = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const semanaAtual = semanas.find(s => diaHoje >= s.inicio && diaHoje <= s.fim)?.numero ?? 1;

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
          <p className="text-sm text-muted-foreground mt-1">Configure, entenda a metodologia e acompanhe seu envelope semanal.</p>
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
              O que sobrar é o seu <strong className="text-primary">envelope livre</strong> — você pode gastar sem culpa.
            </p>
          </div>

          {/* Fluxo visual por perfil */}
          {indiv.map(p => (
            <Card key={p.perfil} className="border-border bg-card overflow-hidden">
              <div className="h-1 w-full" style={{ background: p.cor }} />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold" style={{ color: p.cor }}>
                  {p.nome} — {Math.round(p.prop * 100)}% do salário combinado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4">

                {/* Etapas com setas */}
                {[
                  { icon: Wallet,     label: '① Salário',                          val: p.sal,    cor: 'var(--foreground)', bg: 'var(--secondary)',       detalhe: '100% do que entra' },
                  { icon: TrendingUp, label: `② Guardar primeiro (${p.pct}%)`,       val: p.invest, cor: '#4ADE80',           bg: '#1D9E7518',              detalhe: `R$ ${fmtD(p.invest / diasNoMes)}/dia` },
                  { icon: Receipt,    label: '③ Pagar as fixas',                    val: p.fixas,  cor: '#E24B4A',           bg: '#E24B4A18',              detalhe: `${Math.round(p.pctFixas)}% do salário` },
                ].map((etapa, i) => {
                  const Icon = etapa.icon;
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-3 p-3 rounded-xl border"
                        style={{ background: etapa.bg, borderColor: `${etapa.cor}25` }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${etapa.cor}25` }}>
                          <Icon className="h-4 w-4" style={{ color: etapa.cor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground">{etapa.label}</p>
                          <p className="text-[10px] text-muted-foreground">{etapa.detalhe}</p>
                        </div>
                        <span className="text-base font-black tabular-nums" style={{ color: etapa.cor }}>{fmt(etapa.val)}</span>
                      </div>
                      <div className="flex justify-center my-0.5">
                        <ArrowRight className="h-3 w-3 text-muted-foreground/40 rotate-90" />
                      </div>
                    </div>
                  );
                })}

                {/* Resultado */}
                <div className="flex items-center gap-3 p-3 rounded-xl border-2"
                  style={{ background: `${p.cor}12`, borderColor: `${p.cor}40` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${p.cor}25` }}>
                    <Zap className="h-4 w-4" style={{ color: p.cor }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">④ Envelope livre</p>
                    <p className="text-[10px] text-muted-foreground">{Math.round(p.pctGastos)}% do salário · {fmt(p.porDia)}/dia · {fmt(p.porSemana)}/sem</p>
                  </div>
                  <span className="text-xl font-black tabular-nums" style={{ color: p.cor }}>{fmt(p.disponivel)}</span>
                </div>

                {/* Mini barra de distribuição */}
                <div className="mt-1">
                  <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
                    {[
                      { w: p.pct,             bg: '#1D9E75' },
                      { w: p.pctFixas,        bg: '#E24B4A' },
                      { w: p.pctGastos,       bg: p.cor },
                    ].map((seg, i) => (
                      <div key={i} className="h-full rounded-sm transition-all duration-700 flex items-center justify-center"
                        style={{ width: `${seg.w}%`, background: seg.bg, minWidth: seg.w > 0 ? '4px' : '0' }} />
                    ))}
                  </div>
                  <div className="flex gap-3 mt-1.5 flex-wrap">
                    {[
                      { cor: '#1D9E75', label: `Investimento ${p.pct}%` },
                      { cor: '#E24B4A', label: `Fixas ${Math.round(p.pctFixas)}%` },
                      { cor: p.cor,     label: `Livre ${Math.round(p.pctGastos)}%` },
                    ].map(item => (
                      <span key={item.label} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: item.cor }} />{item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Gráfico comparativo */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">Comparativo — envelope disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={indiv.map(p => ({
                  nome: p.nome,
                  invest: Math.round(p.invest),
                  fixas:  Math.round(p.fixas),
                  livre:  Math.round(p.disponivel),
                  cor:    p.cor,
                }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="nome" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888' }} width={55}
                    tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v, name) => [fmt(v as number), name === 'invest' ? 'Investimento' : name === 'fixas' ? 'Fixas' : 'Livre']}
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="invest" stackId="a" fill="#1D9E75" radius={[0,0,0,0]} name="invest" />
                  <Bar dataKey="fixas"  stackId="a" fill="#E24B4A" radius={[0,0,0,0]} name="fixas" />
                  <Bar dataKey="livre"  stackId="a" radius={[6,6,0,0]} name="livre">
                    {indiv.map((p, i) => <Cell key={i} fill={p.cor} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-2 flex-wrap">
                {[{ cor: '#1D9E75', l: 'Investimento' }, { cor: '#E24B4A', l: 'Fixas' }, { cor: 'var(--primary)', l: 'Livre' }].map(i => (
                  <span key={i.l} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-3 h-3 rounded-sm" style={{ background: i.cor }} />{i.l}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Níveis de saúde financeira */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">Saúde financeira do seu envelope</CardTitle>
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
              Metodologia inspirada no <strong className="text-foreground">Método dos Envelopes</strong>: separe o dinheiro por destino antes de gastar.
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

          {/* Individuais */}
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

          {/* Gráfico de barras — envelope por semana */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-foreground">Envelope por semana do mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart
                  data={semanas.map(s => ({
                    label: `Sem ${s.numero}`,
                    casal: Math.round(porSemanaTotal),
                    leticia: Math.round(indiv[0].porSemana),
                    giovanna: Math.round(indiv[1].porSemana),
                    atual: s.numero === semanaAtual,
                  }))}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                  <YAxis hide />
                  <Tooltip formatter={(v, name) => [fmt(v as number), name === 'leticia' ? 'Letícia' : name === 'giovanna' ? 'Giovanna' : 'Casal']}
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="leticia"  fill="#82a1fd" radius={[0,0,0,0]} />
                  <Bar dataKey="giovanna" fill="#ff64ca" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Calendário visual do mês */}
          <Card className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground">
                  {hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                </CardTitle>
                <span className="text-[10px] text-muted-foreground">{fmt(porDiaTotal)}/dia</span>
              </div>
            </CardHeader>
            <CardContent>
              {/* Header dias da semana */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['D','S','T','Q','Q','S','S'].map((d, i) => (
                  <div key={i} className="text-center text-[9px] text-muted-foreground font-bold py-1">{d}</div>
                ))}
              </div>
              {/* Grid dias */}
              {(() => {
                const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1).getDay();
                const cells = Array.from({ length: primeiroDia }, (_, i) => ({ dia: 0, i }));
                for (let d = 1; d <= diasNoMes; d++) cells.push({ dia: d, i: primeiroDia + d - 1 });

                // Agrupar em semanas para colorir
                const semanaDodia = (d: number) => semanas.find(s => d >= s.inicio && d <= s.fim);
                const semanasCores = ['#5330ff22', '#82a1fd22', '#ff64ca22', '#ffa85722', '#01b69522'];

                return (
                  <div className="grid grid-cols-7 gap-1">
                    {cells.map(({ dia, i }) => {
                      if (dia === 0) return <div key={`empty-${i}`} />;
                      const sem = semanaDodia(dia);
                      const isHoje = dia === diaHoje;
                      const isFuturo = dia > diaHoje;
                      const semIdx = sem ? sem.numero - 1 : 0;
                      return (
                        <div key={dia}
                          className="aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all relative"
                          style={{
                            background: isHoje ? 'var(--primary)' : semanasCores[semIdx % semanasCores.length],
                            color: isHoje ? '#fff' : isFuturo ? 'var(--muted-foreground)' : 'var(--foreground)',
                            opacity: isFuturo ? 0.4 : 1,
                          }}>
                          {dia}
                          {isHoje && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Legenda semanas */}
              <div className="flex flex-wrap gap-2 mt-3">
                {semanas.map((s, i) => {
                  const isAtual = s.numero === semanaAtual;
                  const cores = ['#5330ff', '#82a1fd', '#ff64ca', '#ffa857', '#01b695'];
                  return (
                    <div key={s.numero} className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: cores[i % cores.length] }} />
                      <span className={isAtual ? 'font-bold text-foreground' : 'text-muted-foreground'}>
                        Sem {s.numero} {isAtual ? '← atual' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Cards de semanas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {semanas.map((s, i) => {
              const isAtual = s.numero === semanaAtual;
              const isPast  = s.numero < semanaAtual;
              const cores   = ['#5330ff', '#82a1fd', '#ff64ca', '#ffa857', '#01b695'];
              const cor     = cores[i % cores.length];
              return (
                <div key={s.numero} className="p-4 rounded-xl border transition-all"
                  style={{ borderColor: isAtual ? cor : 'var(--border)', background: isAtual ? `${cor}10` : 'var(--secondary)', opacity: isPast ? 0.6 : 1 }}>
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
                      <p className="text-[10px] text-muted-foreground mb-0.5">Casal / semana</p>
                      <p className="text-xl font-black tabular-nums" style={{ color: cor }}>{fmt(porSemanaTotal)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">Por dia</p>
                      <p className="text-xl font-black tabular-nums text-[#ffa857]">{fmt(porDiaTotal)}</p>
                    </div>
                  </div>

                  {/* Barra de progresso da semana */}
                  {isAtual && (
                    <div className="mb-3">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Dia {diaHoje - s.inicio + 1} de {s.dias}</span>
                        <span>{fmt(porDiaTotal * (diaHoje - s.inicio + 1))} gastos esperados</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${((diaHoje - s.inicio + 1) / s.dias) * 100}%`, background: cor }} />
                      </div>
                    </div>
                  )}

                  {indiv.map(p => (
                    <div key={p.perfil} className="flex justify-between items-center pt-2 border-t border-border/40">
                      <span className="text-[10px] font-bold" style={{ color: p.cor }}>{p.nome}</span>
                      <div className="flex gap-3 text-[10px]">
                        <span className="text-muted-foreground">{fmt(p.porSemana)}/sem</span>
                        <span className="font-bold" style={{ color: p.cor }}>{fmt(p.porDia)}/dia</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
            <Star className="h-4 w-4 text-[#ffa857] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              O que sobrar de uma semana pode ser usado na seguinte ou poupado.
              O acompanhamento real dos gastos aparece na aba <strong className="text-foreground">Gastos</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
