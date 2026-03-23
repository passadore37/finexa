'use client';

import useSWR from 'swr';
import { useEffect } from 'react';
import { DashboardSkeleton } from './dashboard-skeleton';
import { KPICard } from './kpi-card';
import { ProjecaoBar } from './projecao-bar';
import { CategoriasPieChart } from './categorias-pie-chart';
import { EvolucaoChart } from './evolucao-chart';
import { AlertasPanel } from './alertas-panel';
import { SugestoesPanel } from './sugestoes-panel';
import { ParceladasPanel } from './parceladas-panel';
import { UsuarioSelector } from './usuario-selector';
import { useUsuarioContext } from '@/hooks/use-usuario-context';
import { aplicarCorPerfil, PERFIL_CONFIG } from '@/lib/perfil-config';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import type {
  IndicadoresFinanceiros,
  DadosPlanilha,
  Transacao,
} from '@/lib/types';

import { HistoricoView } from '@/components/historico/historico-view';
import { usePushNotifications } from '@/hooks/use-push-notifications';

import {
  calcularEvolucaoMensal,
  calcularProjecaoBar,
  calcularParceladas,
  gerarAlertas,
  gerarSugestoes,
} from '@/lib/indicadores';

interface APIResponse {
  success: boolean;
  dados: DadosPlanilha;
  indicadores: IndicadoresFinanceiros;
  limites: {
    leticia: number;
    giovanna: number;
  };
  error?: string;
}

const fetcher = (url: string) =>
  fetch(url, { cache: 'no-store' }).then((r) => r.json());

export function Dashboard() {
  const { usuariaAtiva, setUsuariaAtiva, mounted } = useUsuarioContext();
  usePushNotifications(usuariaAtiva);

  const { data, error, isLoading, mutate } = useSWR<APIResponse>(
    '/api/financeiro',
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      revalidateOnMount: true,
    }
  );

  useEffect(() => {
    aplicarCorPerfil(usuariaAtiva);
  }, [usuariaAtiva]);

  useEffect(() => {
    const handler = () => mutate();
    window.addEventListener('planejamento-atualizado', handler);
    return () =>
      window.removeEventListener('planejamento-atualizado', handler);
  }, [mutate]);

  if (!mounted || isLoading) return <DashboardSkeleton />;

  if (!data || !data.success || !data.dados || !data.indicadores || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="p-4 rounded-full bg-[#A32D2D]/20 w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-[#E24B4A]" />
          </div>

          <h2 className="text-xl font-medium text-foreground mb-2">
            Erro ao carregar dados
          </h2>

          <p className="text-sm text-muted-foreground mb-6">
            {data?.error || 'Não foi possível conectar.'}
          </p>

          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const { indicadores, dados, limites } = data;

  const perfilConfig = PERFIL_CONFIG[usuariaAtiva];

  const isPerfil =
    usuariaAtiva === 'leticia' || usuariaAtiva === 'giovanna';

  const perfilDados = isPerfil
    ? indicadores[
        usuariaAtiva === 'leticia'
          ? 'perfilLeticia'
          : 'perfilGiovanna'
      ]
    : null;

  const receitas = isPerfil
    ? perfilDados!.salario
    : indicadores.receitasMes;

  const despesas = isPerfil
    ? perfilDados!.parteFixas + perfilDados!.gastosVariaveis
    : indicadores.despesasMes;

  const saldo = receitas - despesas;

  const saldoLivre = isPerfil
    ? perfilDados!.saldoLivre
    : indicadores.metodologia.saldoLivre;

  const categorias = isPerfil
    ? perfilDados!.categorias
    : indicadores.despesasPorCategoria;

  const transacoesVisiveis: Transacao[] = isPerfil
    ? dados.transacoes.filter((t) => {
        if (t.tipo === 'receita') return t.responsavel === usuariaAtiva;
        return (
          t.recorrente ||
          t.responsavel === usuariaAtiva ||
          t.divisao === '50/50'
        );
      })
    : dados.transacoes;

  const evolucaoMensal = isPerfil
    ? calcularEvolucaoMensal(transacoesVisiveis)
    : indicadores.evolucaoMensal;

  const limite =
    usuariaAtiva === 'casal'
      ? ((limites?.leticia || 0) + (limites?.giovanna || 0)) || 9000
      : (limites?.[usuariaAtiva as 'leticia' | 'giovanna'] || 9000);

  async function atualizarLimite(novoLimite: number) {
    if (usuariaAtiva === 'casal') return;
    await fetch('/api/limite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil: usuariaAtiva, limite: novoLimite }),
    });
    mutate();
  }

  const fixas = isPerfil
    ? perfilDados!.parteFixas
    : indicadores.metodologia.contasFixas;

  const hoje = new Date();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();

  const projecaoBar = calcularProjecaoBar(transacoesVisiveis, mes, ano, limite);

  const parceladas = isPerfil
    ? calcularParceladas(transacoesVisiveis, new Date())
    : indicadores.parceladas;

  const comprometimentoTotal = isPerfil
    ? parceladas.reduce((acc, p) => acc + p.comprometimentoFuturo, 0)
    : indicadores.comprometimentoTotal;

  const alertas = isPerfil && perfilDados
    ? gerarAlertas(
        transacoesVisiveis,
        dados,
        { receitas, despesas },
        { receitas: 0, despesas: 0 },
        perfilDados.categorias,
        parceladas,
        limite
      )
    : indicadores.alertas;

  const sugestoes = isPerfil && perfilDados
    ? gerarSugestoes(
        transacoesVisiveis,
        dados,
        { receitas, despesas },
        perfilDados.categorias
      )
    : indicadores.sugestoes;

  const semRestantes =
    indicadores.metodologia.semanas.length -
    indicadores.metodologia.semanaAtual +
    1;

  const sobraAcumulada = indicadores.metodologia.semanas
    .filter((s) => s.status === 'passado')
    .reduce((acc, s) => acc + s.disponivel, 0);

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 sticky top-[113px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
          <UsuarioSelector
            usuarioAtivo={usuariaAtiva}
            onChangeUsuario={setUsuariaAtiva}
          />

          <Button
            onClick={() => mutate()}
            variant="outline"
            size="sm"
            className="border-border hover:bg-secondary"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">Atualizar</span>
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <KPICard
            titulo="Saldo do Mês"
            valor={saldo}
            variacao={indicadores.variacaoSaldo}
            icone={Wallet}
            corIcone="text-primary"
            corBarra="var(--indigo)"
          />

          <KPICard
            titulo="Receitas"
            valor={receitas}
            variacao={indicadores.variacaoReceitas}
            icone={TrendingUp}
            corIcone="text-teal"
            corBarra="var(--teal)"
          />

          <KPICard
            titulo="Despesas"
            valor={despesas}
            variacao={indicadores.variacaoDespesas}
            icone={TrendingDown}
            corIcone="text-magenta"
            corBarra="var(--magenta)"
          />

          <KPICard
            titulo="Saldo Livre"
            valor={saldoLivre}
            icone={PiggyBank}
            corIcone="text-primary"
            corBarra="var(--primary)"
            descricao={`Sem ${indicadores.metodologia.semanaAtual}/${indicadores.metodologia.semanas.length}`}
          />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ProjecaoBar
            dados={{ ...projecaoBar, limite }}
            onAjustarLimite={atualizarLimite}
            perfilGeral={usuariaAtiva === 'casal'}
            fixas={fixas}
          />

          <EvolucaoChart dados={evolucaoMensal} />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <CategoriasPieChart dados={categorias} />

          <ParceladasPanel
            parceladas={parceladas}
            comprometimentoTotal={comprometimentoTotal}
          />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        <HistoricoView />

        <div className="section-separator my-6 sm:my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <AlertasPanel alertas={alertas} />
          <SugestoesPanel sugestoes={sugestoes} />
        </div>
      </main>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-4 border-t border-border pb-safe">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
          <p>
            Finexa ·{' '}
            {new Date().toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </p>

          <p>
            {semRestantes}{' '}
            {semRestantes === 1
              ? 'semana restante'
              : 'semanas restantes'}
            {sobraAcumulada !== 0
              ? ` · ${
                  sobraAcumulada > 0 ? 'Sobra' : 'Déficit'
                }: ${fmt(Math.abs(sobraAcumulada))}`
              : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
