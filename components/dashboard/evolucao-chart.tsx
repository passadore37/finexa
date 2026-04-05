'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import type { EvolucaoMensal } from '@/lib/types';

interface EvolucaoChartProps {
  dados: EvolucaoMensal[];          // todos os meses com dados (ilimitado)
  mesAtivo?: { mes: number; ano: number };
  onMesClick?: (mes: number, ano: number) => void;
}

const MESES_ABREV = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const chartConfig = {
  receitas: { label: 'Receitas', color: '#3B6D11' },
  despesas: { label: 'Despesas', color: '#A32D2D' },
} satisfies ChartConfig;

export function EvolucaoChart({ dados, mesAtivo, onMesClick }: EvolucaoChartProps) {
  const PAGE_SIZE = 6;
  // Começar mostrando os 6 meses mais recentes
  const [pagina, setPagina] = useState(0);

  const totalPaginas = Math.ceil(dados.length / PAGE_SIZE);
  // pagina 0 = mais recentes, pagina N = mais antigas
  const dadosPagina = [...dados]
    .reverse() // mais recente primeiro
    .slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE)
    .reverse(); // volta a ordem cronológica

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  const handleBarClick = useCallback((data: any) => {
    if (!data?.activePayload?.[0] || !onMesClick) return;
    const payload = data.activePayload[0].payload;
    if (payload.mes !== undefined && payload.ano !== undefined) {
      onMesClick(payload.mes, payload.ano);
    }
  }, [onMesClick]);

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="label-uppercase text-muted-foreground">
            Evolução Mensal
          </CardTitle>
          {dados.length > PAGE_SIZE && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina(p => Math.min(p + 1, totalPaginas - 1))}
                disabled={pagina >= totalPaginas - 1}
                className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] text-muted-foreground">
                {pagina + 1}/{totalPaginas}
              </span>
              <button
                onClick={() => setPagina(p => Math.max(p - 1, 0))}
                disabled={pagina === 0}
                className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        {onMesClick && (
          <p className="text-[10px] text-muted-foreground/60">clique numa barra para ver o mês</p>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <BarChart
            data={dadosPagina}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onClick={handleBarClick}
            style={{ cursor: onMesClick ? 'pointer' : 'default' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#888885' }} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={fmt} tick={{ fontSize: 11, fill: '#888885' }} width={60} />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0]?.payload;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-xs">
                    <p className="font-bold text-foreground mb-1.5">{label}{entry?.parcial ? ' (parcial)' : ''}</p>
                    {payload.map((p: any) => (
                      <p key={p.dataKey} style={{ color: p.fill }} className="flex justify-between gap-4">
                        <span>{p.name}</span>
                        <span className="font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.value)}
                        </span>
                      </p>
                    ))}
                    {entry?.parcial && <p className="text-muted-foreground mt-1 italic">Mês em andamento</p>}
                  </div>
                );
              }}
            />
            <Bar dataKey="receitas" radius={[4,4,0,0]} maxBarSize={40}>
              {dadosPagina.map((entry, i) => {
                const isAtivo = mesAtivo && entry.mes === mesAtivo.mes && entry.ano === mesAtivo.ano;
                return <Cell key={i} fill={isAtivo ? '#4ADE80' : '#3B6D11'} opacity={mesAtivo && !isAtivo ? 0.5 : 1} />;
              })}
            </Bar>
            <Bar dataKey="despesas" radius={[4,4,0,0]} maxBarSize={40}>
              {dadosPagina.map((entry, i) => {
                const isAtivo = mesAtivo && entry.mes === mesAtivo.mes && entry.ano === mesAtivo.ano;
                return <Cell key={i} fill={isAtivo ? '#EF4444' : '#A32D2D'} opacity={mesAtivo && !isAtivo ? 0.5 : 1} />;
              })}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#3B6D11]" />
            <span className="text-xs text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-[#A32D2D]" />
            <span className="text-xs text-muted-foreground">Despesas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
