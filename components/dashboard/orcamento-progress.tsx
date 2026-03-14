'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DespesaPorCategoria } from '@/lib/types';

interface OrcamentoProgressProps {
  categorias: DespesaPorCategoria[];
  orcamentos: Record<string, number>;
}

const CORES_CATEGORIA: Record<string, string> = {
  Alimentação: '#D4537E',
  Moradia: '#4A90A4',
  Transporte: '#7B5EA7',
  Saúde: '#3B6D11',
  Lazer: '#854F0B',
  Educação: '#2D6B9A',
  Casa: '#4A90A4',
  Outros: '#666666',
};

export function OrcamentoProgress({ categorias, orcamentos }: OrcamentoProgressProps) {
  const categoriasComOrcamento = categorias
    .filter((cat) => orcamentos[cat.categoria])
    .map((cat) => ({
      ...cat,
      orcamento: orcamentos[cat.categoria],
      percentual: (cat.valor / orcamentos[cat.categoria]) * 100,
    }))
    .sort((a, b) => b.percentual - a.percentual);

  if (categoriasComOrcamento.length === 0) {
    return null;
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const getCorBarra = (percentual: number, categoria: string) => {
    if (percentual >= 100) return '#E24B4A';
    if (percentual >= 80) return '#EF9F27';
    return CORES_CATEGORIA[categoria] || '#D4537E';
  };

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="label-uppercase text-muted-foreground">
          Orçamento por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoriasComOrcamento.slice(0, 6).map((cat) => {
          const cor = getCorBarra(cat.percentual, cat.categoria);
          
          return (
            <div key={cat.categoria} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CORES_CATEGORIA[cat.categoria] || '#D4537E' }}
                  />
                  <span className="text-sm text-foreground">{cat.categoria}</span>
                </div>
                <span className={cn(
                  'text-xs font-medium tabular-nums',
                  cat.percentual >= 100 ? 'text-[#E24B4A]' : 
                  cat.percentual >= 80 ? 'text-[#EF9F27]' : 'text-muted-foreground'
                )}>
                  {cat.percentual.toFixed(0)}%
                </span>
              </div>
              
              {/* Custom progress bar */}
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(cat.percentual, 100)}%`,
                    backgroundColor: cor,
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="tabular-nums">{formatarMoeda(cat.valor)}</span>
                <span className="tabular-nums">de {formatarMoeda(cat.orcamento)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
