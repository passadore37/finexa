'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { DashboardSkeleton } from './dashboard-skeleton';
import { KPICard } from './kpi-card';
import { ProjecaoBar } from './projecao-bar';
import { CategoriasPieChart } from './categorias-pie-chart';
import { EvolucaoChart } from './evolucao-chart';
import { HeatmapGastos } from './heatmap-gastos';
import { SankeyDirecionamento } from './sankey-direcionamento';
import { AlertasPanel } from './alertas-panel';
import { SugestoesPanel } from './sugestoes-panel';
import { ParceladasPanel } from './parceladas-panel';
import { UsuarioSelector } from './usuario-selector';
import { useUsuarioContext } from '@/hooks/use-usuario-context';
import { aplicarCorPerfil, PERFIL_CONFIG } from '@/lib/perfil-config';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, RefreshCw, AlertCircle, Bell, LayoutDashboard } from 'lucide-react';
import type { IndicadoresFinanceiros, DadosPlanilha, Transacao } from '@/lib/types';
import { HistoricoView } from '@/components/historico/historico-view';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { calcularEvolucaoMensal, calcularProjecaoBar, calcularParceladas, gerarAlertas, gerarSugestoes } from '@/lib/indicadores';

interface APIResponse {
  success: boolean;
  dados: DadosPlanilha;
  indicadores: IndicadoresFinanceiros;
  limites: { leticia: number; giovanna: number };
  error?: string;
}

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

export function Dashboard() {
  const { usuariaAtiva, setUsuariaAtiva, mounted } = useUsuarioContext();
  const { isSupported, isSubscribed, verificando, registrar } = usePushNotifications(usuariaAtiva);

  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null);
  const [diaAtivo, setDiaAtivo] = useState<number | null>(null);

  const { data, error, isLoading, mutate } = useSWR<APIResponse>(
    '/api/financeiro', fetcher,
    { refreshInterval: 60000, revalidateOnFocus: true, revalidateOnMount: true }
  );

  useEffect(() => { aplicarCorPerfil(usuariaAtiva); }, [usuariaAtiva]);
  useEffect(() => { setCategoriaAtiva(null); setDiaAtivo(null); }, [usuariaAtiva]);

  useEffect(() => {
    const handler = () => mutate();
    window.addEventListener('planejamento-atualizado', handler);
    return () => window.removeEventListener('planejamento-atualizado', handler);
  }, [mutate]);

  function toggleCategoria(cat: string | null) {
    setCategoriaAtiva(prev => prev === cat ? null : cat);
  }

  if (!mounted || isLoading) return <DashboardSkeleton />;

  if (!data || !data.success || !data.dados || !data.indicadores || error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-56 h-56 rounded-[3rem] bg-red-50/50 border border-red-100 flex items-center justify-center mb-8 animate-in zoom-in duration-700">
           <AlertCircle className="h-16 w-16 text-red-500/20" />
        </div>
        <h2 className="text-3xl font-black text-[#08080f] tracking-tighter mb-2">Ops! Houve um erro.</h2>
        <p className="text-sm font-bold text-[#08080f]/30 uppercase tracking-widest mb-8">{data?.error || 'Não foi possível conectar aos seus dados.'}</p>
        <Button 
          onClick={() => mutate()} 
          className="h-14 px-10 rounded-2xl bg-[#5330ff] text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-[#5330ff]/20 hover:scale-105 transition-all"
        >
          <RefreshCw className="h-4 w-4 mr-3" /> Tentar Novamente
        </Button>
      </div>
    );
  }

  const { indicadores, dados, limites } = data;
  const isPerfil = usuariaAtiva === 'leticia' || usuariaAtiva === 'giovanna';
  const perfilDados = isPerfil
    ? indicadores[usuariaAtiva === 'leticia' ? 'perfilLeticia' : 'perfilGiovanna']
    : null;

  const receitas = isPerfil ? perfilDados!.salario : indicadores.receitasMes;
  const despesas = isPerfil ? perfilDados!.parteFixas + perfilDados!.gastosVariaveis : indicadores.despesasMes;
  const saldo = receitas - despesas;
  const saldoLivre = isPerfil ? perfilDados!.saldoLivre : indicadores.metodologia.saldoLivre;
  const categorias = isPerfil ? perfilDados!.categorias : indicadores.despesasPorCategoria;

  const transacoesVisiveis: Transacao[] = isPerfil
    ? dados.transacoes.filter(t => {
        if (t.tipo === 'receita') return t.responsavel === usuariaAtiva;
        return t.recorrente || t.responsavel === usuariaAtiva || t.divisao === '50/50';
      })
    : dados.transacoes;

  const evolucaoMensal = isPerfil ? calcularEvolucaoMensal(transacoesVisiveis) : indicadores.evolucaoMensal;
  const limite = usuariaAtiva === 'casal' ? limites.leticia + limites.giovanna : limites[usuariaAtiva as 'leticia' | 'giovanna'] || 9000;
  const fixas = isPerfil ? perfilDados!.parteFixas : indicadores.metodologia.contasFixas;
  
  const mes = new Date().getMonth();
  const ano = new Date().getFullYear();

  const projecaoBar = isPerfil
    ? calcularProjecaoBar(transacoesVisiveis, mes, ano, limite, fixas, usuariaAtiva as 'leticia' | 'giovanna', perfilDados!.proporcaoRenda)
    : calcularProjecaoBar(transacoesVisiveis, mes, ano, limite, fixas);

  const parceladas = isPerfil
    ? calcularParceladas(transacoesVisiveis, new Date(), usuariaAtiva, perfilDados!.proporcaoRenda)
    : indicadores.parceladas;

  const comprometimentoTotal = isPerfil
    ? parceladas.reduce((acc, p) => acc + p.comprometimentoFuturo, 0)
    : indicadores.comprometimentoTotal;

  const alertas = isPerfil && perfilDados
    ? gerarAlertas({ receitas, despesas }, { receitas: 0, despesas: 0 }, perfilDados.categorias, parceladas, limite, projecaoBar.projecao)
    : indicadores.alertas;

  const sugestoes = isPerfil && perfilDados
    ? gerarSugestoes({ receitas, despesas }, perfilDados.categorias, [])
    : indicadores.sugestoes;

  const semRestantes = indicadores.metodologia.semanas.length - indicadores.metodologia.semanaAtual + 1;
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen">
      {/* Sub-header Glass para Usuária Selecionada */}
      <div className="glass-header !top-16 border-b-0">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <UsuarioSelector usuarioAtivo={usuariaAtiva} onChangeUsuario={setUsuariaAtiva} />
          </div>
          <div className="flex items-center gap-3">
            {!verificando && isSupported && !isSubscribed && (
              <Button onClick={() => registrar('geral')} variant="outline" className="h-10 rounded-xl border-[#5330ff]/20 bg-white/50 text-[#5330ff] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#5330ff]/5">
                <Bell className="h-3.5 w-3.5 mr-2" />
                Ativar Notificações
              </Button>
            )}
            {/* Indicador de Status Offline/Online opcional */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5">
               <div className="w-1.5 h-1.5 rounded-full bg-[#37cc94]" />
               <span className="text-[8px] font-black text-[#08080f]/40 uppercase tracking-widest">Sincronizado</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 mt-16 space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
        
        {/* Header Geral do Dashboard */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.03]">
           <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5330ff] flex items-center justify-center shadow-xl shadow-[#5330ff]/20">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-4xl font-black text-[#08080f] tracking-tighter">Minha Visão</h1>
              </div>
              <p className="text-sm font-bold text-[#08080f]/30 uppercase tracking-widest">Acompanhamento Financeiro em Tempo Real</p>
           </div>
           <div className="text-left md:text-right">
              <p className="text-[10px] font-black text-[#08080f]/20 uppercase tracking-[0.3em] mb-1">Mês de Referência</p>
              <p className="text-2xl font-black text-[#5330ff] tracking-tighter uppercase">{new Date().toLocaleString('pt-BR', { month: 'long' })} {ano}</p>
           </div>
        </div>

        {/* KPIs Grid Superior */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <KPICard titulo="Saldo Atual" valor={saldo} variacao={indicadores.variacaoSaldo} icone={Wallet} corBarra="#5330ff" />
          <KPICard titulo="Receitas" valor={receitas} variacao={indicadores.variacaoReceitas} icone={TrendingUp} corBarra="#37cc94" />
          <KPICard titulo="Despesas" valor={despesas} variacao={indicadores.variacaoDespesas} icone={TrendingDown} corBarra="#ff64ca" />
          <KPICard titulo="Saldo Livre" valor={saldoLivre} icone={PiggyBank} corBarra="#EF9F27" descricao={`${semRestantes} ${semRestantes === 1 ? 'semana restante' : 'semanas restantes'}`} />
        </div>

        {/* Linha 1: Projeção + Evolução */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <ProjecaoBar dados={{ ...projecaoBar, limite }} onAjustarLimite={async (v) => { await fetch('/api/limite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ perfil: usuariaAtiva, limite: v }) }); mutate(); }} perfilGeral={usuariaAtiva === 'casal'} fixas={fixas} />
          <EvolucaoChart dados={evolucaoMensal} />
        </div>

        {/* Linha 2: Mapa de Calor + Fluxo Sankey */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
           <HeatmapGastos 
             transacoes={transacoesVisiveis} 
             diaAtivo={diaAtivo} 
             onDiaSelect={(d) => setDiaAtivo(prev => prev === d ? null : d)} 
           />
           <SankeyDirecionamento 
             receitas={receitas} 
             fixas={fixas} 
             categorias={categorias} 
             categoriaAtiva={categoriaAtiva}
             onCategoriaSelect={toggleCategoria}
           />
        </div>

        {/* Linha 3: Categorias + Parceladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <CategoriasPieChart
            dados={categorias}
            categoriaAtiva={categoriaAtiva}
            onCategoriaSelect={toggleCategoria}
          />
          <ParceladasPanel parceladas={parceladas} comprometimentoTotal={comprometimentoTotal} />
        </div>

        {/* Linha 4: Histórico Transacional (Full Width) */}
        <div className="relative">
           <div className="absolute -top-12 left-0 right-0 h-px bg-black/[0.03]" />
           <HistoricoView categoriaFiltro={categoriaAtiva} diaFiltro={diaAtivo} />
        </div>

        {/* Linha 5: Inteligência (Alertas + Sugestões) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <AlertasPanel alertas={alertas} />
          <SugestoesPanel sugestoes={sugestoes} />
        </div>

        {/* Footer Dashboard */}
        <footer className="pt-24 pb-12 opacity-30 text-center">
           <div className="inline-flex items-center gap-6 px-10 py-4 rounded-full bg-black/5 border border-black/5">
              <p className="text-[10px] font-black text-[#08080f] uppercase tracking-[0.4em]">FINEXA PREMIUM — Glassmorphism Edition</p>
           </div>
        </footer>
      </main>
    </div>
  );
}
