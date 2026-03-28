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
  diaAtivo?: number | null;
  onDiaSelect?: (dia: number) => void;
}

export function HeatmapGastos({ transacoes, diaAtivo, onDiaSelect }: HeatmapGastosProps) {
  const { dias, maxValor, mesAtualNome } = useMemo(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const diasMes = Array.from({ length: ultimoDia }, (_, i) => ({
      dia: i + 1,
      total: 0,
    }));

    const tsMes = transacoes.filter(t => {
      if (t.tipo !== 'despesa') return false;
      const tDate = new Date(typeof t.data === 'string' && t.data.length === 10 ? t.data + 'T12:00:00' : t.data);
      return tDate.getMonth() === mes && tDate.getFullYear() === ano;
    });

    tsMes.forEach(t => {
      const tDate = new Date(typeof t.data === 'string' && t.data.length === 10 ? t.data + 'T12:00:00' : t.data);
      const diaIdx = tDate.getDate() - 1;
      if (diaIdx >= 0 && diaIdx < diasMes.length) {
        diasMes[diaIdx].total += t.valor;
      }
    });

    const max = Math.max(...diasMes.map(d => d.total), 1);
    const mesNome = hoje.toLocaleString('pt-BR', { month: 'long' });

    return { dias: diasMes, maxValor: max, mesAtualNome: mesNome };
  }, [transacoes]);

  const primeiroDiaSemana = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
  type DiaMes = { dia: number; total: number };
  const celulas = (Array.from({ length: primeiroDiaSemana }, () => null) as Array<DiaMes | null>).concat(dias);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Card className="h-full flex flex-col w-full relative overflow-hidden group">
      <CardHeader className="pb-4 shrink-0 z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#EF9F27]/10 flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-[#EF9F27]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-1">Calendário</p>
            <CardTitle className="text-lg font-black text-[#08080f] tracking-tighter uppercase">{mesAtualNome}</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-8">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm">
             {/* Header dos dias da semana */}
             <div className="grid grid-cols-7 gap-1 mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((ds, i) => (
                <div key={i} className="text-[8px] font-black text-center text-[#08080f]/20 uppercase tracking-[0.2em]">
                  {ds}
                </div>
              ))}
             </div>

             {/* Grid dos dias do mês */}
             <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
               <TooltipProvider>
                 {celulas.map((celula, idx) => {
                   if (!celula) {
                     return <div key={`empty-${idx}`} className="aspect-square bg-transparent" />;
                   }

                   const isHoje = celula.dia === new Date().getDate();
                   const pct = celula.total / maxValor;
                   const temGasto = celula.total > 0;
                   
                   let corBg = 'bg-black/[0.03]';
                   let corSombra = '';
                   
                   if (temGasto) {
                     if (pct <= 0.33) {
                       corBg = 'bg-[#37cc94]/20';
                       corSombra = 'shadow-[0_4px_12px_rgba(55,204,148,0.2)]';
                     } else if (pct <= 0.66) {
                       corBg = 'bg-[#EF9F27]/30';
                       corSombra = 'shadow-[0_4px_12px_rgba(239,159,39,0.2)]';
                     } else {
                       corBg = 'bg-[#ff64ca]/40';
                       corSombra = 'shadow-[0_4px_12px_rgba(255,100,202,0.2)]';
                     }
                   }

                   const isActive = diaAtivo === celula.dia;

                   return (
                     <Tooltip key={`day-${celula.dia}`}>
                       <TooltipTrigger asChild>
                         <div
                           onClick={() => temGasto && onDiaSelect?.(celula.dia)}
                           className={`aspect-square rounded-xl flex items-center justify-center text-[10px] sm:text-xs transition-all duration-300 relative cursor-pointer border-2 ${
                             isHoje 
                             ? 'border-[#5330ff] shadow-lg scale-105 z-20' 
                             : 'border-transparent hover:scale-110 hover:z-20'
                           } ${isActive ? 'scale-125 z-30 shadow-2xl !border-[#5330ff]' : ''} ${!temGasto ? 'grayscale opacity-30 cursor-default' : ''} ${corBg} ${corSombra}`}
                         >
                           <span className={`font-black tracking-tighter sm:block hidden ${temGasto ? 'text-[#08080f]' : 'text-[#08080f]/20'}`}>
                             {celula.dia}
                           </span>
                           {isHoje && !temGasto && (
                             <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#5330ff] rounded-full border border-white shadow-sm" />
                           )}
                         </div>
                       </TooltipTrigger>
                       <TooltipContent 
                        sideOffset={8} 
                        className="bg-white/90 backdrop-blur-xl border border-white shadow-2xl p-4 rounded-2xl animate-in fade-in zoom-in-95 duration-200"
                       >
                         <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-2">Dia {celula.dia} de {mesAtualNome}</p>
                           <p className="text-xl font-black text-[#08080f] tracking-tighter">
                             {celula.total > 0 ? fmt(celula.total) : 'Sem gastos'}
                           </p>
                           {temGasto && (
                             <p className="text-[10px] font-bold text-[#5330ff] uppercase tracking-widest mt-2 px-2 py-0.5 bg-[#5330ff]/10 rounded-full inline-block">
                               {pct <= 0.33 ? 'Gasto Baixo' : pct <= 0.66 ? 'Gasto Médio' : 'Gasto Crítico'}
                             </p>
                           )}
                         </div>
                       </TooltipContent>
                     </Tooltip>
                   );
                 })}
               </TooltipProvider>
             </div>
             
             {/* Legenda colorida */}
             <div className="flex items-center justify-center gap-6 mt-10">
                {[{ bg: 'bg-black/[0.03]', label: 'ZERO' },
                  { bg: 'bg-[#37cc94]/20', label: 'BAIXO' },
                  { bg: 'bg-[#EF9F27]/30', label: 'MÉDIO' },
                  { bg: 'bg-[#ff64ca]/40', label: 'ALTO' }].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className={`w-4 h-4 rounded-md ${item.bg} border-2 border-white shadow-sm`}></div>
                    <span className="text-[7px] font-black text-[#08080f]/20 uppercase tracking-[0.2em]">{item.label}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
