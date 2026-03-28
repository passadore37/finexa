'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Settings, BellRing } from 'lucide-react';
import { useState } from 'react';
import type { Alerta } from '@/lib/types';

interface AlertasPanelProps {
  alertas: Alerta[];
  gastoAtual?: number;
  limite?: number;
  projecao?: number;
  despesasPorCategoria?: Array<{ categoria: string; valor: number; percentual: number }>;
}

const iconePorTipo = {
  critico: AlertTriangle,
  atencao: AlertCircle,
  info: Info,
  sucesso: CheckCircle,
};

const coresPorTipo = {
  critico: { bg: 'bg-[#ff64ca]/10', border: 'border-[#ff64ca]/20', icon: 'text-[#ff64ca]', text: 'text-[#ff64ca]', dot: 'bg-[#ff64ca]' },
  atencao: { bg: 'bg-[#EF9F27]/10', border: 'border-[#EF9F27]/20', icon: 'text-[#EF9F27]', text: 'text-[#EF9F27]', dot: 'bg-[#EF9F27]' },
  info: { bg: 'bg-[#5330ff]/10', border: 'border-[#5330ff]/20', icon: 'text-[#5330ff]', text: 'text-[#5330ff]', dot: 'bg-[#5330ff]' },
  sucesso: { bg: 'bg-[#37cc94]/10', border: 'border-[#37cc94]/20', icon: 'text-[#37cc94]', text: 'text-[#37cc94]', dot: 'bg-[#37cc94]' },
};

export function AlertasPanel({ alertas }: AlertasPanelProps) {
  const [configurando, setConfigurando] = useState(false);

  const alertasOrdenados = [...alertas].sort((a, b) => {
    const ordem = { critico: 0, atencao: 1, info: 2, sucesso: 3 };
    return ordem[a.tipo] - ordem[b.tipo];
  });

  return (
    <Card className="h-full flex flex-col w-full relative overflow-hidden group">
      <CardHeader className="pb-4 shrink-0 z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#ff64ca]/10 flex items-center justify-center">
            <BellRing className="h-4 w-4 text-[#ff64ca]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-1">Notificações</p>
            <CardTitle className="text-lg font-black text-[#08080f] tracking-tighter">Alertas Ativos</CardTitle>
          </div>
        </div>
        <button
          onClick={() => setConfigurando(!configurando)}
          className={`p-2 rounded-xl transition-all duration-300 ${configurando ? 'bg-[#5330ff] text-white' : 'bg-black/[0.03] text-[#08080f]/20 hover:text-[#08080f]/40'}`}
        >
          <Settings className="h-4 w-4" />
        </button>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-8">
        {alertas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-[2rem] bg-[#37cc94]/5 border border-[#37cc94]/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
               <CheckCircle className="h-8 w-8 text-[#37cc94]/40" />
            </div>
            <p className="text-[10px] font-black text-[#08080f]/40 uppercase tracking-[0.2em]">Céu de Almirante</p>
            <p className="text-sm font-bold text-[#08080f]/60 tracking-tight mt-1">Tudo em perfeita ordem!</p>
          </div>
        ) : (
          alertasOrdenados.map((alerta) => {
            const Icone = iconePorTipo[alerta.tipo];
            const cores = coresPorTipo[alerta.tipo];
            const isPulsing = alerta.tipo === 'critico' || alerta.tipo === 'atencao';
            
            return (
              <div 
                key={alerta.id} 
                className={cn(
                  'flex items-start gap-4 p-4 rounded-2xl border transition-all duration-500 hover:scale-[1.01]', 
                  cores.bg, 
                  cores.border
                )}
              >
                <div className="relative flex-shrink-0">
                  <div className={cn('p-2 rounded-xl bg-white shadow-sm', cores.text)}>
                    <Icone className="h-4 w-4" strokeWidth={3} />
                  </div>
                  {isPulsing && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', cores.dot)}></span>
                      <span className={cn('relative inline-flex rounded-full h-3 w-3', cores.dot)}></span>
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                     <p className={cn('text-[9px] font-black uppercase tracking-[0.2em]', cores.text)}>
                       {alerta.tipo === 'critico' ? 'Urgent' : alerta.tipo}
                     </p>
                  </div>
                  <p className="text-sm font-black text-[#08080f] tracking-tighter leading-tight mb-1">{alerta.titulo}</p>
                  <p className="text-[11px] font-bold text-[#08080f]/50 leading-relaxed truncate group-hover:whitespace-normal">
                    {alerta.mensagem}
                  </p>
                  {alerta.acao && (
                    <div className="mt-3 flex items-center gap-2">
                       <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white border shadow-xs', cores.text)}>
                         {alerta.acao}
                       </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
