'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';

interface KPICardProps {
  titulo: string;
  valor: number;
  formato?: 'moeda' | 'percentual' | 'numero';
  variacao?: number;
  icone?: LucideIcon;
  corIcone?: string;
  descricao?: string;
  className?: string;
  corBarra?: string;
}

export function KPICard({
  titulo, valor, formato = 'moeda', variacao, icone: Icone,
  corIcone = 'text-primary', descricao, className, corBarra,
}: KPICardProps) {
  const formatarValor = (val: number) => {
    switch (formato) {
      case 'moeda': return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
      case 'percentual': return `${val.toFixed(1)}%`;
      case 'numero': return new Intl.NumberFormat('pt-BR').format(val);
      default: return val.toString();
    }
  };

  const getTendencia = () => {
    if (variacao === undefined) return null;
    if (variacao > 0) return { icon: TrendingUp, cor: 'text-[#3B6D11]', bg: 'bg-[#3B6D11]/20', texto: `+${variacao.toFixed(1)}%` };
    if (variacao < 0) return { icon: TrendingDown, cor: 'text-[#E24B4A]', bg: 'bg-[#A32D2D]/20', texto: `${variacao.toFixed(1)}%` };
    return { icon: Minus, cor: 'text-muted-foreground', bg: 'bg-muted', texto: '0%' };
  };

  const tendencia = getTendencia();

  return (
    <Card className={cn('border border-border bg-card card-hover relative overflow-hidden', className)}>
      {corBarra && <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: corBarra }} />}
      <CardContent className={cn('p-4 sm:p-5', corBarra && 'pl-5 sm:pl-6')}>
        {/* Header: título + ícone */}
        <div className="flex items-center justify-between mb-3">
          <p className="label-uppercase text-muted-foreground">{titulo}</p>
          {Icone && (
            <div className={cn('p-1.5 rounded-lg bg-secondary/50', corIcone)}>
              <Icone className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Valor grande */}
        <p className="text-2xl sm:text-3xl font-medium text-foreground tabular-nums animate-number tracking-tight break-all">
          {formatarValor(valor)}
        </p>

        {/* Footer: badge de variação + descrição */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border gap-2">
          {tendencia ? (
            <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full', tendencia.bg, tendencia.cor)}>
              <tendencia.icon className="h-3 w-3 flex-shrink-0" />
              <span>{tendencia.texto} vs mês ant.</span>
            </span>
          ) : <span />}
          {descricao && <p className="text-[10px] text-muted-foreground text-right">{descricao}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
