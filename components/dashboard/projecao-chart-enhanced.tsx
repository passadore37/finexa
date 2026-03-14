'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { ProjecaoFinanceira } from '@/lib/types';

interface ProjecaoChartEnhancedProps {
  dados: ProjecaoFinanceira[];
  limite: number;
}

export function ProjecaoChartEnhanced({ dados, limite }: ProjecaoChartEnhancedProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(valor);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs font-medium text-foreground">{payload[0].payload.mes}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {formatarMoeda(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="label-uppercase text-muted-foreground">
          Projeção Financeira (6 meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="mes"
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}
                tickFormatter={(value) => formatarMoeda(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
              <ReferenceLine
                y={limite}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeDasharray="5 5"
                label={{ value: `Limite: ${formatarMoeda(limite)}`, position: 'right', fill: 'rgba(255, 255, 255, 0.6)', fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="saldoProjetado"
                stroke="#D4537E"
                strokeWidth={2}
                dot={{ fill: '#D4537E', r: 4 }}
                activeDot={{ r: 6 }}
                name="Projeção Base"
              />
              <Line
                type="monotone"
                dataKey="saldoOtimista"
                stroke="#3B6D11"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3B6D11', r: 3 }}
                activeDot={{ r: 5 }}
                name="Cenário Otimista"
              />
              <Line
                type="monotone"
                dataKey="saldoPessimista"
                stroke="#A32D2D"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#A32D2D', r: 3 }}
                activeDot={{ r: 5 }}
                name="Cenário Pessimista"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resumo dos cenários */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground label-uppercase mb-1">Base</p>
            <p className="text-lg font-medium text-[#D4537E] tabular-nums">
              {formatarMoeda(dados[dados.length - 1]?.saldoProjetado || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground label-uppercase mb-1">Otimista</p>
            <p className="text-lg font-medium text-[#3B6D11] tabular-nums">
              {formatarMoeda(dados[dados.length - 1]?.saldoOtimista || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-muted-foreground label-uppercase mb-1">Pessimista</p>
            <p className="text-lg font-medium text-[#A32D2D] tabular-nums">
              {formatarMoeda(dados[dados.length - 1]?.saldoPessimista || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
