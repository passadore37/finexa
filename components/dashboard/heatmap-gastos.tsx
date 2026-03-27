'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import type { Transacao } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeatmapGastosProps {
  transacoes: Transacao[];
}

export function HeatmapGastos({ transacoes }: HeatmapGastosProps) {
  const { dias, maxValor, mesAtualNome } = useMemo(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const diasMes = Array.from({ length: ultimoDia }, (_, i) => ({
      dia: i + 1,
      total: 0,
    }));

    // Filtrar apenas despesas deste mês
    const tsMes = transacoes.filter(t => {
      if (t.tipo !== 'despesa') return false;
      const tDate = new Date(typeof t.data === 'string' && t.data.length === 10 ? t.data + 'T12:00:00' : t.data);
      return tDate.getMonth() === mes && tDate.getFullYear() === ano;
    });

    // Somar por dia
    tsMes.forEach(t => {
      const tDate = new Date(typeof t.data === 'string' && t.data.length === 10 ? t.data + 'T12:00:00' : t.data);
      const diaIdx = tDate.getDate() - 1;
      if (diaIdx >= 0 && diaIdx < diasMes.length) {
        diasMes[diaIdx].total += t.valor;
      }
    });

    const max = Math.max(...diasMes.map(d => d.total), 1);
    
    // Obter fuso ajustado pra formatar mês
    const mesNome = hoje.toLocaleString('pt-BR', { month: 'long' });

    return { dias: diasMes, maxValor: max, mesAtualNome: mesNome };
  }, [transacoes]);

  const primeiroDiaSemana = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();

  // Vamos montar o array de células pro calendário (preenche o começo com "vazios")
  const celulas = Array.from({ length: primeiroDiaSemana }, () => null).concat(dias);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="label-uppercase text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#ff64ca]" />
            Intensidade de Gastos
          </CardTitle>
          <span className="text-xs text-muted-foreground capitalize">{mesAtualNome}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
          <div className="min-w-[300px]">
             {/* Header dos dias da semana */}
             <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(ds => (
                <div key={ds} className="text-[10px] text-center text-muted-foreground">
                  {ds}
                </div>
              ))}
             </div>

             {/* Grid dos dias do mês */}
             <div className="grid grid-cols-7 gap-1">
               <TooltipProvider>
                 {celulas.map((celula, idx) => {
                   if (!celula) {
                     return <div key={`empty-${idx}`} className="aspect-square rounded-md bg-transparent" />;
                   }

                   // Calcula nível de cor:
                   // Se = 0 -> secondary
                   // Se > 0 -> opacity entre 0.3 e 1
                   const isHoje = celula.dia === new Date().getDate();
                   const pct = celula.total / maxValor;
                   const temGasto = celula.total > 0;
                   const bgClass = temGasto ? '' : 'bg-secondary/40';

                   return (
                     <Tooltip key={`day-${celula.dia}`}>
                       <TooltipTrigger asChild>
                         <div
                           className={`aspect-square rounded-md flex items-center justify-center text-[10px] transition-transform hover:scale-105 cursor-pointer relative ${bgClass}`}
                           style={{
                             backgroundColor: temGasto ? 'var(--magenta)' : undefined,
                             opacity: temGasto ? 0.3 + (0.7 * pct) : undefined,
                             color: temGasto && pct > 0.4 ? '#fff' : 'var(--muted-foreground)',
                           }}
                         >
                           <span className={`z-10 ${temGasto && pct > 0.4 ? 'font-bold' : ''}`}>
                             {celula.dia}
                           </span>
                           {isHoje && (
                             <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-foreground rounded-full transform -translate-y-1/2 translate-x-1/2 ring-2 ring-card" />
                           )}
                         </div>
                       </TooltipTrigger>
                       <TooltipContent className="bg-popover border border-border shadow-lg">
                         <div className="text-center">
                           <p className="font-semibold text-foreground text-sm">
                             Dia {celula.dia}
                           </p>
                           <p className="text-muted-foreground text-xs mt-1">
                             {celula.total > 0 ? fmt(celula.total) : 'Sem gastos registrados'}
                           </p>
                         </div>
                       </TooltipContent>
                     </Tooltip>
                   );
                 })}
               </TooltipProvider>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
