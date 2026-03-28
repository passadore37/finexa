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
    if (variacao > 0) return { icon: TrendingUp, cor: '#37cc94', bg: 'rgba(55,204,148,0.1)', texto: `+${variacao.toFixed(1)}%` };
    if (variacao < 0) return { icon: TrendingDown, cor: '#ff64ca', bg: 'rgba(255,100,202,0.1)', texto: `${variacao.toFixed(1)}%` };
    return { icon: Minus, cor: '#08080f', bg: 'rgba(0,0,0,0.05)', texto: '0%' };
  };

  const tendencia = getTendencia();

  return (
    <Card className={cn('relative group transition-all duration-700 hover:scale-[1.03] border-white shadow-2xl shadow-[#08080f]/5 rounded-[2rem] overflow-hidden', className)}>
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#08080f]/30 leading-none">{titulo}</p>
             <div className="h-0.5 w-4 bg-[#08080f]/10 rounded-full transition-all group-hover:w-8 group-hover:bg-[#5330ff]" />
          </div>
          {Icone && (
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 shadow-lg"
              style={{ background: `${corBarra || '#5330ff'}10`, border: `1px solid ${corBarra || '#5330ff'}15` }}
            >
              <Icone className="h-5 w-5" style={{ color: corBarra || '#5330ff' }} strokeWidth={2.5} />
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <p className="text-4xl font-black text-[#08080f] tabular-nums tracking-tighter leading-none pulse-subtle">
            {formatarValor(valor)}
          </p>
          
          <div className="flex items-center gap-3">
            {tendencia && (
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5 rounded-full shadow-sm transition-transform group-hover:scale-105"
                style={{ background: tendencia.bg, color: tendencia.cor }}>
                <tendencia.icon className="h-3 w-3" strokeWidth={3} />
                {tendencia.texto}
              </span>
            )}
            {descricao && <p className="text-[10px] font-black text-[#08080f]/20 uppercase tracking-widest">{descricao}</p>}
          </div>
        </div>
      </CardContent>
      
      {corBarra && (
        <div 
          className="absolute top-0 right-0 h-1.5 w-24 rounded-bl-xl opacity-60 shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all group-hover:w-full group-hover:opacity-100" 
          style={{ background: corBarra, boxShadow: `0 0 20px ${corBarra}40` }} 
        />
      )}

      {/* Efeito de brilho sutil no hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </Card>
  );
}
