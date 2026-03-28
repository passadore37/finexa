'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Lightbulb, TrendingUp, PiggyBank, Shield, Target, Sparkles, ChevronRight } from 'lucide-react';
import type { Sugestao } from '@/lib/types';

interface SugestoesPanelProps {
  sugestoes: Sugestao[];
}

const iconePorCategoria: Record<string, any> = {
  economia: PiggyBank,
  investimento: TrendingUp,
  seguranca: Shield,
  meta: Target,
  geral: Lightbulb,
};

const coresPorCategoria: Record<string, string> = {
  economia: '#37cc94',
  investimento: '#ff64ca',
  seguranca: '#82a1fd',
  meta: '#EF9F27',
  geral: '#5330ff',
};

export function SugestoesPanel({ sugestoes }: SugestoesPanelProps) {
  if (sugestoes.length === 0) {
    return (
      <Card className="flex flex-col justify-center items-center h-full min-h-[350px] bg-white/40 border-white/50">
        <Sparkles className="h-10 w-10 text-black/5 mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/20">Sem novas sugestões</span>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col w-full relative overflow-hidden group">
      <CardHeader className="pb-4 shrink-0 z-10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#5330ff]/10 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-[#5330ff]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-1">Insights</p>
            <CardTitle className="text-lg font-black text-[#08080f] tracking-tighter">Sugestões de IA</CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pb-8">
        {sugestoes.slice(0, 4).map((sugestao, i) => {
          const Icone = iconePorCategoria[sugestao.categoria] || Lightbulb;
          const cor = coresPorCategoria[sugestao.categoria] || coresPorCategoria.geral;

          return (
            <div
              key={sugestao.id}
              className="group/item relative flex items-start gap-4 p-4 rounded-2xl bg-black/[0.02] border border-transparent transition-all duration-300 hover:bg-white hover:border-[#08080f]/5 hover:shadow-xl hover:shadow-[#08080f]/5 hover:scale-[1.02]"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110" 
                style={{ backgroundColor: `${cor}15` }}
              >
                <Icone className="h-5 w-5" style={{ color: cor }} strokeWidth={2.5} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-black text-[#08080f] tracking-tighter leading-tight">{sugestao.titulo}</p>
                  {sugestao.impacto && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-none shadow-sm',
                        sugestao.impacto === 'Alto' && 'bg-[#5330ff] text-white',
                        sugestao.impacto === 'Médio' && 'bg-[#EF9F27] text-white',
                        sugestao.impacto === 'Baixo' && 'bg-black/5 text-[#08080f]/40'
                      )}
                    >
                      {sugestao.impacto}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] font-bold text-[#08080f]/50 leading-relaxed group-hover/item:text-[#08080f]/70">
                  {sugestao.descricao}
                </p>
              </div>
              
              <div className="self-center translate-x-4 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all duration-300">
                 <ChevronRight className="h-4 w-4 text-[#5330ff]" />
              </div>

              {/* Barra de impacto visual na borda */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full opacity-40 group-hover/item:opacity-100 transition-all duration-500" style={{ backgroundColor: cor }} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
