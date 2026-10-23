'use client';

import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { DashboardSkeleton } from './dashboard-skeleton';
import { UsuarioSelector } from './usuario-selector';
import { MesNavegador } from './mes-navegador';
import { OnboardingTutorial } from './onboarding-tutorial';
import { ProjecaoBar } from './projecao-bar';
import { ComprometimentoRendaCard } from './comprometimento-renda-card';
import { EntradaRapidaGasto } from './entrada-rapida-gasto';
import { HistoricoMes } from './historico-mes';
import { useUsuarioContext } from '@/hooks/use-usuario-context';
import { useAuth } from '@/hooks/use-auth';
import { useMembros } from '@/hooks/use-membros';
import { useMesContext } from '@/hooks/use-mes-context';
import { aplicarCorPerfil, PERFIL_CONFIG } from '@/lib/perfil-config';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import type { IndicadoresFinanceiros, DadosPlanilha } from '@/lib/types';
import { calcularParceladas, calcularProjecaoBar } from '@/lib/indicadores';

interface APIResponse {
  success: boolean;
  dados: DadosPlanilha;
  indicadores: IndicadoresFinanceiros;
  limites: { membro0: number; membro1: number };
  error?: string;
}

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

export function Dashboard() {
  const { usuariaAtiva, setUsuariaAtiva, mounted } = useUsuarioContext();
  const { perfil } = useAuth();
  const { membros } = useMembros();
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  // Mapeia role real → role lógico para os cálculos
  const role0 = membros[0]?.role ?? 'membro0';
  const role1 = membros[1]?.role ?? 'membro1';
  const roleLogico = (r: string) => r === role0 ? 'membro0' : r === role1 ? 'membro1' : r;

  // Mês visualizado — compartilhado globalmente via hook
  const { mes: mesSel_mes, ano: mesSel_ano, navegarMes } = useMesContext();
  const mesSel = { mes: mesSel_mes, ano: mesSel_ano };

  // Dados do mês selecionado
  const apiUrl = `/api/financeiro?mes=${mesSel.mes}&ano=${mesSel.ano}`;
  const { data, error, isLoading, mutate } = useSWR<APIResponse>(
    apiUrl, fetcher,
    { refreshInterval: 60000, revalidateOnFocus: true, revalidateOnMount: true }
  );

  useEffect(() => { aplicarCorPerfil(usuariaAtiva); }, [usuariaAtiva]);
  useEffect(() => {
    const handler = () => mutate();
    window.addEventListener('planejamento-atualizado', handler);
    return () => window.removeEventListener('planejamento-atualizado', handler);
  }, [mutate]);

  // Mostrar tutorial para novo usuário (primeiro acesso)
  useEffect(() => {
    if (perfil && !localStorage.getItem('finexa_tutorial_visto')) {
      setMostrarTutorial(true);
      localStorage.setItem('finexa_tutorial_visto', 'true');
    }
  }, [perfil?.id]);

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

  const receitas = isPerfil ? perfilDados!.salario : indicadores.receitasMes;

  const _salarios = { membro0: dados.salarioMembro0, membro1: dados.salarioMembro1 };

  // Meta de gastos do mês = limite já existente no sistema (limites_financeiros)
  const meta = (usuariaAtiva === 'casal' || usuariaAtiva === 'geral')
    ? limites.membro0 + limites.membro1
    : (limites[roleLogico(usuariaAtiva) as 'membro0' | 'membro1'] || 9000);

  // Custo fixo do mês (já rateado por perfil quando aplicável)
  const fixas = isPerfil ? perfilDados!.parteFixas : indicadores.metodologia.contasFixas;

  // Parcelas em aberto — usamos o valor da parcela deste mês (não o comprometimento futuro total)
  const parceladas = isPerfil
    ? calcularParceladas(
        dados.transacoes,
        new Date(mesSel.ano, mesSel.mes, 1),
        usuariaAtiva as 'membro0' | 'membro1',
        dados.salarioMembro0,
        dados.salarioMembro1,
      )
    : indicadores.parceladas;
  const parcelasMes = parceladas.reduce((acc, p) => acc + p.valorParcela, 0);

  // Barra de gastos do mês atual: gasto até agora, projeção até o fim do mês
  // (ritmo diário só das despesas variáveis — fixas e parcelas entram como valor
  // integral já conhecido, sem serem "esticadas" pelos dias restantes) e meta.
  const projecaoBarDados = calcularProjecaoBar(
    dados.transacoes,
    mesSel.mes,
    mesSel.ano,
    meta,
    fixas,
    isPerfil ? (roleLogico(usuariaAtiva) as 'membro0' | 'membro1') : undefined,
    dados.salarioMembro0,
    dados.salarioMembro1,
    parceladas,
  );

  const nomePerfil = isPerfil ? perfilConfig.nome : 'Casal';

  return (
    <div className="min-h-screen bg-background">
      {/* Tutorial para novo usuário */}
      {mostrarTutorial && <OnboardingTutorial onClose={() => setMostrarTutorial(false)} />}

      {/* Barra de controles — não é fixa, rola junto com a página para nunca
          cobrir o conteúdo abaixo (só o cabeçalho principal do app fica fixo) */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 flex-wrap">
          <UsuarioSelector usuarioAtivo={usuariaAtiva} onChangeUsuario={setUsuariaAtiva} />
          <MesNavegador mes={mesSel.mes} ano={mesSel.ano} onChange={navegarMes} />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Os 2 indicadores principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <ProjecaoBar
            dados={projecaoBarDados}
            perfilGeral={!isPerfil}
            fixas={fixas + parcelasMes}
            corPerfil={perfilConfig.cor}
            nomePerfil={nomePerfil}
            onAjustarLimite={isPerfil ? async (valor) => {
              await fetch('/api/limite', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ perfil: roleLogico(usuariaAtiva), limite: valor }),
              });
              mutate();
            } : undefined}
          />
          <ComprometimentoRendaCard renda={receitas} custoFixo={fixas} parcelas={parcelasMes} nomePerfil={nomePerfil} />
        </div>

        <div className="section-separator my-6 sm:my-8" />

        {/* Entrada rápida de gasto (voz ou texto, sem categoria) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <EntradaRapidaGasto onGastoAdicionado={() => mutate()} />
        </div>

        {/* Histórico do mês — colapsado por padrão, expande inline */}
        <div className="mt-4 sm:mt-6">
          <HistoricoMes
            transacoes={dados.transacoes}
            mes={mesSel.mes}
            ano={mesSel.ano}
            perfil={isPerfil ? (roleLogico(usuariaAtiva) as 'membro0' | 'membro1') : undefined}
            salarioMembro0={dados.salarioMembro0}
            salarioMembro1={dados.salarioMembro1}
            nomePerfil={isPerfil ? nomePerfil : undefined}
          />
        </div>
      </main>
    </div>
  );
}
