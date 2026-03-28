'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowRight, BarChart3, Settings2, Zap } from 'lucide-react';
import type { DadosProjecaoBar } from '@/lib/types';

interface ProjecaoBarProps {
  dados: DadosProjecaoBar;
  onAjustarLimite?: (valor: number) => void;
  perfilGeral?: boolean;
  fixas?: number;
}

export function ProjecaoBar({ dados, onAjustarLimite, perfilGeral, fixas = 0 }: ProjecaoBarProps) {
  const router = useRouter();
  const { gastoAtual, gastoAtualComFixas, projecao, limite: limiteRaw } = dados;
  const limite = typeof limiteRaw === 'number' && !isNaN(limiteRaw) ? limiteRaw : 1000;
  const valorFixas = fixas > 0 ? fixas : Math.max(0, (gastoAtualComFixas ?? gastoAtual) - gastoAtual);
  const projecaoComFixas = projecao + valorFixas;

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(limite);

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v);

  const fmtCompact = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
    }).format(v);

  const handleAjustarLimiteClick = () => {
    setInputValue(limite);
    setOpen(true);
  };

  const limiteSafe = limite > 0 ? limite : 1;
  const totalGastoRelativo = (gastoAtualComFixas ?? gastoAtual);
  const pctGasto = Math.min((totalGastoRelativo / limiteSafe) * 100, 100);
  const pctProjecao = Math.min((projecaoComFixas / limiteSafe) * 100, 110);
  const overflow = projecaoComFixas > limiteSafe;

  const getCorGasto = () => {
    if (pctGasto >= 90) return '#ff64ca';
    if (pctGasto >= 70) return '#EF9F27';
    return '#5330ff';
  };

  const corGasto = getCorGasto();

  return (
    <Card className="h-full flex flex-col w-full relative overflow-hidden group">
      <CardHeader className="pb-4 shrink-0 z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#5330ff]/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-[#5330ff]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-1">Expectativa</p>
            <CardTitle className="text-lg font-black text-[#08080f] tracking-tighter">Projeção Mensal</CardTitle>
          </div>
        </div>
        {!perfilGeral && (
          <button
            onClick={handleAjustarLimiteClick}
            className="p-2 rounded-xl bg-black/[0.03] text-[#08080f]/20 hover:text-[#08080f]/40 transition-all duration-300"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-8 pb-8">
        {/* Barra de Projeção Premium */}
        <div className="space-y-4">
          <div className="flex justify-between items-end px-1">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#08080f] uppercase tracking-widest">Ritmo Atual</span>
                <div className="h-1 w-8 rounded-full bg-black/5 overflow-hidden">
                   <div className="h-full bg-black/20 animate-pulse" style={{ width: '40%' }} />
                </div>
             </div>
             <p className="text-[10px] font-black text-[#08080f]/20 uppercase tracking-widest">Limite: {fmt(limite)}</p>
          </div>

          <div className="relative h-12 w-full">
            {/* Background da barra */}
            <div className="absolute inset-0 rounded-2xl bg-black/[0.03] border border-black/[0.05]" />
            
            {/* Camada de Projeção (Pontilhada/Transparente) */}
            {projecaoComFixas > totalGastoRelativo && (
              <div
                className="absolute top-0 bottom-0 left-0 rounded-2xl transition-all duration-1000 shadow-inner"
                style={{
                  width: `${Math.min(pctProjecao, 100)}%`,
                  background: overflow
                    ? 'repeating-linear-gradient(45deg, rgba(255,100,202,0.1), rgba(255,100,202,0.1) 8px, transparent 8px, transparent 16px)'
                    : `${corGasto}15`,
                  borderRight: `2px dashed ${overflow ? '#ff64ca' : corGasto}40`,
                }}
              />
            )}

            {/* Barra de Gasto Real */}
            <div
              className="absolute top-0 bottom-0 left-0 rounded-2xl transition-all duration-1000 flex items-center justify-end pr-4 shadow-xl"
              style={{
                width: `${pctGasto}%`,
                background: `linear-gradient(90deg, ${corGasto}, ${corGasto}dd)`,
                minWidth: pctGasto > 5 ? '20px' : '0',
                boxShadow: `0 8px 24px -6px ${corGasto}40`,
              }}
            >
              {pctGasto > 10 && (
                <span className="text-[10px] font-black text-white tabular-nums tracking-tighter">
                  {Math.round(pctGasto)}%
                </span>
              )}
            </div>

            {/* Marcador de Projeção */}
            <div
              className="absolute top-[-8px] flex flex-col items-center transition-all duration-1000 z-10"
              style={{ left: `${Math.min(pctProjecao, 100)}%` }}
            >
               <div className={`w-1 h-28 ${overflow ? 'bg-[#ff64ca]' : 'bg-[#08080f]/10'} rounded-full blur-[0.5px]`} />
               <div className={`px-2 py-1 rounded-lg ${overflow ? 'bg-[#ff64ca]' : 'bg-[#08080f]'} text-white text-[8px] font-black uppercase tracking-widest shadow-xl -mt-2 transition-transform hover:scale-110 cursor-default`}>
                 PROJEÇÃO
               </div>
            </div>
          </div>

          <div className="flex justify-between text-[8px] font-black text-[#08080f]/20 px-1 tracking-[0.2em]">
            <span>INÍCIO</span>
            <span>25%</span>
            <span>MEIO</span>
            <span>75%</span>
            <span className={overflow ? 'text-[#ff64ca]' : ''}>LIMITE</span>
          </div>
        </div>

        {/* Resumo Boxes Premium */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-3xl bg-black/[0.02] border border-black/[0.05] transition-all hover:bg-white hover:shadow-xl hover:shadow-[#08080f]/5">
            <p className="text-[9px] font-black text-[#08080f]/20 uppercase tracking-[0.2em] mb-2">Já Gasto</p>
            <p className="text-2xl font-black tabular-nums tracking-tighter" style={{ color: corGasto }}>
              {fmt(gastoAtual)}
            </p>
            {valorFixas > 0 && (
              <p className="text-[10px] font-bold text-[#08080f]/40 mt-1 uppercase tracking-tight">+ {fmt(valorFixas)} Fixas</p>
            )}
          </div>

          <div className={cn(
            'p-4 rounded-3xl border transition-all hover:shadow-xl hover:shadow-[#08080f]/5',
            overflow ? 'bg-[#ff64ca]/5 border-[#ff64ca]/20' : 'bg-black/[0.02] border-black/[0.05] hover:bg-white'
          )}>
            <p className="text-[9px] font-black text-[#08080f]/20 uppercase tracking-[0.2em] mb-2">Expectativa</p>
            <p className={cn(
              'text-2xl font-black tabular-nums tracking-tighter',
              overflow ? 'text-[#ff64ca]' : 'text-[#08080f]'
            )}>
              {fmt(projecaoComFixas)}
            </p>
            <p className="text-[10px] font-bold text-[#08080f]/40 mt-1 uppercase tracking-tight">
              {limite > 0
                ? overflow
                  ? `${fmt(projecaoComFixas - limite)} EXCEDIDO`
                  : `${fmt(limite - projecaoComFixas)} MARGEM`
                : 'PONTO DE EQUILÍBRIO'}
            </p>
          </div>
        </div>

        {overflow && (
          <div className="p-4 rounded-2xl bg-[#ff64ca]/10 border border-[#ff64ca]/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-8 h-8 rounded-xl bg-[#ff64ca] flex items-center justify-center shadow-lg shadow-[#ff64ca]/20">
               <Zap className="h-4 w-4 text-white" />
            </div>
            <p className="text-[11px] font-bold text-[#ff64ca] leading-tight">
              Atenção! No ritmo atual, você ultrapassará o limite em <span className="font-black underline decoration-2">{fmt(projecaoComFixas - limite)}</span>.
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[2.5rem] p-8 border-none bg-white/95 backdrop-blur-2xl shadow-2xl">
          <DialogHeader className="mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#5330ff]/10 flex items-center justify-center mb-4">
               <Settings2 className="h-6 w-6 text-[#5330ff]" />
            </div>
            <DialogTitle className="text-2xl font-black text-[#08080f] tracking-tighter">CONFIGURAR LIMITE</DialogTitle>
            <DialogDescription className="text-sm font-bold text-[#08080f]/40 uppercase tracking-widest mt-2">
              Defina sua meta de gastos para este mês.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mb-8">
            <div className="p-6 rounded-3xl bg-black/[0.03] border border-black/[0.05]">
               <p className="text-[10px] font-black text-[#08080f]/30 uppercase tracking-[0.2em] mb-3">Valor Mensal (BRL)</p>
               <Input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(Number(e.target.value))}
                  min={1}
                  step={100}
                  className="bg-transparent border-none text-4xl font-black tracking-tighter tabular-nums h-auto p-0 focus-visible:ring-0"
                />
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const val = Number(inputValue);
                if (!Number.isNaN(val) && val > 0) {
                  onAjustarLimite?.(val);
                }
                setOpen(false);
              }}
              className="bg-[#5330ff] hover:bg-[#5330ff]/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-[#5330ff]/20"
            >
              Aplicar Limite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
