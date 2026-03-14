'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Lightbulb, TrendingUp, PiggyBank, Shield, Target } from 'lucide-react';
import type { Sugestao } from '@/lib/types';

interface SugestoesPanelProps {
  sugestoes: Sugestao[];
}

const iconePorCategoria = {
  economia: PiggyBank,
  investimento: TrendingUp,
  seguranca: Shield,
  meta: Target,
  geral: Lightbulb,
};

const coresPorCategoria = {
  economia: '#3B6D11',
  investimento: '#D4537E',
  seguranca: '#4A90A4',
  meta: '#854F0B',
  geral: '#7B5EA7',
};

export function SugestoesPanel({ sugestoes }: SugestoesPanelProps) {
  if (sugestoes.length === 0) {
    return null;
  }

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="label-uppercase text-muted-foreground">
          Sugestões Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sugestoes.slice(0, 4).map((sugestao) => {
          const Icone = iconePorCategoria[sugestao.categoria] || Lightbulb;
          const cor = coresPorCategoria[sugestao.categoria] || coresPorCategoria.geral;

          return (
            <div
              key={sugestao.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border card-hover"
            >
              {/* Barra de cor */}
              <div 
                className="category-bar self-stretch" 
                style={{ backgroundColor: cor }}
              />
              
              <div className="p-1.5 rounded-md" style={{ backgroundColor: `${cor}20` }}>
                <Icone className="h-4 w-4" style={{ color: cor }} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{sugestao.titulo}</p>
                  {sugestao.impacto && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-[10px] shrink-0',
                        sugestao.impacto === 'Alto' && 'border-primary/50 text-primary',
                        sugestao.impacto === 'Médio' && 'border-[#854F0B]/50 text-[#EF9F27]',
                        sugestao.impacto === 'Baixo' && 'border-muted-foreground/50'
                      )}
                    >
                      {sugestao.impacto}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{sugestao.descricao}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
