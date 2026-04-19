'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ChevronRight, TrendingUp, TrendingDown, Lightbulb, Target, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DespesaPorCategoria, EvolucaoMensal } from '@/lib/types';

interface InsightsIAPanelProps {
  receitas: number;
  despesas: number;
  saldo: number;
  categorias: DespesaPorCategoria[];
  evolucaoMensal: EvolucaoMensal[];
  projecao: number;
  limite: number;
  fixas: number;
  nomePerfil: string;
  mes: number;
  ano: number;
}

const NOMES_MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

type InsightTipo = 'positivo' | 'atencao' | 'dica' | 'meta';

interface Insight {
  tipo: InsightTipo;
  titulo: string;
  texto: string;
  icone: React.ElementType;
}

const CORES_TIPO: Record<InsightTipo, { bg: string; border: string; icon: string; badge: string; badgeText: string }> = {
  positivo: { bg: 'bg-[#01b695]/8', border: 'border-[#01b695]/25', icon: 'text-[#01b695]', badge: 'bg-[#01b695]/15 text-[#01b695]', badgeText: 'Bom sinal' },
  atencao:  { bg: 'bg-[#ffa857]/8', border: 'border-[#ffa857]/25', icon: 'text-[#ffa857]', badge: 'bg-[#ffa857]/15 text-[#ffa857]', badgeText: 'Atenção' },
  dica:     { bg: 'bg-[#5330ff]/8', border: 'border-[#5330ff]/25', icon: 'text-[#5330ff]', badge: 'bg-[#5330ff]/15 text-[#5330ff]', badgeText: 'Dica' },
  meta:     { bg: 'bg-[#d147e8]/8', border: 'border-[#d147e8]/25', icon: 'text-[#d147e8]', badge: 'bg-[#d147e8]/15 text-[#d147e8]', badgeText: 'Meta' },
};

function gerarInsights(props: InsightsIAPanelProps): Insight[] {
  const { receitas, despesas, categorias, evolucaoMensal, projecao, limite, fixas, nomePerfil, mes } = props;
  const insights: Insight[] = [];
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const nomeMes = NOMES_MESES[mes];

  const taxaPoupanca = receitas > 0 ? ((receitas - despesas) / receitas) * 100 : 0;
  const percProjecao = receitas > 0 ? (projecao / receitas) * 100 : 0;
  const categMaisGasta = [...categorias].sort((a, b) => b.valor - a.valor)[0];
  const gastosVariaveis = despesas - fixas;

  // Calcular variação em relação ao mês anterior
  const mesesOrdenados = [...evolucaoMensal].reverse();
  const mesAnterior = mesesOrdenados[1];
  const variacaoDespesas = mesAnterior && mesAnterior.despesas > 0
    ? ((despesas - mesAnterior.despesas) / mesAnterior.despesas) * 100 : 0;

  // 1. Taxa de poupança
  if (taxaPoupanca >= 20) {
    insights.push({
      tipo: 'positivo',
      icone: TrendingUp,
      titulo: 'Taxa de poupança excelente',
      texto: `${nomePerfil ? nomePerfil + ', você' : 'Você'} está guardando ${taxaPoupanca.toFixed(0)}% da renda em ${nomeMes}. Isso coloca você nas melhores práticas financeiras para construção de patrimônio.`,
    });
  } else if (taxaPoupanca < 0) {
    insights.push({
      tipo: 'atencao',
      icone: AlertTriangle,
      titulo: 'Gastos acima da receita',
      texto: `Em ${nomeMes}, os gastos superaram a receita em ${fmt(Math.abs(despesas - receitas))}. É importante identificar quais categorias estão acima do planejado.`,
    });
  } else if (taxaPoupanca < 10 && receitas > 0) {
    insights.push({
      tipo: 'atencao',
      icone: TrendingDown,
      titulo: 'Margem de poupança baixa',
      texto: `A taxa de poupança de ${taxaPoupanca.toFixed(0)}% em ${nomeMes} está abaixo do recomendado (20%). Reduzir gastos variáveis em ${fmt((receitas * 0.1) - (receitas - despesas))} resolveria isso.`,
    });
  }

  // 2. Categoria mais relevante
  if (categMaisGasta && categMaisGasta.percentual > 30) {
    insights.push({
      tipo: 'atencao',
      icone: AlertTriangle,
      titulo: `${categMaisGasta.categoria} concentra muito`,
      texto: `${fmt(categMaisGasta.valor)} foram gastos em ${categMaisGasta.categoria} — ${categMaisGasta.percentual.toFixed(0)}% do total. Concentração acima de 30% em uma categoria pode indicar oportunidade de revisão.`,
    });
  }

  // 3. Dica sobre gastos fixos
  const percFixas = receitas > 0 ? (fixas / receitas) * 100 : 0;
  if (percFixas > 50) {
    insights.push({
      tipo: 'dica',
      icone: Lightbulb,
      titulo: 'Fixos pesados na renda',
      texto: `As contas fixas (${fmt(fixas)}) representam ${percFixas.toFixed(0)}% da receita. Uma boa meta é mantê-las abaixo de 50%, o que liberaria ${fmt(fixas - receitas * 0.5)} a mais por mês.`,
    });
  } else if (percFixas > 0 && percFixas < 45) {
    insights.push({
      tipo: 'positivo',
      icone: TrendingUp,
      titulo: 'Equilíbrio entre fixo e variável',
      texto: `Com os fixos em ${percFixas.toFixed(0)}% da renda, você mantém boa flexibilidade para gastos variáveis e imprevistos em ${nomeMes}.`,
    });
  }

  // 4. Variação em relação ao mês anterior
  if (Math.abs(variacaoDespesas) > 15 && mesAnterior) {
    if (variacaoDespesas < -15) {
      insights.push({
        tipo: 'positivo',
        icone: TrendingDown,
        titulo: `Redução de ${Math.abs(variacaoDespesas).toFixed(0)}% nos gastos`,
        texto: `Em comparação ao mês anterior, os gastos caíram ${fmt(mesAnterior.despesas - despesas)}. Ótima evolução — continue assim para acelerar seus objetivos.`,
      });
    } else {
      insights.push({
        tipo: 'atencao',
        icone: TrendingUp,
        titulo: `Gastos aumentaram ${variacaoDespesas.toFixed(0)}%`,
        texto: `Os gastos de ${nomeMes} estão ${fmt(despesas - mesAnterior.despesas)} acima do mês anterior. Vale checar em quais categorias houve esse aumento.`,
      });
    }
  }

  // 5. Projeção e meta
  if (projecao > 0 && limite > 0) {
    const percMeta = (projecao / limite) * 100;
    if (percMeta <= 85) {
      insights.push({
        tipo: 'meta',
        icone: Target,
        titulo: 'No caminho certo',
        texto: `A projeção para fechar ${nomeMes} é ${fmt(projecao)}, ou seja, ${(100 - percMeta).toFixed(0)}% abaixo do limite. Se mantiver o ritmo, encerrará o mês com folga de ${fmt(limite - projecao)}.`,
      });
    } else if (percMeta > 100) {
      insights.push({
        tipo: 'atencao',
        icone: AlertTriangle,
        titulo: 'Projeção ultrapassa o limite',
        texto: `A projeção atual de ${fmt(projecao)} supera seu limite de ${fmt(limite)} em ${fmt(projecao - limite)}. Reduzir os gastos variáveis nos próximos dias pode reverter isso.`,
      });
    }
  }

  // 6. Dica de envelope semanal se gastos variáveis > 0
  if (gastosVariaveis > 0 && receitas > 0) {
    const envelopeSemanal = ((receitas - fixas) * 0.7) / 4;
    if (envelopeSemanal > 0) {
      insights.push({
        tipo: 'dica',
        icone: Lightbulb,
        titulo: 'Estratégia de envelope semanal',
        texto: `Dividindo o orçamento variável em envelopes semanais de ${fmt(envelopeSemanal)}, fica mais fácil controlar os impulsos e não comprometer o final do mês.`,
      });
    }
  }

  // Retornar até 4 insights mais relevantes
  return insights.slice(0, 4);
}

export function InsightsIAPanel(props: InsightsIAPanelProps) {
  const { nomePerfil, mes, ano } = props;
  const [insightAtivo, setInsightAtivo] = useState(0);
  const [recarregando, setRecarregando] = useState(false);

  const insights = useMemo(() => gerarInsights(props), [props]);

  const handleRecarregar = () => {
    setRecarregando(true);
    setTimeout(() => {
      setInsightAtivo(prev => (prev + 1) % insights.length);
      setRecarregando(false);
    }, 600);
  };

  const insight = insights[insightAtivo];
  if (!insight) return null;

  const cores = CORES_TIPO[insight.tipo];
  const Icone = insight.icone;
  const Label = NOMES_MESES[mes];

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #5330ff, #d147e8)' }}>
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <CardTitle className="label-uppercase text-muted-foreground">Insights IA</CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground hidden sm:block">
              {nomePerfil ? nomePerfil + ' · ' : ''}{Label}/{ano}
            </span>
            <button
              onClick={handleRecarregar}
              disabled={recarregando || insights.length <= 1}
              className="p-1 rounded-md hover:bg-secondary transition-colors disabled:opacity-40"
              title="Próximo insight"
            >
              <RefreshCw className={cn('h-3.5 w-3.5 text-muted-foreground', recarregando && 'animate-spin')} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Indicadores de posição */}
        {insights.length > 1 && (
          <div className="flex gap-1">
            {insights.map((ins, i) => (
              <button
                key={i}
                onClick={() => setInsightAtivo(i)}
                className={cn(
                  'h-1 rounded-full transition-all',
                  i === insightAtivo ? 'flex-1' : 'w-4 opacity-30'
                )}
                style={{ background: i === insightAtivo ? CORES_TIPO[ins.tipo].icon.replace('text-', '') : undefined }}
              />
            ))}
          </div>
        )}

        {/* Card do insight ativo */}
        <div className={cn('p-4 rounded-xl border transition-all', cores.bg, cores.border)}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${cores.bg.replace('bg-', '').replace('/8', '')}20`.replace('/', '20') }}>
              <Icone className={cn('h-4 w-4', cores.icon)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <p className="text-sm font-black text-foreground leading-tight">{insight.titulo}</p>
                <span className={cn('text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md flex-shrink-0', cores.badge)}>
                  {CORES_TIPO[insight.tipo].badgeText}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.texto}</p>
            </div>
          </div>
        </div>

        {/* Listagem compacta dos outros insights */}
        {insights.length > 1 && (
          <div className="space-y-1">
            {insights.filter((_, i) => i !== insightAtivo).map((ins, i) => {
              const c = CORES_TIPO[ins.tipo];
              const I = ins.icone;
              const originalIndex = insights.indexOf(ins);
              return (
                <button
                  key={i}
                  onClick={() => setInsightAtivo(originalIndex)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors text-left group"
                >
                  <I className={cn('h-3.5 w-3.5 flex-shrink-0', c.icon)} />
                  <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate flex-1">
                    {ins.titulo}
                  </p>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {/* Footer com branding de IA */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
            Gerado com base nos seus dados reais
          </p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#01b695] animate-pulse" />
            <span className="text-[9px] text-muted-foreground">Finexa AI</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
