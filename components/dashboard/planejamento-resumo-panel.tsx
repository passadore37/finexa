'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Edit2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PlanejamentoResumoPanelProps {
  salarioMembro0: number;
  salarioMembro1: number;
  percentualInvestimento: number;
  limiteMensal: number;
  reservaEmergencia: number;
  plano: 'individual' | 'casal';
  nomesMembros?: { membro0: string; membro1: string };
}

export function PlanejamentoResumoPanel({
  salarioMembro0,
  salarioMembro1,
  percentualInvestimento,
  limiteMensal,
  reservaEmergencia,
  plano,
  nomesMembros = { membro0: 'Membro 1', membro1: 'Membro 2' },
}: PlanejamentoResumoPanelProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const salarioTotal = salarioMembro0 + salarioMembro1;
  const temSalariosPreenchidos = salarioMembro0 > 0 || salarioMembro1 > 0;

  if (!temSalariosPreenchidos) {
    return (
      <Card className="border border-border bg-card card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="label-uppercase text-muted-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Planejamento
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Salário não configurado
              </p>
              <p className="text-xs text-amber-800 mt-1">
                Preencha seu salário para ativar os indicadores financeiros do dashboard.
              </p>
            </div>
          </div>
          <Link href="/planejamento">
            <Button className="w-full gap-2">
              <Edit2 className="h-4 w-4" />
              Configurar Agora
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="label-uppercase text-muted-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Planejamento
        </CardTitle>
        <Link href="/planejamento">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7 px-2"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Salários */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Receitas Mensais</h3>
          
          {/* Membro 0 */}
          {salarioMembro0 > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {nomesMembros.membro0}
                </p>
                <p className="text-xs text-muted-foreground">Salário mensal</p>
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                {formatarMoeda(salarioMembro0)}
              </Badge>
            </div>
          )}

          {/* Membro 1 */}
          {plano === 'casal' && salarioMembro1 > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {nomesMembros.membro1}
                </p>
                <p className="text-xs text-muted-foreground">Salário mensal</p>
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                {formatarMoeda(salarioMembro1)}
              </Badge>
            </div>
          )}

          {/* Total */}
          {salarioTotal > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">
                  Total da Renda
                </p>
                <p className="text-xs text-muted-foreground">Combinado</p>
              </div>
              <Badge className="text-xs font-bold bg-primary text-primary-foreground">
                {formatarMoeda(salarioTotal)}
              </Badge>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-3" />

        {/* Metas e Limites */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Metas</h3>

          {limiteMensal > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Limite Mensal</p>
                <p className="text-xs text-muted-foreground">Teto de gastos</p>
              </div>
              <Badge variant="outline" className="text-xs font-medium">
                {formatarMoeda(limiteMensal)}
              </Badge>
            </div>
          )}

          {reservaEmergencia > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Fundo de Emergência</p>
                <p className="text-xs text-muted-foreground">Alvo acumulado</p>
              </div>
              <Badge variant="outline" className="text-xs font-medium">
                {formatarMoeda(reservaEmergencia)}
              </Badge>
            </div>
          )}

          {percentualInvestimento > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Percentual Investimento</p>
                <p className="text-xs text-muted-foreground">% da renda</p>
              </div>
              <Badge variant="outline" className="text-xs font-medium">
                {percentualInvestimento}%
              </Badge>
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground mt-2">
          <p><strong className="text-foreground">ℹ️ Dica:</strong> Todos os cálculos do dashboard usam esses valores como base. Atualize conforme necessário.</p>
        </div>
      </CardContent>
    </Card>
  );
}
