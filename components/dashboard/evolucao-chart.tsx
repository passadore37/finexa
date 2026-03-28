'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import type { EvolucaoMensal } from '@/lib/types';

interface EvolucaoChartProps {
  dados: EvolucaoMensal[];
}

const chartConfig = {
  receitas: {
    label: 'Receitas',
    color: '#37cc94',
  },
  despesas: {
    label: 'Despesas',
    color: '#ff64ca',
  },
} satisfies ChartConfig;

export function EvolucaoChart({ dados }: EvolucaoChartProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(valor);
  };

  return (
    <Card className="h-full flex flex-col w-full relative overflow-hidden group">
      <CardHeader className="pb-4 shrink-0 z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#37cc94]/10 flex items-center justify-center">
            <Activity className="h-4 w-4 text-[#37cc94]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-1">Histórico</p>
            <CardTitle className="text-lg font-black text-[#08080f] tracking-tighter">Evolução Mensal</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-8">
        <div className="h-[280px] w-full mt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid 
                  strokeDasharray="4 4" 
                  stroke="rgba(0,0,0,0.03)" 
                  vertical={false} 
                />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#08080f', fontWeight: 900, opacity: 0.2 }}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatarMoeda}
                  tick={{ fontSize: 10, fill: '#08080f', fontWeight: 900, opacity: 0.2 }}
                  width={60}
                />
                <ChartTooltip
                  cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 8 }}
                  content={
                    <ChartTooltipContent
                      className="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-2xl p-4"
                      formatter={(value) => (
                        <span className="text-sm font-black text-[#08080f] tracking-tighter">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(value as number)}
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="receitas"
                  fill="#37cc94"
                  radius={[6, 6, 6, 6]}
                  maxBarSize={32}
                  className="transition-all duration-500 hover:brightness-110 shadow-sm"
                />
                <Bar
                  dataKey="despesas"
                  fill="#ff64ca"
                  radius={[6, 6, 6, 6]}
                  maxBarSize={32}
                  className="transition-all duration-500 hover:brightness-110 shadow-sm"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        {/* Legenda prêmio */}
        <div className="flex items-center justify-center gap-8 mt-8">
          {[
            { label: 'Receitas', cor: '#37cc94' },
            { label: 'Despesas', cor: '#ff64ca' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2.5 group/legend cursor-default">
              <div className="w-3 h-3 rounded-full transition-transform group-hover/legend:scale-125" style={{ backgroundColor: item.cor }} />
              <span className="text-[10px] font-black text-[#08080f]/20 uppercase tracking-[0.2em] group-hover/legend:text-[#08080f]/40 transition-colors">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
