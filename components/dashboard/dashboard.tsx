'use client';

import useSWR from 'swr';
import { useEffect, useState, useCallback } from 'react';
import { DashboardSkeleton } from './dashboard-skeleton';
import { KPICard } from './kpi-card';
import { ProjecaoBar } from './projecao-bar';
import { CategoriasPieChart } from './categorias-pie-chart';
import { EvolucaoChart } from './evolucao-chart';
import { HeatmapGastos } from './heatmap-gastos';
import { SankeyDirecionamento } from './sankey-direcionamento';
import { AlertasPanel } from './alertas-panel';
import { SugestoesPanel } from './sugestoes-panel';
import { InsightsIAPanel } from './insights-ia-panel';
import { ParceladasPanel } from './parceladas-panel';
import { ContasFixasPanel } from './contas-fixas-panel';
import { UsuarioSelector } from './usuario-selector';
import { MesNavegador } from './mes-navegador';
import { OnboardingTutorial } from './onboarding-tutorial';
import { useUsuarioContext } from '@/hooks/use-usuario-context';
import { useAuth } from '@/hooks/use-auth';
import { usePlano } from '@/hooks/use-plano';
import { useMembros } from '@/hooks/use-membros';
import { useMesContext } from '@/hooks/use-mes-context';
import { aplicarCorPerfil, PERFIL_CONFIG, transacaoVisivel } from '@/lib/perfil-config';
import { useCategorias } from '@/hooks/use-categorias';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, RefreshCw, AlertCircle } from 'lucide-react';
import type { IndicadoresFinanceiros, DadosPlanilha, Transacao } from '@/lib/types';
import { HistoricoView } from '@/components/historico/historico-view';
import { calcularEvolucaoMensal, calcularProjecaoBar, calcularParceladas, gerarAlertas, gerarSugestoes } from '@/lib/indicadores';

interface APIResponse {
  success: boolean;
  dados: DadosPlanilha;
  indicadores: IndicadoresFinanceiros;
  limites: { membro0: number; membro1: number };
  error?: string;
}

interface EvolucaoItem {
  mes: number; ano: number; label: string;
  receitas: number; despesas: number; saldo: number;
}

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

export function Dashboard() {
  const { usuariaAtiva, setUsuariaAtiva, mounted } = useUsuarioContext();
  const { perfil } = useAuth();
  const { plano, perfisVisiveis } = usePlano();
  const { membros } = useMembros();
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  // Mapeia role real → role lógico para os cálculos
  const role0 = membros[0]?.role ?? 'membro0';
  const role1 = membros[1]?.role ?? 'membro1';
  const roleLogico = (r: string) => r === role0 ? 'membro0' : r === role1 ? 'membro1' : r;
  const { getCor } = useCategorias();

  // Mês visualizado — compartilhado globalmente via hook
  const { mes: mesSel_mes, ano: mesSel_ano, navegarMes, ehMesAtual } = useMesContext();
  const mesSel = { mes: mesSel_mes, ano: mesSel_ano };

  // Filtro por categoria e dia
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [diaAtivo, setDiaAtivo] = useState<number | null>(null);

  // Dados do mês selecionado
  const apiUrl = `/api/financeiro?mes=${mesSel.mes}&ano=${mesSel.ano}`;
  const { data, error, isLoading, mutate } = useSWR<APIResponse>(
    apiUrl, fetcher,
    { refreshInterval: 60000, revalidateOnFocus: true, revalidateOnMount: true }
  );

  // Histórico completo para o gráfico de evolução
  const { data: evolucaoData } = useSWR<{ evolucao: EvolucaoItem[] }>(
    `/api/evolucao?categoria=${encodeURIComponent(categoriaAtiva || '')}`, fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => { aplicarCorPerfil(usuariaAtiva); }, [usuariaAtiva]);
  useEffect(() => { setCategoriaAtiva(null); setDiaAtivo(null); }, [usuariaAtiva, mesSel.mes, mesSel.ano]);
  useEffect(() => {
    const handler = () => mutate();
    window.addEventListener('planejamento-atualizado', handler);
    return () => window.removeEventListener('planejamento-atualizado', handler);
  }, [mutate]);

  // Mostrar tutorial para novo usuário (primeiro acesso)
  // Condição corrigida: mostra se o perfil existe E o tutorial ainda não foi visto
  // Não depende de onboarding_done — novo usuário chega ao dash com onboarding_done=false
  useEffect(() => {
    if (perfil && !localStorage.getItem('finexa_tutorial_visto')) {
      setMostrarTutorial(true);
      localStorage.setItem('finexa_tutorial_visto', 'true');
    }
  }, [perfil?.id]);

  const selecionarMesGrafico = (mes: number, ano: number) => navegarMes(mes, ano);

  if (!mounted || isLoading) return <DashboardSkeleton />;

  if (!data || !data.success || !data.dados || !data.indicadores || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="p-4 rounded-full bg-[#A32D2D]/20 w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-[#E24B4A]" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">Erro ao carregar dados</h2>
          <p className="text-sm text-muted-foreground mb-6">{data?.error || 'Não foi possível conectar.'}</p>
          <Button onClick={() => mutate()} variant="outline" className="border-border hover:bg-secondary text-primary group">
            <RefreshCw className="h-4 w-4 mr-2 transition-transform group-hover:rotate-180 duration-500 fill-primary/20" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const { indicadores, dados, limites } = data;
  const isPerfil = usuariaAtiva !== 'casal' && usuariaAtiva !== 'geral';
  const membroAtivo = membros.find(m => m.role === usuariaAtiva);
  const perfilConfig = membroAtivo
    ? { cor: membroAtivo.cor, corSecundaria: membroAtivo.corSecundaria, corBg: membroAtivo.corBg, nome: membroAtivo.nome, emoji: '' }
    : (PERFIL_CONFIG[usuariaAtiva] ?? PERFIL_CONFIG['casal']);
  const perfilDados = isPerfil
    ? indicadores[roleLogico(usuariaAtiva) === 'membro0' ? 'perfilMembro0' : 'perfilMembro1']
    : null;

  const receitas   = isPerfil ? perfilDados!.salario : indicadores.receitasMes;
  const saldoLivre = isPerfil ? perfilDados!.saldoLivre : indicadores.metodologia.saldoLivre;
  const categorias = isPerfil ? perfilDados!.categorias : indicadores.despesasPorCategoria;

  const _salarios = { membro0: dados.salarioMembro0, membro1: dados.salarioMembro1 };
  const transacoesVisiveis: Transacao[] = isPerfil
    ? dados.transacoes.filter(t => {
        if (t.tipo === 'receita') return t.responsavel === roleLogico(usuariaAtiva) || t.responsavel === usuariaAtiva;
        return transacaoVisivel(
          { valor: t.valor, perfil: t.responsavel, responsavel: t.responsavel, divisao: t.divisao, recorrente: t.recorrente, totalParcelas: t.totalParcelas },
          roleLogico(usuariaAtiva), _salarios
        );
      })
    : dados.transacoes;

  // Para gráficos do mês atual apenas (heatmap, categorias, etc)
  const transacoesMesAtual = transacoesVisiveis.filter(t => {
    const d = t.data instanceof Date ? t.data : new Date(typeof t.data === 'string' && t.data.length === 10 ? t.data + 'T12:00:00' : t.data);
    return d.getMonth() === mesSel.mes && d.getFullYear() === mesSel.ano;
  });

  const limite = (usuariaAtiva === 'casal' || usuariaAtiva === 'geral')
    ? limites.membro0 + limites.membro1
    : (limites[roleLogico(usuariaAtiva) as 'membro0' | 'membro1'] || 9000);
  const fixas   = isPerfil ? perfilDados!.parteFixas : indicadores.metodologia.contasFixas;
  const evolucaoMensal = isPerfil
    ? calcularEvolucaoMensal(dados.transacoes, roleLogico(usuariaAtiva) as 'membro0' | 'membro1', dados.salarioMembro0, dados.salarioMembro1, categoriaAtiva)
    : indicadores.evolucaoMensal;

  const parceladas = isPerfil
    ? calcularParceladas(
        dados.transacoes,
        new Date(mesSel.ano, mesSel.mes, 1),
        usuariaAtiva as 'membro0' | 'membro1',
        dados.salarioMembro0,
        dados.salarioMembro1,
      )
    : indicadores.parceladas;

  const projecaoBar = isPerfil
    ? calcularProjecaoBar(transacoesMesAtual, mesSel.mes, mesSel.ano, limite, fixas, usuariaAtiva as 'membro0' | 'membro1', dados.salarioMembro0, dados.salarioMembro1, parceladas)
    : calcularProjecaoBar(transacoesMesAtual, mesSel.mes, mesSel.ano, limite, fixas, undefined, undefined, undefined, parceladas);

  // Usa o gastoAtual da projeção como despesa principal
  const despesas   = projecaoBar.gastoAtual;
  const saldo      = receitas - despesas;

  const comprometimentoTotal = isPerfil
    ? parceladas.reduce((acc, p) => acc + p.comprometimentoFuturo, 0)
    : indicadores.comprometimentoTotal;

  const alertas  = isPerfil && perfilDados ? gerarAlertas({ receitas, despesas }, { receitas: 0, despesas: 0 }, perfilDados.categorias, parceladas, limite, projecaoBar.projecao) : indicadores.alertas;
  const sugestoes = isPerfil && perfilDados ? gerarSugestoes({ receitas, despesas }, perfilDados.categorias, []) : indicadores.sugestoes;

  const semRestantes = indicadores.metodologia.semanas.length - indicadores.metodologia.semanaAtual + 1;
  const sobraAcumulada = indicadores.metodologia.semanas.filter(s => s.status === 'passado').reduce((acc, s) => acc + s.disponivel, 0);
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  // Dados do gráfico de evolução — usa API completa se disponível, fallback para cálculo local
  const MESES_IDX: Record<string, number> = { Jan:0,Fev:1,Mar:2,Abr:3,Mai:4,Jun:5,Jul:6,Ago:7,Set:8,Out:9,Nov:10,Dez:11 };

  const evolucaoGrafico: EvolucaoItem[] = isPerfil
    // Perfil individual: usa cálculo local que já aplica o rateio correto
    ? evolucaoMensal.map(e => {
        const [nomeMes, anoStr] = e.mes.replace(' ●','').split('/');
        return { mes: MESES_IDX[nomeMes] ?? 0, ano: anoStr ? 2000+parseInt(anoStr) : mesSel.ano, label: e.mes, receitas: e.receitas, despesas: e.despesas, saldo: e.saldo };
      })
    // Geral: usa API que busca histórico completo sem rateio
    : evolucaoData?.evolucao?.length
      ? evolucaoData.evolucao
      : evolucaoMensal.map(e => {
          const [nomeMes, anoStr] = e.mes.replace(' ●','').split('/');
          return { mes: MESES_IDX[nomeMes] ?? 0, ano: anoStr ? 2000+parseInt(anoStr) : mesSel.ano, label: e.mes, receitas: e.receitas, despesas: e.despesas, saldo: e.saldo };
        });

  return (
    <div className="min-h-screen bg-background">
      {/* Tutorial para novo usuário */}
      {mostrarTutorial && <OnboardingTutorial onClose={() => setMostrarTutorial(false)} />}

      {/* Barra de controles */}
      <div className="border-b border-border bg-card/50 sticky top-[113px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
          <UsuarioSelector usuarioAtivo={usuariaAtiva} onChangeUsuario={setUsuariaAtiva} />
          <MesNavegador mes={mesSel.mes} ano={mesSel.ano} onChange={navegarMes} />
          <div className="flex items-center gap-2">

          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <KPICard titulo="Saldo do Mês"   valor={saldo}      variacao={indicadores.variacaoSaldo}    icone={Wallet}      corIcone="text-primary"  corBarra="var(--indigo)" />
          <KPICard titulo="Receitas"        valor={receitas}   variacao={indicadores.variacaoReceitas} icone={TrendingUp}  corIcone="text-teal"     corBarra="var(--teal)" />
          <KPICard titulo="Despesas"        valor={despesas}   variacao={indicadores.variacaoDespesas} icone={TrendingDown} corIcone="text-magenta" corBarra="var(--magenta)" />
          <KPICard titulo="Saldo Livre"     valor={saldoLivre} icone={PiggyBank} corIcone="text-primary" corBarra="var(--primary)" descricao={`Sem ${indicadores.metodologia.semanaAtual}/${indicadores.metodologia.semanas.length} · Por dia`} />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        {/* Projeção + Evolução */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ProjecaoBar
            dados={{ ...projecaoBar, limite }}
            onAjustarLimite={async (v) => {
              const res = await fetch('/api/limite', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ perfil: roleLogico(usuariaAtiva), limite: v }),
              });
              if (res.ok) {
                // Forçar re-fetch dos dados para atualizar o limite na tela
                await mutate(undefined, { revalidate: true });
              }
            }}
            perfilGeral={usuariaAtiva === 'casal'}
            fixas={fixas}
            corPerfil={perfilConfig.cor}
          />
          <EvolucaoChart
            dados={evolucaoGrafico}
            mesAtivo={mesSel}
            onMesClick={selecionarMesGrafico}
          />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        {/* Heatmap + Sankey */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 min-h-[300px]">
          <HeatmapGastos
            transacoes={transacoesMesAtual}
            categoriaFiltro={categoriaAtiva}
            diaAtivo={diaAtivo}
            onDiaSelect={(d) => setDiaAtivo(prev => prev === d ? null : d)}
            mes={mesSel.mes}
            ano={mesSel.ano}
          />
          <SankeyDirecionamento
            receitas={receitas}
            fixas={fixas}
            categorias={categorias}
            categoriaAtiva={categoriaAtiva}
            onCategoriaSelect={setCategoriaAtiva}
          />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        {/* Categorias + Parcelas + Contas Fixas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <CategoriasPieChart
            dados={categorias}
            categoriaAtiva={categoriaAtiva}
            onCategoriaSelect={setCategoriaAtiva}
            getCor={getCor}
          />
          <ParceladasPanel parceladas={parceladas} comprometimentoTotal={comprometimentoTotal} />
          <ContasFixasPanel 
            contasFixas={dados.contasFixasConfig} 
            totalMensal={fixas}
          />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        {/* Histórico do mês selecionado */}
        <HistoricoView
          categoriaFiltro={categoriaAtiva}
          diaFiltro={diaAtivo}
          mes={mesSel.mes}
          ano={mesSel.ano}
        />

        <div className="section-separator my-6 sm:my-8" />

        {/* Alertas + Insights IA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <AlertasPanel alertas={alertas} />
          <InsightsIAPanel
            receitas={receitas}
            despesas={despesas}
            saldo={saldo}
            categorias={categorias}
            evolucaoMensal={evolucaoMensal}
            projecao={projecaoBar.projecao}
            limite={limite}
            fixas={fixas}
            nomePerfil={isPerfil ? (usuariaAtiva.charAt(0).toUpperCase() + usuariaAtiva.slice(1)) : ''}
            mes={mesSel.mes}
            ano={mesSel.ano}
          />
        </div>
      </main>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-4 border-t border-border pb-safe">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
          <p>passadore</p>
          <p className="hidden sm:block">
            {semRestantes} {semRestantes === 1 ? 'semana restante' : 'semanas restantes'}
            {sobraAcumulada !== 0 ? ` · ${sobraAcumulada > 0 ? 'Sobra' : 'Déficit'}: ${fmt(Math.abs(sobraAcumulada))}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}