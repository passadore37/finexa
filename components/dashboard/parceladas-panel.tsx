'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CreditCard, TrendingDown } from 'lucide-react';
import type { Parcelada } from '@/lib/types';

interface ParceladasPanelProps {
  parceladas: Parcelada[];
  comprometimentoTotal: number;
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

export function ParceladasPanel({ parceladas, comprometimentoTotal }: ParceladasPanelProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  if (parceladas.length === 0) {
    return (
      <Card className="border border-border bg-card card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="label-uppercase text-muted-foreground">
            Parceladas
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[32rem] overflow-y-auto">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Nenhuma compra parcelada ativa.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="label-uppercase text-muted-foreground">
          Parcelas Ativas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* KPI de Dívida Futura (fixed) */}
        <div className="p-4 rounded-lg bg-secondary/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-uppercase text-muted-foreground mb-1">
                Dívida Futura Comprometida
              </p>
              <p className="text-3xl font-medium tabular-nums text-foreground animate-number">
                {formatarMoeda(comprometimentoTotal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total em parcelas futuras
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <TrendingDown className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Lista de Parcelas (scroll dentro do card) */}
        <div className="flex-1 overflow-y-auto max-h-[22rem] space-y-3 custom-scrollbar pr-1">
          {parceladas.map((parcelada, index) => {
            const cor = CORES_CATEGORIA[parcelada.categoria] || CORES_CATEGORIA.Outros;
            const progressPercent = (parcelada.parcelaAtual / parcelada.totalParcelas) * 100;

            return (
              <div
                key={`${parcelada.descricao}-${index}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border card-hover"
              >
                {/* Barra de cor da categoria */}
                <div 
                  className="category-bar self-stretch" 
                  style={{ backgroundColor: cor }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-foreground truncate">
                        {parcelada.descricao}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {parcelada.categoria}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-[10px] shrink-0 border-muted-foreground/30"
                    >
                      Termina {parcelada.mesTermino}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <Progress 
                      value={progressPercent} 
                      className="h-2"
                      style={{ 
                        '--progress-background': cor,
                      } as React.CSSProperties}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {parcelada.parcelaAtual}/{parcelada.totalParcelas} parcelas
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium tabular-nums">
                        {formatarMoeda(parcelada.valorParcela)}/mês
                      </span>
                      <span className="text-muted-foreground">
                        (Restam {formatarMoeda(parcelada.comprometimentoFuturo)})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {parceladas.length > 10 && (
          <p className="text-xs text-muted-foreground text-center pt-3 mt-3 border-t border-border">
            +{parceladas.length - 10} parceladas adicionais
          </p>
        )}
      </CardContent>
    </Card>
  );
}
