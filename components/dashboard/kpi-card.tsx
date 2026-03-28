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

export function KPICard({ titulo, valor, formato = 'moeda', variacao, icone: Icone, corIcone, descricao, className, corBarra }: KPICardProps) {
  const formatarValor = (val: number) => {
    switch (formato) {
      case 'moeda': return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
      case 'percentual': return `${val.toFixed(1)}%`;
      case 'numero': return new Intl.NumberFormat('pt-BR').format(val);
      default: return val.toString();
    }
  };

  const getTendencia = () => {
    if (variacao === undefined) return null;
    if (variacao > 0) return { icon: TrendingUp, cor: 'var(--teal)', bg: 'rgba(1,182,149,0.12)', texto: `+${variacao.toFixed(1)}%` };
    if (variacao < 0) return { icon: TrendingDown, cor: 'var(--magenta)', bg: 'rgba(255,100,202,0.12)', texto: `${variacao.toFixed(1)}%` };
    return { icon: Minus, cor: 'var(--muted-foreground)', bg: 'var(--secondary)', texto: '0%' };
  };

  const tendencia = getTendencia();

  return (
    <Card className={cn('border bg-card card-hover relative overflow-hidden', className)}
      style={{ borderColor: corBarra ? `${corBarra}30` : undefined }}>
      {/* Acento colorido no topo */}
      {corBarra && (
        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-lg" style={{ background: corBarra }} />
      )}
      <CardContent className="p-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <p className="label-uppercase text-muted-foreground">{titulo}</p>
          {Icone && (
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm border border-current/10" 
              style={{ 
                background: corBarra ? `${corBarra}15` : 'var(--secondary)',
                color: corBarra || 'var(--primary)',
                boxShadow: corBarra ? `0 0 15px ${corBarra}20` : 'none'
              }}
            >
              <Icone 
                className="h-4 w-4 transition-transform group-hover:scale-110" 
                fill={corBarra ? `${corBarra}33` : 'currentColor'} 
              />
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums animate-number tracking-tight break-all">
          {formatarValor(valor)}
        </p>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border gap-2">
          {tendencia ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: tendencia.bg, color: tendencia.cor }}>
              <tendencia.icon className="h-3 w-3 flex-shrink-0" />
              {tendencia.texto} vs mês ant.
            </span>
          ) : <span />}
          {descricao && <p className="text-[10px] text-muted-foreground text-right">{descricao}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
