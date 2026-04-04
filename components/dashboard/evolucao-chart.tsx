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
  mesSelecionado?: string | null;
  onMesSelect?: (mes: string | null) => void;
}

const chartConfig = {
  receitas: {
    label: 'Receitas',
    color: '#3B6D11',
  },
  despesas: {
    label: 'Despesas',
    color: '#A32D2D',
  },
} satisfies ChartConfig;

export function EvolucaoChart({ dados, mesSelecionado, onMesSelect }: EvolucaoChartProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(valor);
  };

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="label-uppercase text-muted-foreground">
            Evolução Mensal
          </CardTitle>
          {onMesSelect && (
            <span className="text-[10px] text-muted-foreground/60">clique para filtrar</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={dados}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onClick={(data) => {
              if (data?.activePayload?.[0]) {
                const mes = data.activePayload[0].payload.mes;
                onMesSelect?.(mesSelecionado === mes ? null : mes);
              }
            }}
            style={{ cursor: onMesSelect ? 'pointer' : 'default' }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="rgba(255, 255, 255, 0.06)" 
              vertical={false} 
            />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#888885' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={formatarMoeda}
              tick={{ fontSize: 11, fill: '#888885' }}
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
            <Bar
              dataKey="receitas"
              fill="#3B6D11"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="despesas"
              fill="#A32D2D"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ChartContainer>
        
        {mesSelecionado && (
          <div className="flex items-center justify-center gap-2 mt-2 mb-1">
            <span className="text-xs text-muted-foreground">
              Exibindo: <span className="font-bold text-foreground">{mesSelecionado}</span>
            </span>
            <button onClick={() => onMesSelect?.(null)} className="text-xs text-[#5330ff] hover:underline font-bold">
              Ver todos
            </button>
          </div>
        )}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#3B6D11' }} />
            <span className="text-xs text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#A32D2D' }} />
            <span className="text-xs text-muted-foreground">Despesas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
