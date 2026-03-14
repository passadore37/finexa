'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  PiggyBank,
  Receipt,
  Wallet,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import type { MetodologiaOrcamento, DadosSemana } from '@/lib/types';

interface OrcamentoSemanalProps {
  metodologia: MetodologiaOrcamento;
}

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatarData(data: Date): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });
}

function SemanaCard({ semana, isAtual }: { semana: DadosSemana; isAtual: boolean }) {
  const percentual = Math.min(semana.percentualGasto, 100);
  const excedeu = semana.percentualGasto > 100;
  const percentualExcedido = semana.percentualGasto - 100;
  
  // Cores baseadas no status e gasto
  let corBarra = '#3B6D11'; // Verde - ok
  let corFundo = 'rgba(59, 109, 17, 0.2)';
  
  if (semana.percentualGasto > 80 && semana.percentualGasto <= 100) {
    corBarra = '#D4A017'; // Âmbar - atenção
    corFundo = 'rgba(212, 160, 23, 0.2)';
  } else if (excedeu) {
    corBarra = '#A32D2D'; // Vermelho - excedeu
    corFundo = 'rgba(163, 45, 45, 0.2)';
  }
  
  if (semana.status === 'futuro') {
    corBarra = '#4B5563'; // Cinza para futuro
    corFundo = 'rgba(75, 85, 99, 0.2)';
  }

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border transition-all',
        isAtual
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card/50',
        semana.status === 'futuro' && 'opacity-60'
      )}
    >
      {/* Badge de semana atual */}
      {isAtual && (
        <div className="absolute -top-2 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full">
          ATUAL
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Semana {semana.numero}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatarData(semana.inicio)} - {formatarData(semana.fim)}
          </span>
        </div>
        {semana.status === 'passado' && (
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        )}
        {semana.status === 'atual' && (
          <Clock className="h-4 w-4 text-primary" />
        )}
        {semana.status === 'futuro' && (
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      
      {/* Valores */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-[10px] text-muted-foreground label-uppercase">Orçamento</p>
          <p className="text-sm font-medium text-foreground tabular-nums">
            {formatarMoeda(semana.orcamento)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground label-uppercase">Gasto</p>
          <p className={cn(
            'text-sm font-medium tabular-nums',
            excedeu ? 'text-[#E24B4A]' : 'text-foreground'
          )}>
            {formatarMoeda(semana.gasto)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground label-uppercase">Disponível</p>
          <p className={cn(
            'text-sm font-medium tabular-nums',
            semana.disponivel < 0 ? 'text-[#E24B4A]' : 'text-[#4ADE80]'
          )}>
            {formatarMoeda(semana.disponivel)}
          </p>
        </div>
      </div>
      
      {/* Barra de progresso */}
      <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: corFundo }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentual}%`,
            backgroundColor: corBarra,
          }}
        />
        {/* Indicador de excesso */}
        {excedeu && (
          <div
            className="absolute top-0 h-full rounded-r-full"
            style={{
              left: '100%',
              width: `${Math.min(percentualExcedido, 30)}%`,
              backgroundColor: '#E24B4A',
              marginLeft: '-2px',
            }}
          />
        )}
      </div>
      
      {/* Percentual */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-muted-foreground">
          {semana.status === 'futuro' ? 'Aguardando' : `${semana.percentualGasto.toFixed(0)}% utilizado`}
        </span>
        {excedeu && (
          <span className="text-[10px] text-[#E24B4A] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Excedeu {percentualExcedido.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function OrcamentoSemanal({ metodologia }: OrcamentoSemanalProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Metodologia de Orçamento Mensal
        </CardTitle>
        <p className="text-[10px] text-muted-foreground label-uppercase mt-1">
          Salário - Investimento - Contas Fixas = Gastos Semanais
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo da metodologia */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Salário */}
          <div className="p-3 rounded-lg bg-secondary/50 border-l-2 border-primary">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground label-uppercase">Salário</span>
            </div>
            <p className="text-lg font-semibold text-foreground tabular-nums">
              {formatarMoeda(metodologia.salarioMes)}
            </p>
          </div>
          
          {/* Investimento */}
          <div className="p-3 rounded-lg bg-secondary/50 border-l-2 border-[#3B6D11]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-[#4ADE80]" />
              <span className="text-[10px] text-muted-foreground label-uppercase">
                Investir ({metodologia.percentualInvestimento}%)
              </span>
            </div>
            <p className="text-lg font-semibold text-[#4ADE80] tabular-nums">
              {formatarMoeda(metodologia.investimento)}
            </p>
          </div>
          
          {/* Contas Fixas */}
          <div className="p-3 rounded-lg bg-secondary/50 border-l-2 border-[#A32D2D]">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="h-4 w-4 text-[#E24B4A]" />
              <span className="text-[10px] text-muted-foreground label-uppercase">Contas Fixas</span>
            </div>
            <p className="text-lg font-semibold text-[#E24B4A] tabular-nums">
              {formatarMoeda(metodologia.contasFixas)}
            </p>
          </div>
          
          {/* Para Gastar */}
          <div className="p-3 rounded-lg bg-secondary/50 border-l-2 border-[#D4A017]">
            <div className="flex items-center gap-2 mb-1">
              <PiggyBank className="h-4 w-4 text-[#F59E0B]" />
              <span className="text-[10px] text-muted-foreground label-uppercase">Para Gastar</span>
            </div>
            <p className="text-lg font-semibold text-[#F59E0B] tabular-nums">
              {formatarMoeda(metodologia.totalGastosVariaveis)}
            </p>
          </div>
        </div>
        
        {/* Divisor visual */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-[10px] text-muted-foreground label-uppercase">
            Dividido em {metodologia.semanas.length} semanas
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        
        {/* Cards de semanas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metodologia.semanas.map((semana) => (
            <SemanaCard
              key={semana.numero}
              semana={semana}
              isAtual={semana.numero === metodologia.semanaAtual}
            />
          ))}
        </div>
        
        {/* Saldo livre acumulado */}
        {metodologia.saldoLivre !== 0 && (
          <div className={cn(
            'p-4 rounded-lg border',
            metodologia.saldoLivre > 0 
              ? 'bg-[#3B6D11]/10 border-[#3B6D11]/30'
              : 'bg-[#A32D2D]/10 border-[#A32D2D]/30'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground label-uppercase">
                  {metodologia.saldoLivre > 0 ? 'Saldo Livre Acumulado' : 'Déficit Acumulado'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {metodologia.saldoLivre > 0 
                    ? 'Sobra das semanas anteriores que pode ser usada ou poupada'
                    : 'Você gastou mais do que o orçamento permitia'}
                </p>
              </div>
              <p className={cn(
                'text-2xl font-semibold tabular-nums',
                metodologia.saldoLivre > 0 ? 'text-[#4ADE80]' : 'text-[#E24B4A]'
              )}>
                {formatarMoeda(Math.abs(metodologia.saldoLivre))}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
