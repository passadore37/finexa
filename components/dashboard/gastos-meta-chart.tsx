'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import type { EvolucaoMensal } from '@/lib/types';

interface GastosMetaChartProps {
  dados: EvolucaoMensal[]; // histórico mensal (usa o campo despesas)
  meta: number;            // meta de gastos do mês (limite atual)
  nomePerfil?: string;
}

const chartConfig = {
  despesas: { label: 'Gasto', color: 'var(--magenta)' },
} satisfies ChartConfig;

export function GastosMetaChart({ dados, meta, nomePerfil }: GastosMetaChartProps) {
  const PAGE_SIZE = 6;
  // últimos 6 meses, ordem cronológica
  const dadosPagina = [...dados].slice(-PAGE_SIZE).map(d => ({
    mes: d.mes,
    despesas: d.despesas,
    acimaDaMeta: d.despesas > meta,
  }));

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  return (
    <Card className="border bg-card card-hover">
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Gastos x Meta {nomePerfil ? `— ${nomePerfil}` : ''}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Meta atual: <span className="font-semibold text-foreground">{fmt(meta)}</span> / mês
        </p>
      </CardHeader>
      <CardContent>
        {dadosPagina.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Sem dados suficientes ainda.</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={dadosPagina} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis tickFormatter={fmt} tickLine={false} axisLine={false} fontSize={11} width={56} />
              <ChartTooltip content={<ChartTooltipContent formatter={(v) => fmt(Number(v))} />} />
              <ReferenceLine
                y={meta}
                stroke="var(--primary)"
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{ value: 'Meta', position: 'insideTopRight', fontSize: 11, fill: 'var(--primary)' }}
              />
              <Bar dataKey="despesas" radius={[6, 6, 0, 0]}>
                {dadosPagina.map((d, i) => (
                  <Cell key={i} fill={d.acimaDaMeta ? 'var(--magenta)' : 'var(--teal)'} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
