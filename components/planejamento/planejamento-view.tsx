'use client';

import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Receipt, Wallet, PiggyBank, CalendarDays,
         Pencil, Check, X as XIcon, Info, Save, Loader2, RefreshCw,
         Sun, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsuarioContext } from '@/hooks/use-usuario-context';

interface ContaFixa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type Aba = 'configurar' | 'metodologia' | 'semanas';

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function getSemanasDoMes() {
  const hoje = new Date();
  const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDia   = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  const semanas: Array<{ numero: number; label: string; inicio: number; fim: number }> = [];
  let cur = new Date(primeiroDia);
  let num = 1;
  while (cur <= ultimoDia) {
    const fim = new Date(cur);
    fim.setDate(cur.getDate() + (6 - cur.getDay()));
    if (fim > ultimoDia) fim.setTime(ultimoDia.getTime());
    const m = (hoje.getMonth() + 1).toString().padStart(2, '0');
    semanas.push({ numero: num, label: `${cur.getDate().toString().padStart(2,'0')} a ${fim.getDate().toString().padStart(2,'0')}/${m}`, inicio: cur.getDate(), fim: fim.getDate() });
    cur = new Date(fim); cur.setDate(cur.getDate() + 1); num++;
  }
  return semanas;
}

export function PlanejamentoView() {
  const { usuariaAtiva } = useUsuarioContext();
  const isGeral = usuariaAtiva === 'casal';
  const [aba, setAba] = useState<Aba>('configurar');
  const [salLet, setSalLet]         = useState(0);
  const [salGio, setSalGio]         = useState(0);
  const [pctInvest, setPctInvest]   = useState(10);
  const [contasFixas, setContasFixas] = useState<ContaFixa[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editValor, setEditValor]   = useState('');
  const [novaDesc, setNovaDesc]     = useState('');
  const [novoVal, setNovoVal]       = useState('');
  const [adicionando, setAdicionando] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [alterado, setAlterado]     = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [importando, setImportando] = useState(false);
  const [importMsg, setImportMsg]   = useState('');

  const semanas  = useMemo(() => getSemanasDoMes(), []);
  const hoje     = new Date();
  const diaHoje  = hoje.getDate();
  const semanaAtual = semanas.find(s => diaHoje >= s.inicio && diaHoje <= s.fim)?.numero ?? 1;

  useEffect(() => {
    fetch('/api/planejamento').then(r => r.json()).then(res => {
      if (res.success && res.data) {
        setSalLet(res.data.salario_leticia || 0);
        setSalGio(res.data.salario_giovanna || 0);
        setPctInvest(res.data.percentual_investimento || 10);
        if (res.data.contas_fixas?.length > 0) setContasFixas(res.data.contas_fixas);
      }
    }).finally(() => setCarregando(false));
  }, []);

  const mark = () => setAlterado(true);

  const salTotal     = salLet + salGio;
  const investimento = salTotal * (pctInvest / 100);
  const totalFixas   = contasFixas.reduce((a, c) => a + c.valor, 0);
  const disponivel   = Math.max(0, salTotal - investimento - totalFixas);
  const porSemana    = semanas.length > 0 ? disponivel / semanas.length : 0;
  const diasNoMes    = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const porDia       = diasNoMes > 0 ? disponivel / diasNoMes : 0;
  const pctFixas     = salTotal > 0 ? (totalFixas / salTotal) * 100 : 0;
  const pctGastos    = salTotal > 0 ? (disponivel / salTotal) * 100 : 0;
  const propLet      = salTotal > 0 ? (salLet > 0 ? salLet / salTotal : 0) : 0.5;
  const propGio      = salTotal > 0 ? (salGio > 0 ? salGio / salTotal : 0) : 0.5;

  const indiv = [
    { perfil: 'leticia',  nome: 'Letícia',  cor: '#82a1fd', sal: salLet,  prop: propLet },
    { perfil: 'giovanna', nome: 'Giovanna', cor: '#ff64ca', sal: salGio,  prop: propGio },
  ].map(p => ({
    ...p,
    investimento: salTotal * (pctInvest / 100) * p.prop,
    fixas:        totalFixas * p.prop,
    disponivel:   disponivel * p.prop,
    porSemana:    (disponivel * p.prop) / (semanas.length || 1),
    porDia:       (disponivel * p.prop) / (diasNoMes || 30),
  }));

  async function salvar() {
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/planejamento', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salario_leticia: salLet, salario_giovanna: salGio,
          percentual_investimento: pctInvest, contas_fixas: contasFixas }),
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
          <h2 className="text-xl font-black text-foreground">Despesas Fixas</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure uma vez, acompanhe sempre.</p>
        </div>
        {isGeral && alterado && (
          <button onClick={salvar} disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white flex-shrink-0"
            style={{ background: saveStatus === 'saved' ? '#1D9E75' : saveStatus === 'error' ? '#E24B4A' : 'var(--primary)' }}>
            {saveStatus === 'saving' ? <Loader2 className="h-4 w-4 animate-spin" /> : saveStatus === 'saved' ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'saved' ? 'Salvo!' : 'Salvar'}
          </button>
        )}
      </div>

      {!isGeral && (
        <div className="p-3 rounded-xl bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">Visualização somente leitura. Edições disponíveis no perfil <strong className="text-foreground">Geral</strong>.</p>
        </div>
      )}

      {/* Abas */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {([
          { id: 'configurar',  label: 'Configurar',  icon: Wallet },
          { id: 'metodologia', label: 'Metodologia', icon: PiggyBank },
          { id: 'semanas',     label: 'Semanas',      icon: CalendarDays },
        ] as const).map(tab => {
          const Icon = tab.icon;
          const active = aba === tab.id;
          return (
            <button key={tab.id} onClick={() => setAba(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={active ? { background: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' } : { color: 'var(--muted-foreground)' }}>
              <Icon className="h-3.5 w-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── CONFIGURAR ─── */}
      {aba === 'configurar' && (
        <div className="space-y-4">

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
                    <div className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-3 py-2">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <input type="number" value={s.val || ''} disabled={!isGeral} onChange={e => s.set(parseFloat(e.target.value) || 0)} placeholder="0"
                        className="flex-1 bg-transparent text-sm text-foreground focus:outline-none disabled:opacity-60" />
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

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black text-white bg-[#1D9E75]">2</span>
                Investimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4">
                <input type="range" min={0} max={30} step={1} value={pctInvest} disabled={!isGeral}
                  onChange={e => { setPctInvest(parseInt(e.target.value)); mark(); }}
                  className="flex-1 accent-[#1D9E75] disabled:opacity-60" />
                <span className="text-2xl font-black tabular-nums text-[#4ADE80] min-w-[52px]">{pctInvest}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/20">
                <p className="text-xs text-muted-foreground">Guardar antes de qualquer gasto</p>
                <span className="text-xl font-black tabular-nums text-[#4ADE80]">{fmt(investimento)}</span>
              </div>
            </CardContent>
          </Card>

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
                      {isGeral && <>
                        <button onClick={() => { setEditandoId(conta.id); setEditValor(conta.valor.toString()); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { setContasFixas(prev => prev.filter(c => c.id !== conta.id)); mark(); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-[#E24B4A]">
                          <XIcon className="h-3.5 w-3.5" />
                        </button>
                      </>}
                    </div>
                  )}
                </div>
              ))}

              {isGeral && (
                <>
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
                </>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#E24B4A]/10 border border-[#E24B4A]/20 mt-2">
                <span className="text-xs text-muted-foreground">{Math.round(pctFixas)}% do salário</span>
                <span className="text-xl font-black tabular-nums text-[#E24B4A]">{fmt(totalFixas)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── METODOLOGIA ─── */}
      {aba === 'metodologia' && (
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Fluxo do dinheiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Salário total',                val: fmt(salTotal),     cor: 'var(--foreground)', bg: 'var(--secondary)', sinal: '' },
                { label: `Investimento (${pctInvest}%)`, val: fmt(investimento), cor: '#4ADE80',           bg: '#1D9E7515',        sinal: '−' },
                { label: 'Despesas fixas',               val: fmt(totalFixas),   cor: '#E24B4A',           bg: '#E24B4A15',        sinal: '−' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between p-3 rounded-xl border"
                    style={{ background: item.bg, borderColor: `${item.cor}30` }}>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-base font-black tabular-nums" style={{ color: item.cor }}>{item.sinal}{item.val}</span>
                  </div>
                  {i < 2 && <div className="flex justify-center my-0.5"><ArrowRight className="h-3.5 w-3.5 text-muted-foreground rotate-90" /></div>}
                </div>
              ))}
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-primary/40 bg-primary/10 mt-1">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Disponível para gastos</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{Math.round(pctGastos)}% do salário</p>
                </div>
                <span className="text-2xl font-black tabular-nums text-primary">{fmt(disponivel)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground">Distribuição do salário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-10 rounded-xl overflow-hidden flex">
                {[
                  { w: pctInvest, bg: '#1D9E75', label: `${pctInvest}% inv.` },
                  { w: pctFixas,  bg: '#E24B4A', label: `${Math.round(pctFixas)}% fixas` },
                  { w: pctGastos, bg: '#5330ff', label: `${Math.round(pctGastos)}% livre` },
                ].map((seg, i) => (
                  <div key={i} className="h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-700"
                    style={{ width: `${seg.w}%`, background: seg.bg }}>
                    {seg.w > 10 ? seg.label : ''}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 flex-wrap">
                {[{ cor: '#1D9E75', label: 'Investimento' }, { cor: '#E24B4A', label: 'Fixas' }, { cor: '#5330ff', label: 'Livre' }].map(item => (
                  <span key={item.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-3 h-3 rounded-sm" style={{ background: item.cor }} />{item.label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {indiv.map(p => (
              <Card key={p.perfil} className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold" style={{ color: p.cor }}>
                    {p.nome} — {Math.round(p.prop * 100)}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { label: 'Salário',              val: fmt(p.sal),          cor: 'var(--foreground)' },
                    { label: `Investimento (${pctInvest}%)`, val: `−${fmt(p.investimento)}`, cor: '#4ADE80' },
                    { label: 'Parte das fixas',      val: `−${fmt(p.fixas)}`,  cor: '#E24B4A' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-bold tabular-nums" style={{ color: item.cor }}>{item.val}</span>
                    </div>
                  ))}
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-foreground">Disponível</span>
                    <span className="text-lg font-black tabular-nums" style={{ color: p.cor }}>{fmt(p.disponivel)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Separe primeiro o <strong className="text-[#4ADE80]">investimento</strong>, depois pague as <strong className="text-[#E24B4A]">fixas</strong>, e o restante é o seu <strong className="text-primary">envelope livre</strong> para gastos variáveis.
            </p>
          </div>
        </div>
      )}

      {/* ─── SEMANAS ─── */}
      {aba === 'semanas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border-2 border-primary/30 bg-primary/10 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Sun className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Por dia</span>
              </div>
              <p className="text-3xl font-black tabular-nums text-primary">{fmt(porDia)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{diasNoMes} dias no mês</p>
            </div>
            <div className="p-4 rounded-xl border-2 border-[#ffa857]/30 bg-[#ffa857]/10 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <CalendarDays className="h-4 w-4 text-[#ffa857]" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Por semana</span>
              </div>
              <p className="text-3xl font-black tabular-nums text-[#ffa857]">{fmt(porSemana)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{semanas.length} semanas no mês</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-secondary/50 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Base do cálculo</p>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="font-black text-foreground">{fmt(salTotal)}</span>
              <span className="text-muted-foreground">−</span>
              <span className="font-black text-[#4ADE80]">{fmt(investimento)}</span>
              <span className="text-muted-foreground">inv.</span>
              <span className="text-muted-foreground">−</span>
              <span className="font-black text-[#E24B4A]">{fmt(totalFixas)}</span>
              <span className="text-muted-foreground">fixas</span>
              <span className="text-muted-foreground">=</span>
              <span className="font-black text-primary">{fmt(disponivel)}</span>
              <span className="text-muted-foreground">÷ {semanas.length} sem.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {semanas.map(s => {
              const isAtual = s.numero === semanaAtual;
              const isPast  = s.numero < semanaAtual;
              return (
                <div key={s.numero} className="p-4 rounded-xl border transition-all"
                  style={{ borderColor: isAtual ? 'var(--primary)' : 'var(--border)', background: isAtual ? 'rgb(from var(--primary) r g b / 0.08)' : 'var(--secondary)', opacity: isPast ? 0.55 : 1 }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-foreground">Semana {s.numero}</span>
                      {isAtual && <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black text-white" style={{ background: 'var(--primary)' }}>atual</span>}
                      {isPast  && <span className="text-[9px] uppercase tracking-wider text-muted-foreground">encerrada</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{s.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Semana</p>
                      <p className="text-xl font-black tabular-nums" style={{ color: 'var(--primary)' }}>{fmt(porSemana)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Por dia</p>
                      <p className="text-xl font-black tabular-nums text-[#ffa857]">{fmt(porDia)}</p>
                    </div>
                  </div>
                  {indiv.map(p => (
                    <div key={p.perfil} className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                      <span className="text-[10px] font-bold" style={{ color: p.cor }}>{p.nome}</span>
                      <div className="flex items-center gap-3 text-[10px]">
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
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              O que sobrar de uma semana pode ser usado na seguinte ou poupado. O acompanhamento real aparece na aba <strong className="text-foreground">Gastos</strong>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
