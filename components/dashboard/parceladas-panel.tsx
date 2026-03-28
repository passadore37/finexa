'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CreditCard, TrendingDown, CalendarClock, ChevronRight } from 'lucide-react';
import type { Parcelada } from '@/lib/types';

interface ParceladasPanelProps {
  parceladas: Parcelada[];
  comprometimentoTotal: number;
}

const CORES_CATEGORIA: Record<string, string> = {
  Alimentação: '#ff64ca',
  Moradia: '#5330ff',
  Transporte: '#82a1fd',
  Saúde: '#e24b4a',
  Lazer: '#ffa857',
  Educação: '#378add',
  Casa: '#01b695',
  Outros: '#888780',
};

export function ParceladasPanel({ parceladas, comprometimentoTotal }: ParceladasPanelProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  if (parceladas.length === 0) {
    return (
      <Card className="flex flex-col justify-center items-center h-full min-h-[350px] bg-white/40 border-white/50">
        <CreditCard className="h-10 w-10 text-black/5 mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20">Sem parcelamentos ativos</span>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col w-full relative overflow-hidden group">
      <CardHeader className="pb-4 shrink-0 z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#5330ff]/10 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-[#5330ff]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-1">Dívidas</p>
            <CardTitle className="text-lg font-black text-[#08080f] tracking-tighter">Parcelamentos</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-6 pb-8">
        {/* KPI de Dívida Futura Premium */}
        <div className="p-6 rounded-[2rem] bg-black/[0.03] border border-black/[0.05] relative overflow-hidden transition-all duration-500 hover:bg-black/[0.05]">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black text-[#08080f]/30 uppercase tracking-[0.2em] mb-2">
                Comprometimento Total
              </p>
              <p className="text-4xl font-black tabular-nums text-[#08080f] tracking-tighter leading-none pulse-subtle">
                {formatarMoeda(comprometimentoTotal)}
              </p>
              <div className="flex items-center gap-2 mt-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#ff64ca] animate-pulse" />
                 <p className="text-[10px] font-bold text-[#08080f]/40 uppercase tracking-widest">
                   Total em parcelas remanescentes
                 </p>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#5330ff] shadow-lg shadow-[#5330ff]/20">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Lista de Parceladas Premium */}
        <div className="flex-1 space-y-3 pr-1 custom-scrollbar">
          {parceladas.map((parcelada, index) => {
            const cor = CORES_CATEGORIA[parcelada.categoria] || CORES_CATEGORIA.Outros;
            const progressPercent = (parcelada.parcelaAtual / parcelada.totalParcelas) * 100;

            return (
              <div
                key={`${parcelada.descricao}-${index}`}
                className="group/item flex items-center gap-4 p-4 rounded-2xl bg-black/[0.02] border border-transparent transition-all duration-300 hover:bg-white hover:border-[#08080f]/5 hover:shadow-xl hover:shadow-[#08080f]/5"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110" 
                  style={{ backgroundColor: `${cor}15` }}
                >
                  <CalendarClock className="h-5 w-5" style={{ color: cor }} strokeWidth={2.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-black text-[#08080f] tracking-tighter truncate leading-tight">
                        {parcelada.descricao}
                      </p>
                      <p className="text-[10px] font-bold text-[#08080f]/30 uppercase tracking-widest mt-0.5">
                        {parcelada.categoria}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/5 border-none text-black/40"
                    >
                      Até {parcelada.mesTermino}
                    </Badge>
                  </div>

                  {/* Progress bar premium */}
                  <div className="space-y-1.5">
                    <div className="h-2 rounded-full bg-black/5 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${progressPercent}%`,
                          backgroundColor: cor,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-[#08080f]/40 uppercase tracking-widest">
                        {parcelada.parcelaAtual} / {parcelada.totalParcelas} PARCELAS
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#08080f] tracking-tighter tabular-nums">
                          {formatarMoeda(parcelada.valorParcela)}
                        </span>
                        <span className="text-[10px] font-bold text-[#08080f]/20 uppercase tracking-tighter">
                          /mês
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="self-center opacity-0 group-hover/item:opacity-100 transition-all duration-300 translate-x-2 group-hover/item:translate-x-0">
                   <ChevronRight className="h-4 w-4 text-[#5330ff]" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
