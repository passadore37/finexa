'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Check, X as XIcon, Loader2, Target, PiggyBank,
         TrendingUp, ChevronDown, ChevronUp, AlertTriangle, Sparkles,
         CalendarDays, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { PERFIL_CONFIG } from '@/lib/perfil-config';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Meta {
  id: string;
  titulo: string;
  valor_alvo: number;
  valor_atual: number;
  cor: string;
  emoji: string;
  data_alvo?: string;
  concluida: boolean;
  visibilidade: 'privada' | 'compartilhada';
  criada_por: string;
  modo_plano: 'data' | 'mensal';
  aporte_mensal: number;
  family_id: string;
}

interface Aporte {
  id: string;
  meta_id: string;
  perfil: string;
  valor: number;
  mes: number;
  ano: number;
  observacao?: string;
}

interface Reserva {
  id: string;
  perfil: string;
  saldo: number;
  mes: number;
  ano: number;
}

interface Planejamento {
  salario_leticia: number;
  salario_giovanna: number;
  contas_fixas: Array<{ descricao: string; valor: number; categoria: string }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const MESES_NOMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const EMOJIS = ['🎯','✈️','🏠','🚗','💍','🎓','🏖️','💻','🐾','🎸','📱','🏋️','🌍','🛸','🏄'];
const CORES  = ['#D4537E','#7B5EA7','#1D9E75','#378ADD','#EF9F27','#E24B4A','#5330ff','#ff64ca','#01b695'];

function niveisReserva(meses: number) {
  if (meses >= 12) return { label: '⭐ Blindado', cor: '#5330ff', bg: 'rgba(83,48,255,0.1)', border: 'rgba(83,48,255,0.3)' };
  if (meses >= 6)  return { label: '🟢 Ideal',   cor: '#1D9E75', bg: 'rgba(29,158,117,0.1)', border: 'rgba(29,158,117,0.3)' };
  if (meses >= 3)  return { label: '🟡 Seguro',  cor: '#EF9F27', bg: 'rgba(239,159,39,0.1)',  border: 'rgba(239,159,39,0.3)' };
  return { label: '🔴 Crítico', cor: '#E24B4A', bg: 'rgba(226,75,74,0.1)', border: 'rgba(226,75,74,0.3)' };
}

function calcularProjecao(meta: Meta, aportes: Aporte[]): { mesesRestantes: number; dataPrevista: string; porMes: number; status: 'adiantada' | 'no_prazo' | 'atrasada' | 'sem_data' } {
  const falta = Math.max(0, meta.valor_alvo - meta.valor_atual);
  if (falta === 0) return { mesesRestantes: 0, dataPrevista: 'Concluída!', porMes: 0, status: 'adiantada' };

  const hoje = new Date();

  if (meta.modo_plano === 'data' && meta.data_alvo) {
    const alvo = new Date(meta.data_alvo);
    const mesesRestantes = Math.max(1, Math.ceil((alvo.getTime() - hoje.getTime()) / (30 * 24 * 3600 * 1000)));
    const porMes = falta / mesesRestantes;

    // Ritmo atual (média dos últimos 3 aportes)
    const ultimos = [...aportes].sort((a, b) => b.ano !== a.ano ? b.ano - a.ano : b.mes - a.mes).slice(0, 3);
    const ritmoAtual = ultimos.length > 0 ? ultimos.reduce((s, a) => s + a.valor, 0) / ultimos.length : 0;

    const status = ritmoAtual === 0 ? 'sem_data'
      : ritmoAtual >= porMes * 1.1 ? 'adiantada'
      : ritmoAtual >= porMes * 0.9 ? 'no_prazo'
      : 'atrasada';

    return { mesesRestantes, dataPrevista: alvo.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }), porMes, status };
  }

  if (meta.modo_plano === 'mensal' && meta.aporte_mensal > 0) {
    const mesesRestantes = Math.ceil(falta / meta.aporte_mensal);
    const dataPrevista = new Date(hoje.getFullYear(), hoje.getMonth() + mesesRestantes, 1)
      .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const ultimos = [...aportes].sort((a, b) => b.ano !== a.ano ? b.ano - a.ano : b.mes - a.mes).slice(0, 3);
    const ritmoAtual = ultimos.length > 0 ? ultimos.reduce((s, a) => s + a.valor, 0) / ultimos.length : 0;
    const status = ritmoAtual === 0 ? 'sem_data'
      : ritmoAtual >= meta.aporte_mensal * 1.1 ? 'adiantada'
      : ritmoAtual >= meta.aporte_mensal * 0.9 ? 'no_prazo'
      : 'atrasada';
    return { mesesRestantes, dataPrevista, porMes: meta.aporte_mensal, status };
  }

  return { mesesRestantes: 0, dataPrevista: '—', porMes: 0, status: 'sem_data' };
}

// ─── Componente de Reserva por Perfil ────────────────────────────────────────

function CardReserva({ perfil, nome, cor, totalFixas, historico, onSalvar }: {
  perfil: string; nome: string; cor: string;
  totalFixas: number; historico: Reserva[];
  onSalvar: (perfil: string, saldo: number) => void;
}) {
  const hoje = new Date();
  const saldoAtual = historico.filter(r => r.mes === hoje.getMonth() && r.ano === hoje.getFullYear())[0]?.saldo
    ?? historico[historico.length - 1]?.saldo ?? 0;

  const [editando, setEditando] = useState(false);
  const [inputSaldo, setInputSaldo] = useState(String(saldoAtual));

  const mesesCobertos = totalFixas > 0 ? saldoAtual / totalFixas : 0;
  const nivel = niveisReserva(mesesCobertos);
  const pct3  = Math.min((mesesCobertos / 3)  * 100, 100);
  const pct6  = Math.min((mesesCobertos / 6)  * 100, 100);
  const pct12 = Math.min((mesesCobertos / 12) * 100, 100);

  // Últimos 6 meses de histórico
  const hist6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const reg = historico.find(r => r.mes === d.getMonth() && r.ano === d.getFullYear());
    return { label: MESES_NOMES[d.getMonth()], saldo: reg?.saldo ?? 0 };
  });
  const maxHist = Math.max(...hist6.map(h => h.saldo), totalFixas * 12, 1);

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold" style={{ color: cor }}>{nome}</CardTitle>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: nivel.cor, background: nivel.bg, borderColor: nivel.border }}>
            {nivel.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saldo atual */}
        <div className="flex items-end justify-between">
          {editando ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-muted-foreground">R$</span>
              <input type="number" value={inputSaldo} onChange={e => setInputSaldo(e.target.value)} autoFocus
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              <button onClick={() => { onSalvar(perfil, parseFloat(inputSaldo) || 0); setEditando(false); }}
                className="p-1.5 rounded-lg bg-primary text-white"><Check className="h-3.5 w-3.5" /></button>
              <button onClick={() => setEditando(false)} className="p-1.5 rounded-lg border border-border text-muted-foreground">
                <XIcon className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <button onClick={() => { setInputSaldo(String(saldoAtual)); setEditando(true); }}
              className="text-2xl font-black tabular-nums hover:opacity-80 transition-opacity" style={{ color: cor }}>
              {fmt(saldoAtual)}
            </button>
          )}
          <span className="text-xs text-muted-foreground">Clique para atualizar</span>
        </div>

        {/* Barras de nível */}
        <div className="space-y-2">
          {[
            { label: '3 meses', meta: totalFixas * 3, pct: pct3, cor: '#EF9F27' },
            { label: '6 meses', meta: totalFixas * 6, pct: pct6, cor: '#1D9E75' },
            { label: '12 meses', meta: totalFixas * 12, pct: pct12, cor: '#5330ff' },
          ].map(b => (
            <div key={b.label}>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>{b.label}</span>
                <span>{Math.round(b.pct)}% — meta: {fmt(b.meta)}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${b.pct}%`, background: b.cor }} />
              </div>
            </div>
          ))}
        </div>

        {/* Mini histograma */}
        {hist6.some(h => h.saldo > 0) && (
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Evolução</p>
            <div className="flex items-end gap-1 h-14">
              {hist6.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full rounded-sm transition-all duration-500"
                    style={{ height: `${Math.max((h.saldo / maxHist) * 48, h.saldo > 0 ? 4 : 0)}px`, background: h.saldo > 0 ? cor : 'var(--secondary)' }} />
                  <span className="text-[8px] text-muted-foreground">{h.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="text-[10px] text-muted-foreground">
          Fixas mensais: <span className="font-bold text-foreground">{fmt(totalFixas)}</span>
          {' · '}{mesesCobertos.toFixed(1)} meses cobertos
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Componente de Meta Individual ───────────────────────────────────────────

function CardMeta({ meta, aportes, perfilAtivo, onAporte, onConcluir, onDeletar }: {
  meta: Meta; aportes: Aporte[]; perfilAtivo: string;
  onAporte: (metaId: string, valor: number, obs: string) => void;
  onConcluir: (id: string) => void;
  onDeletar: (id: string) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const [registrandoAporte, setRegistrandoAporte] = useState(false);
  const [valorAporte, setValorAporte] = useState('');
  const [obs, setObs] = useState('');

  const pct = meta.valor_alvo > 0 ? Math.min((meta.valor_atual / meta.valor_alvo) * 100, 100) : 0;
  const falta = Math.max(0, meta.valor_alvo - meta.valor_atual);
  const projecao = calcularProjecao(meta, aportes);

  const statusCor = projecao.status === 'adiantada' ? '#1D9E75'
    : projecao.status === 'no_prazo' ? '#EF9F27'
    : projecao.status === 'atrasada' ? '#E24B4A'
    : 'var(--muted-foreground)';

  const statusLabel = projecao.status === 'adiantada' ? '✅ Adiantada'
    : projecao.status === 'no_prazo' ? '⏱️ No prazo'
    : projecao.status === 'atrasada' ? '⚠️ Atrasada'
    : '📌 Sem histórico';

  // Últimos 6 meses de aportes
  const hoje = new Date();
  const hist6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const valor = aportes.filter(a => a.mes === d.getMonth() && a.ano === d.getFullYear())
      .reduce((s, a) => s + a.valor, 0);
    return { label: MESES_NOMES[d.getMonth()], valor };
  });
  const maxHist = Math.max(...hist6.map(h => h.valor), 1);

  return (
    <Card className="border border-border bg-card">
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.emoji}</span>
            <div>
              <p className="text-sm font-bold text-foreground">{meta.titulo}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold" style={{ color: statusCor }}>{statusLabel}</span>
                {meta.visibilidade === 'privada' && (
                  <span className="text-[10px] text-muted-foreground border border-border rounded px-1">privada</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setExpandido(!expandido)}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
              {expandido ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            <button onClick={() => onConcluir(meta.id)}
              className="p-1.5 rounded-lg hover:bg-[#1D9E75]/20 text-muted-foreground hover:text-[#1D9E75] transition-colors">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onDeletar(meta.id)}
              className="p-1.5 rounded-lg hover:bg-[#A32D2D]/20 text-muted-foreground hover:text-[#E24B4A] transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-bold tabular-nums">{fmt(meta.valor_atual)}</span>
            <span className="text-muted-foreground tabular-nums">{fmt(meta.valor_alvo)}</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: meta.cor }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{Math.round(pct)}% concluído</span>
            <span>Falta {fmt(falta)}</span>
          </div>
        </div>

        {/* Projeção resumida */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-secondary/50 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Previsão</p>
            <p className="text-xs font-bold text-foreground">{projecao.dataPrevista}</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50 border border-border">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Por mês</p>
            <p className="text-xs font-bold text-foreground">{projecao.porMes > 0 ? fmt(projecao.porMes) : '—'}</p>
          </div>
        </div>

        {/* Expandido: histograma + aporte */}
        {expandido && (
          <div className="space-y-3 pt-2 border-t border-border">
            {/* Mini histograma de aportes */}
            {hist6.some(h => h.valor > 0) && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Aportes mensais</p>
                <div className="flex items-end gap-1 h-16">
                  {hist6.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full rounded-sm transition-all"
                        style={{ height: `${Math.max((h.valor / maxHist) * 48, h.valor > 0 ? 4 : 0)}px`, background: h.valor > 0 ? meta.cor : 'var(--secondary)' }} />
                      <span className="text-[8px] text-muted-foreground">{h.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registrar aporte */}
            {registrandoAporte ? (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Aporte de {MESES_NOMES[hoje.getMonth()]}/{hoje.getFullYear()}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <input type="number" placeholder="0" value={valorAporte} onChange={e => setValorAporte(e.target.value)}
                    autoFocus className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <input type="text" placeholder="Observação (opcional)" value={obs} onChange={e => setObs(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                <div className="flex gap-2">
                  <button onClick={() => { onAporte(meta.id, parseFloat(valorAporte) || 0, obs); setRegistrandoAporte(false); setValorAporte(''); setObs(''); }}
                    className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center gap-1">
                    <Check className="h-3.5 w-3.5" /> Registrar
                  </button>
                  <button onClick={() => setRegistrandoAporte(false)}
                    className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setRegistrandoAporte(true)}
                className="w-full py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary transition-all flex items-center justify-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Registrar aporte de {MESES_NOMES[hoje.getMonth()]}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── View Principal ───────────────────────────────────────────────────────────

export function MetasView() {
  const { perfil: perfilAuth } = useAuth();
  const plano = perfilAuth?.plano ?? 'casal';
  const perfilAtivo = perfilAuth?.role ?? 'leticia';

  const [metas, setMetas] = useState<Meta[]>([]);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [planejamento, setPlanejamento] = useState<Planejamento | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [aba, setAba] = useState<'reserva' | 'metas'>('reserva');

  // Form nova meta
  const [titulo, setTitulo] = useState('');
  const [valorAlvo, setValorAlvo] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [cor, setCor] = useState('#D4537E');
  const [dataAlvo, setDataAlvo] = useState('');
  const [aporteMensal, setAporteMensal] = useState('');
  const [modoPlan, setModoPlan] = useState<'data' | 'mensal'>('data');
  const [visibilidade, setVisibilidade] = useState<'privada' | 'compartilhada'>('compartilhada');
  const [salvando, setSalvando] = useState(false);

  const [totalFixasRecorrentes, setTotalFixasRecorrentes] = useState(0);

  useEffect(() => {
    const hoje = new Date();
    Promise.all([
      fetch('/api/metas?aportes=true').then(r => r.json()),
      fetch('/api/reserva').then(r => r.json()),
      fetch('/api/planejamento').then(r => r.json()),
      // Buscar transações recorrentes do mês como fallback para contas fixas
      fetch(`/api/transacoes?mes=${hoje.getMonth()}&ano=${hoje.getFullYear()}`).then(r => r.json()),
    ]).then(([metasRes, reservaRes, planoRes, transacoesRes]) => {
      if (metasRes.success) { setMetas(metasRes.data || []); setAportes(metasRes.aportes || []); }
      if (reservaRes.success) setReservas(reservaRes.data || []);
      if (planoRes.success && planoRes.data) setPlanejamento(planoRes.data);

      // Calcular total de fixas recorrentes das transações reais
      if (transacoesRes.success) {
        const recorrentes = (transacoesRes.data || []).filter((t: any) => t.recorrente);
        const total = recorrentes.reduce((acc: number, t: any) => acc + Number(t.valor), 0);
        setTotalFixasRecorrentes(total);
      }
    }).finally(() => setCarregando(false));
  }, []);

  // Contas fixas: usa planejamento.contas_fixas se disponível,
  // senão usa a soma das transações recorrentes do mês atual como fallback
  const totalFixasConjunto = useMemo(() => {
    const doPlano = (planejamento?.contas_fixas || []).reduce((acc, c) => acc + Number(c.valor), 0);
    return doPlano > 0 ? doPlano : totalFixasRecorrentes;
  }, [planejamento, totalFixasRecorrentes]);

  const salLeticia  = planejamento?.salario_leticia  || 0;
  const salGiovanna = planejamento?.salario_giovanna || 0;
  const salTotal = salLeticia + salGiovanna;

  // Proporção real por salário — salário 0 = não participa
  // Fallback 50/50 apenas se AMBOS forem zero
  const propLet = salTotal > 0 ? (salLeticia > 0 ? salLeticia / salTotal : 0) : 0.5;
  const propGio = salTotal > 0 ? (salGiovanna > 0 ? salGiovanna / salTotal : 0) : 0.5;

  const fixasLeticia  = totalFixasConjunto * propLet;
  const fixasGiovanna = totalFixasConjunto * propGio;

  // Perfis a mostrar na reserva
  const perfisReserva = plano === 'individual'
    ? [{ perfil: perfilAtivo, nome: PERFIL_CONFIG[perfilAtivo as keyof typeof PERFIL_CONFIG]?.nome ?? perfilAtivo, cor: PERFIL_CONFIG[perfilAtivo as keyof typeof PERFIL_CONFIG]?.cor ?? '#5330ff', fixas: totalFixasConjunto }]
    : [
        { perfil: 'leticia',  nome: `Letícia (${Math.round(propLet * 100)}%)`,  cor: '#82a1fd', fixas: fixasLeticia },
        { perfil: 'giovanna', nome: `Giovanna (${Math.round(propGio * 100)}%)`, cor: '#ff64ca', fixas: fixasGiovanna },
        { perfil: 'casal',    nome: 'Conjunta (total)', cor: '#ffa857', fixas: totalFixasConjunto },
      ];

  async function salvarReserva(perfil: string, saldo: number) {
    await fetch('/api/reserva', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil, saldo }) });
    const hoje = new Date();
    setReservas(prev => {
      const filtered = prev.filter(r => !(r.perfil === perfil && r.mes === hoje.getMonth() && r.ano === hoje.getFullYear()));
      return [...filtered, { id: Date.now().toString(), perfil, saldo, mes: hoje.getMonth(), ano: hoje.getFullYear() }];
    });
  }

  async function criarMeta() {
    if (!titulo || !valorAlvo) return;
    setSalvando(true);
    const res = await fetch('/api/metas', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo, emoji, cor, visibilidade, criada_por: perfilAtivo, modo_plano: modoPlan,
        valor_alvo: parseFloat(valorAlvo.replace(',', '.')),
        valor_atual: 0,
        aporte_mensal: modoPlan === 'mensal' ? parseFloat(aporteMensal.replace(',', '.')) || 0 : 0,
        data_alvo: modoPlan === 'data' && dataAlvo ? dataAlvo : null,
        concluida: false,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMetas(prev => [data.data, ...prev]);
      setCriando(false);
      setTitulo(''); setValorAlvo(''); setDataAlvo(''); setAporteMensal('');
      setEmoji('🎯'); setCor('#D4537E'); setModoPlan('data'); setVisibilidade('compartilhada');
    }
    setSalvando(false);
  }

  async function registrarAporte(metaId: string, valor: number, observacao: string) {
    const hoje = new Date();
    const res = await fetch('/api/meta-aportes', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meta_id: metaId, perfil: perfilAtivo, valor, mes: hoje.getMonth(), ano: hoje.getFullYear(), observacao }),
    });
    const data = await res.json();
    if (data.success) {
      setAportes(prev => {
        const filtered = prev.filter(a => !(a.meta_id === metaId && a.mes === hoje.getMonth() && a.ano === hoje.getFullYear() && a.perfil === perfilAtivo));
        return [...filtered, data.data];
      });
      setMetas(prev => prev.map(m => m.id === metaId ? { ...m, valor_atual: data.total } : m));
    }
  }

  async function concluirMeta(id: string) {
    const res = await fetch('/api/metas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, concluida: true }) });
    const data = await res.json();
    if (data.success) setMetas(prev => prev.map(m => m.id === id ? data.data : m));
  }

  async function deletarMeta(id: string) {
    await fetch(`/api/metas?id=${id}`, { method: 'DELETE' });
    setMetas(prev => prev.filter(m => m.id !== id));
  }

  // Filtrar metas visíveis para este perfil
  const metasVisiveis = metas.filter(m => !m.concluida && (m.visibilidade === 'compartilhada' || m.criada_por === perfilAtivo));
  const metasConcluidas = metas.filter(m => m.concluida);

  if (carregando) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Header + abas */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Objetivos</p>
        <h2 className="text-xl font-black text-foreground mb-4">Metas financeiras</h2>
        <div className="flex gap-2">
          {[
            { id: 'reserva', label: 'Reserva de Emergência', icon: PiggyBank },
            { id: 'metas',   label: 'Metas de poupança',      icon: Target },
          ].map(tab => {
            const Icon = tab.icon;
            const active = aba === tab.id;
            return (
              <button key={tab.id} onClick={() => setAba(tab.id as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border"
                style={active
                  ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' }
                  : { background: 'transparent', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                }>
                <Icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ABA: RESERVA ── */}
      {aba === 'reserva' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-secondary/30">
            <p className="text-xs text-muted-foreground leading-relaxed">
              A reserva de emergência cobre suas despesas fixas mensais em caso de imprevisto.
              <strong className="text-foreground"> 3 meses</strong> é o mínimo seguro,
              <strong className="text-foreground"> 6 meses</strong> é o ideal,
              <strong className="text-foreground"> 12 meses</strong> é blindado.
              Fixas mensais do casal: <strong className="text-foreground">{fmt(totalFixasConjunto)}</strong>
            </p>
          </div>
          <div className={`grid gap-4 ${perfisReserva.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {perfisReserva.map(p => (
              <CardReserva key={p.perfil}
                perfil={p.perfil} nome={p.nome} cor={p.cor} totalFixas={p.fixas}
                historico={reservas.filter(r => r.perfil === p.perfil)}
                onSalvar={salvarReserva}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── ABA: METAS ── */}
      {aba === 'metas' && (
        <div className="space-y-6">

          {/* Botão nova meta */}
          <div className="flex justify-end">
            <button onClick={() => setCriando(!criando)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'var(--primary)', color: 'white' }}>
              <Plus className="h-4 w-4" />Nova meta
            </button>
          </div>

          {/* Form criar meta */}
          {criando && (
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="pt-4 space-y-4">
                <p className="text-xs font-bold text-foreground uppercase tracking-widest">Nova meta de poupança</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Título</label>
                    <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Viagem para Europa"
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Valor alvo</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <input type="number" value={valorAlvo} onChange={e => setValorAlvo(e.target.value)} placeholder="0"
                        className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                  </div>
                </div>

                {/* Modo de planejamento */}
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Modo de planejamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'data',   label: 'Data alvo',       sub: 'Calcula quanto guardar/mês',    icon: CalendarDays },
                      { id: 'mensal', label: 'Aporte mensal',   sub: 'Calcula quando vai atingir',    icon: Wallet },
                    ].map(op => {
                      const Icon = op.icon;
                      const active = modoPlan === op.id;
                      return (
                        <button key={op.id} onClick={() => setModoPlan(op.id as any)}
                          className="py-3 px-3 rounded-xl text-xs font-medium transition-all border flex flex-col items-center gap-1"
                          style={active
                            ? { background: cor, color: 'white', borderColor: cor }
                            : { background: 'var(--secondary)', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                          }>
                          <Icon className="h-4 w-4" />
                          <span className="font-bold">{op.label}</span>
                          <span className="text-[9px] opacity-70 text-center">{op.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {modoPlan === 'data' && (
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Data alvo</label>
                    <input type="date" value={dataAlvo} onChange={e => setDataAlvo(e.target.value)}
                      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                )}

                {modoPlan === 'mensal' && (
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Quanto vai guardar por mês</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <input type="number" value={aporteMensal} onChange={e => setAporteMensal(e.target.value)} placeholder="0"
                        className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    {valorAlvo && aporteMensal && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Previsão: {Math.ceil(parseFloat(valorAlvo) / parseFloat(aporteMensal))} meses
                      </p>
                    )}
                  </div>
                )}

                {/* Visibilidade */}
                {plano !== 'individual' && (
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Visibilidade</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'compartilhada', label: 'Compartilhada', sub: 'Todos veem' },
                        { id: 'privada',       label: 'Privada',       sub: 'Só você vê' },
                      ].map(op => (
                        <button key={op.id} onClick={() => setVisibilidade(op.id as any)}
                          className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border text-center"
                          style={visibilidade === op.id
                            ? { background: cor, color: 'white', borderColor: cor }
                            : { background: 'transparent', color: 'var(--muted-foreground)', borderColor: 'var(--border)' }
                          }>
                          <span className="font-bold block">{op.label}</span>
                          <span className="text-[9px] opacity-70">{op.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emoji + Cor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Emoji</label>
                    <div className="flex flex-wrap gap-1.5">
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => setEmoji(e)}
                          className={`w-9 h-9 rounded-lg text-lg transition-all ${emoji === e ? 'bg-primary/20 ring-1 ring-primary scale-110' : 'bg-secondary hover:bg-secondary/80'}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-2">Cor</label>
                    <div className="flex flex-wrap gap-2">
                      {CORES.map(c => (
                        <button key={c} onClick={() => setCor(c)}
                          className="w-8 h-8 rounded-full transition-all"
                          style={{ background: c, boxShadow: cor === c ? `0 0 0 3px var(--background), 0 0 0 5px ${c}` : 'none', transform: cor === c ? 'scale(1.15)' : 'scale(1)' }} />
                      ))}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border"
                      style={{ background: `${cor}18`, color: cor, borderColor: `${cor}44` }}>
                      {emoji} {titulo || 'Prévia da meta'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={criarMeta} disabled={salvando || !titulo || !valorAlvo}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-40"
                    style={{ background: cor }}>
                    {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Criar meta
                  </button>
                  <button onClick={() => setCriando(false)}
                    className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-secondary">
                    Cancelar
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de metas */}
          {metasVisiveis.length === 0 && !criando ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma meta ativa</p>
              <p className="text-xs text-muted-foreground mt-1">Crie uma meta para acompanhar seu progresso</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {metasVisiveis.map(meta => (
                <CardMeta key={meta.id} meta={meta}
                  aportes={aportes.filter(a => a.meta_id === meta.id)}
                  perfilAtivo={perfilAtivo}
                  onAporte={registrarAporte}
                  onConcluir={concluirMeta}
                  onDeletar={deletarMeta}
                />
              ))}
            </div>
          )}

          {/* Concluídas */}
          {metasConcluidas.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Concluídas</p>
              <div className="space-y-2">
                {metasConcluidas.map(meta => (
                  <div key={meta.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#1D9E75]/10 border border-[#1D9E75]/20">
                    <span className="text-xl">{meta.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground line-through">{meta.titulo}</p>
                      <p className="text-xs text-muted-foreground">{fmt(meta.valor_alvo)} guardados</p>
                    </div>
                    <Check className="h-4 w-4 text-[#1D9E75] flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
