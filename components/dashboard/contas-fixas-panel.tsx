'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Plus } from 'lucide-react';
import Link from 'next/link';
import type { ContaFixaConfig } from '@/lib/types';

interface ContasFixasPanelProps {
  contasFixas: ContaFixaConfig[];
  totalMensal: number;
}

export function ContasFixasPanel({ contasFixas, totalMensal }: ContasFixasPanelProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  if (contasFixas.length === 0) {
    return (
      <Card className="border border-border bg-card card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="label-uppercase text-muted-foreground">
            Despesas Fixas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Nenhuma despesa fixa configurada.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure no Planejamento para ter controle total.
              </p>
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <p><strong className="text-foreground">💡 Como funciona:</strong> Contas fixas são registradas automaticamente como transações recorrentes a cada mês no histórico.</p>
          </div>

          <Link href="/planejamento">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Despesas
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card card-hover">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="label-uppercase text-muted-foreground">
          Despesas Fixas
        </CardTitle>
        <Link href="/planejamento">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs h-7 px-2"
          >
            Editar
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* KPI Total Mensal */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-uppercase text-muted-foreground mb-1">
                Total Mensal em Fixas
              </p>
              <p className="text-3xl font-medium tabular-nums text-foreground">
                {formatarMoeda(totalMensal)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Comprometidas todos os meses
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <Lock className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Lista de Contas Fixas */}
        <div className="flex-1 overflow-y-auto max-h-[20rem] space-y-2 custom-scrollbar pr-1">
          {contasFixas.map((conta, index) => (
            <div
              key={conta.id || index}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-border transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {conta.descricao}
                </p>
                <p className="text-xs text-muted-foreground">
                  {conta.categoria || 'Despesas Fixas'} · Recorrente
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge 
                  variant="secondary"
                  className="text-xs font-medium shrink-0"
                >
                  {formatarMoeda(conta.valor)}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {contasFixas.length > 8 && (
          <p className="text-xs text-muted-foreground text-center pt-3 mt-3 border-t border-border">
            Mostrando {Math.min(contasFixas.length, 8)} de {contasFixas.length} contas
          </p>
        )}

        {/* Info badge */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
          <p><strong className="text-foreground">💡 Dica:</strong> Essas contas são registradas automaticamente como transações recorrentes a cada mês no histórico.</p>
        </div>

        <Link href="/planejamento" className="w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar Conta
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
