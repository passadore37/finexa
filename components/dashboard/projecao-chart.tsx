'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { ProjecaoFinanceira } from '@/lib/types';

interface ProjecaoChartProps {
  dados: ProjecaoFinanceira[];
  metaMensal: number;
}

const chartConfig = {
  saldoProjetado: {
    label: 'Saldo Projetado',
    color: 'var(--primary)',
  },
  saldoOtimista: {
    label: 'Cenário Otimista',
    color: 'var(--success)',
  },
  saldoPessimista: {
    label: 'Cenário Pessimista',
    color: 'var(--destructive)',
  },
} satisfies ChartConfig;

export function ProjecaoChart({ dados, metaMensal }: ProjecaoChartProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(valor);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Projeção Financeira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <AreaChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="saldoProjetado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="saldoOtimista" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--success)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="saldoPessimista" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.1} />
                <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={formatarMoeda}
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
              width={60}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(value as number)
                  }
                />
              }
            />
            <ReferenceLine
              y={metaMensal}
              stroke="var(--primary)"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
              label={{
                value: 'Meta',
                position: 'right',
                className: 'text-xs fill-muted-foreground',
              }}
            />
            <Area
              type="monotone"
              dataKey="saldoPessimista"
              stroke="var(--destructive)"
              strokeWidth={1}
              strokeOpacity={0.5}
              fill="url(#saldoPessimista)"
              strokeDasharray="3 3"
            />
            <Area
              type="monotone"
              dataKey="saldoOtimista"
              stroke="var(--success)"
              strokeWidth={1}
              strokeOpacity={0.5}
              fill="url(#saldoOtimista)"
              strokeDasharray="3 3"
            />
            <Area
              type="monotone"
              dataKey="saldoProjetado"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#saldoProjetado)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
