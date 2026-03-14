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
import { Wallet, TrendingUp, TrendingDown, PiggyBank, RefreshCw, AlertCircle, Target, Calendar } from 'lucide-react';
import type { IndicadoresFinanceiros, DadosPlanilha } from '@/lib/types';

interface APIResponse {
  success: boolean;
  dados: DadosPlanilha;
  indicadores: IndicadoresFinanceiros;
  error?: string;
}

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

export function Dashboard() {
  const { usuariaAtiva, setUsuariaAtiva, mounted } = useUsuarioContext();

  const { data, error, isLoading, mutate } = useSWR<APIResponse>(
    '/api/financeiro',
    fetcher,
    { refreshInterval: 60 * 1000, revalidateOnFocus: true, revalidateOnMount: true }
  );

  // Aplicar cor do perfil
  useEffect(() => {
    aplicarCorPerfil(usuariaAtiva);
  }, [usuariaAtiva]);

  // Rebuscar quando planejamento for salvo
  useEffect(() => {
    const handler = () => mutate();
    window.addEventListener('planejamento-atualizado', handler);
    return () => window.removeEventListener('planejamento-atualizado', handler);
  }, [mutate]);

  if (!mounted || isLoading) return <DashboardSkeleton />;

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="p-4 rounded-full bg-[#A32D2D]/20 w-fit mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-[#E24B4A]" />
          </div>
          <h2 className="text-xl font-medium text-foreground mb-2">Erro ao carregar dados</h2>
          <p className="text-sm text-muted-foreground mb-6">{data?.error || 'Não foi possível conectar.'}</p>
          <Button onClick={() => mutate()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const { indicadores } = data;
  const perfilConfig = PERFIL_CONFIG[usuariaAtiva];

  // Dados por contexto de visualização
  const isPerfil = usuariaAtiva === 'leticia' || usuariaAtiva === 'giovanna';
  const perfilDados = isPerfil ? indicadores[usuariaAtiva === 'leticia' ? 'perfilLeticia' : 'perfilGiovanna'] : null;

  // KPIs dependem do perfil ativo
  const receitas = isPerfil ? perfilDados!.salario : indicadores.receitasMes;
  const despesas = isPerfil ? (perfilDados!.parteFixas + perfilDados!.gastosVariaveis) : indicadores.despesasMes;
  const saldo = receitas - despesas;
  const saldoLivre = isPerfil ? perfilDados!.saldoLivre : indicadores.metodologia.saldoLivre;
  const categorias = isPerfil ? perfilDados!.categorias : indicadores.despesasPorCategoria;

  const semRestantes = indicadores.metodologia.semanas.length - indicadores.metodologia.semanaAtual + 1;
  const sobraAcumulada = indicadores.metodologia.semanas
    .filter(s => s.status === 'passado')
    .reduce((acc, s) => acc + s.disponivel, 0);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-background">
      {/* Subheader */}
      <div className="border-b border-border bg-card/50 sticky top-[113px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
          <UsuarioSelector usuarioAtivo={usuariaAtiva} onChangeUsuario={setUsuariaAtiva} />
          <Button onClick={() => mutate()} variant="outline" size="sm" className="border-border hover:bg-secondary">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span className="text-xs">Atualizar</span>
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* KPIs principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <KPICard titulo="Saldo do Mês" valor={saldo} variacao={indicadores.variacaoSaldo} icone={Wallet} corIcone="text-primary" corBarra="var(--primary)" />
          <KPICard titulo="Receitas" valor={receitas} variacao={indicadores.variacaoReceitas} icone={TrendingUp} corIcone="text-[#3B6D11]" corBarra="#3B6D11" />
          <KPICard titulo="Despesas" valor={despesas} variacao={indicadores.variacaoDespesas} icone={TrendingDown} corIcone="text-[#A32D2D]" corBarra="#A32D2D" />
          <KPICard
            titulo="Saldo Livre"
            valor={saldoLivre}
            icone={PiggyBank}
            corIcone="text-primary"
            corBarra="var(--primary)"
            descricao={`Sem ${indicadores.metodologia.semanaAtual}/${indicadores.metodologia.semanas.length}`}
          />
        </div>

        {/* Cards de perfil individual */}
        {isPerfil && perfilDados && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-4 rounded-xl border" style={{ background: perfilConfig.corBg, borderColor: `${perfilConfig.cor}33` }}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Parte das Fixas</p>
                <p className="text-xl font-medium tabular-nums" style={{ color: perfilConfig.cor }}>{fmt(perfilDados.parteFixas)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{Math.round(perfilDados.proporcaoRenda * 100)}% do total</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-secondary/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Comprometimento</p>
                <p className="text-xl font-medium tabular-nums text-foreground">{Math.round(perfilDados.comprometimento)}%</p>
                <p className="text-[10px] text-muted-foreground mt-1">do meu salário</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-secondary/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Envelope Semanal</p>
                <p className="text-xl font-medium tabular-nums text-foreground">{fmt(perfilDados.envelopeSemanal)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">disponível/semana</p>
              </div>
              <div className="p-4 rounded-xl border" style={{ background: perfilDados.progressoMeta >= 100 ? 'rgba(59,109,17,0.1)' : 'transparent', borderColor: perfilDados.progressoMeta >= 100 ? '#3B6D11' : 'rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Meta Economia</p>
                <p className="text-xl font-medium tabular-nums text-foreground">{Math.round(perfilDados.progressoMeta)}%</p>
                <p className="text-[10px] text-muted-foreground mt-1">meta: {fmt(perfilDados.metaEconomia)}</p>
              </div>
            </div>
          </>
        )}

        <div className="section-separator my-6 sm:my-8" />

        {/* Projeção + Evolução */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ProjecaoBar dados={indicadores.projecaoBar} />
          <EvolucaoChart dados={indicadores.evolucaoMensal} />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        {/* Categorias + Parceladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <CategoriasPieChart dados={categorias.length > 0 ? categorias : indicadores.despesasPorCategoria} />
          <ParceladasPanel parceladas={indicadores.parceladas} comprometimentoTotal={indicadores.comprometimentoTotal} />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        {/* Alertas + Sugestões */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <AlertasPanel alertas={indicadores.alertas} />
          <SugestoesPanel sugestoes={indicadores.sugestoes} />
        </div>
      </main>

      {/* Rodapé */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-4 border-t border-border pb-safe">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
          <p>Finexa · {new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
          <p>
            {semRestantes} {semRestantes === 1 ? 'semana restante' : 'semanas restantes'}
            {sobraAcumulada !== 0 ? ` · ${sobraAcumulada > 0 ? 'Sobra' : 'Déficit'}: ${fmt(Math.abs(sobraAcumulada))}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
