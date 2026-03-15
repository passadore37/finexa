'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import type { DespesaPorCategoria } from '@/lib/types';

interface CategoriasPieChartProps {
  dados: DespesaPorCategoria[];
}

// Cores fixas por categoria — adicione novas categorias aqui
const CORES_CATEGORIA: Record<string, string> = {
  'Alimentação': '#D4537E',
  'Transporte': '#4A90A4',
  'Moradia': '#7B5EA7',
  'Saúde': '#3B6D11',
  'Lazer': '#854F0B',
  'Educação': '#2D6B9A',
  'Compras': '#A85D32',
  'Assinaturas': '#4A7B9D',
  'Gatos': '#C4843E',
  'Serviços': '#5A7A52',
  'Viagem': '#2D8A7B',
  'Contas Fixas': '#7B5EA7',
  'Outros': '#666666',
};

const CORES_FALLBACK = ['#D4537E','#4A90A4','#7B5EA7','#3B6D11','#854F0B','#2D6B9A','#A85D32','#666666'];

export function CategoriasPieChart({ dados }: CategoriasPieChartProps) {
  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const total = dados.reduce((acc, item) => acc + item.valor, 0);

  const chartConfig: ChartConfig = dados.reduce((acc, item, index) => {
    acc[item.categoria] = {
      label: item.categoria,
      color: CORES_CATEGORIA[item.categoria] || CORES_FALLBACK[index % CORES_FALLBACK.length],
    };
    return acc;
  }, {} as ChartConfig);

  const getCor = (categoria: string, index: number) =>
    CORES_CATEGORIA[categoria] || CORES_FALLBACK[index % CORES_FALLBACK.length];

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="label-uppercase text-muted-foreground">Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <ChartContainer config={chartConfig} className="h-[200px] w-[200px] flex-shrink-0">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatarMoeda(value as number)} />} />
              <Pie data={dados} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="valor">
                {dados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCor(entry.categoria, index)} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Legenda */}
          <div className="flex-1 w-full space-y-2">
            {dados.map((item, index) => (
              <div key={item.categoria} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: getCor(item.categoria, index) }} />
                  <span className="text-sm text-foreground truncate">{item.categoria}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{item.percentual.toFixed(0)}%</span>
                  <span className="text-sm font-medium tabular-nums text-foreground">{formatarMoeda(item.valor)}</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Total</span>
              <span className="text-sm font-medium tabular-nums text-foreground">{formatarMoeda(total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
