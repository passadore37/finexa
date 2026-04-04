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
    const diaHoje = hoje.getDate(); // não mostrar dias futuros
    const diasMes = Array.from({ length: ultimoDia }, (_, i) => ({
      dia: i + 1,
      total: 0,
      futuro: (i + 1) > diaHoje, // marcador de dia futuro
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
  type DiaMes = { dia: number; total: number; futuro?: boolean };
  const celulas = (Array.from({ length: primeiroDiaSemana }, () => null) as Array<DiaMes | null>).concat(dias);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="label-uppercase text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#EF9F27]" />
            Intensidade de Gastos
          </CardTitle>
          <span className="text-xs text-muted-foreground capitalize">{mesAtualNome}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex justify-center">
          <div className="w-auto">
             {/* Header dos dias da semana */}
             <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(ds => (
                <div key={ds} className="text-[9px] text-center text-muted-foreground uppercase tracking-widest">
                  {ds}
                </div>
              ))}
             </div>

             {/* Grid dos dias do mês */}
             <div className="grid grid-cols-7 gap-1.5">
               <TooltipProvider>
                 {celulas.map((celula, idx) => {
                   if (!celula) {
                     return <div key={`empty-${idx}`} className="w-8 h-8 rounded-sm bg-transparent" />;
                   }

                   const isHoje = celula.dia === new Date().getDate();
                   const pct = celula.total / maxValor;
                   const temGasto = celula.total > 0;
                   
                   // Escala semafórica:
                   // 0 -> cinza
                   // > 0 a 33% -> verde (#4ADE80)
                   // > 33% a 66% -> amarelo/laranja (#EF9F27)
                   // > 66% -> vermelho (#E24B4A)
                   let corBg = 'var(--secondary)';
                   let corTexto = 'var(--muted-foreground)';
                   
                   if (temGasto) {
                     if (pct <= 0.33) {
                       corBg = '#3B6D11'; // Fundo verde escuro (ou #4ADE80 com opacidade)
                       corTexto = '#4ADE80';
                     } else if (pct <= 0.66) {
                       corBg = '#854F0B'; // Fundo laranja escuro
                       corTexto = '#EF9F27';
                     } else {
                       corBg = '#A32D2D'; // Fundo vermelho escuro
                       corTexto = '#E24B4A';
                     }
                   }

                   const isActive = diaAtivo === celula.dia;

                   return (
                     <Tooltip key={`day-${celula.dia}`}>
                       <TooltipTrigger asChild>
                         <div
                           onClick={() => temGasto && onDiaSelect?.(celula.dia)}
                           className={`w-8 h-8 rounded-sm flex items-center justify-center text-[10px] sm:text-xs transition-transform relative ${celula.futuro ? 'opacity-20 cursor-not-allowed pointer-events-none' : temGasto ? 'hover:scale-110 cursor-pointer' : 'cursor-default pointer-events-none'} ${isHoje ? 'ring-1 ring-foreground ring-offset-1 ring-offset-card' : ''} ${isActive && !celula.futuro ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-110 z-10' : ''}`}
                           style={{
                             backgroundColor: temGasto ? corBg : 'var(--secondary)',
                             color: temGasto ? corTexto : 'var(--muted-foreground)',
                             opacity: (diaAtivo && !isActive) ? 0.4 : 1,
                           }}
                         >
                           <span className={temGasto && pct > 0.66 ? 'font-bold' : 'font-medium'}>
                             {celula.dia}
                           </span>
                         </div>
                       </TooltipTrigger>
                       <TooltipContent sideOffset={6} className="bg-foreground text-background border-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-3 rounded-lg dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                         <div className="text-center">
                           <p className="font-semibold text-background text-sm">
                             Dia {celula.dia}
                           </p>
                           <p className="text-muted-foreground/80 text-xs mt-1">
                             {celula.total > 0 ? fmt(celula.total) : 'Sem gastos registrados'}
                           </p>
                           {temGasto && (
                             <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-widest font-bold">
                               {pct <= 0.33 ? 'Gasto Baixo' : pct <= 0.66 ? 'Gasto Médio' : 'Gasto Alto'}
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
             <div className="flex items-center justify-center gap-3 mt-4 text-[9px] text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-secondary"></div> Nenhum</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#3B6D11]"></div> Baixo</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#854F0B]"></div> Médio</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#A32D2D]"></div> Alto</span>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
