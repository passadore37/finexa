'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { EvolucaoMensal } from '@/lib/types';

interface EvolucaoChartProps {
  dados: EvolucaoMensal[];
}

const chartConfig = {
  receitas: { label: 'Receitas', color: 'var(--teal)' },
  despesas: { label: 'Despesas', color: 'var(--magenta)' },
} satisfies ChartConfig;

export function EvolucaoChart({ dados }: EvolucaoChartProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="label-uppercase text-muted-foreground">Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="mes" tickLine={false} axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={fmt}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={60} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)
                  }
                />
              }
            />
            <Bar dataKey="receitas" fill="var(--teal)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="despesas" fill="var(--magenta)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--teal)' }} />
            <span className="text-xs text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--magenta)' }} />
            <span className="text-xs text-muted-foreground">Despesas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
