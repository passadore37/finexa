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
  ArrowRight,
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
  
  let corBarra = '#37cc94'; 
  if (semana.percentualGasto > 80 && semana.percentualGasto <= 100) corBarra = '#EF9F27';
  if (excedeu) corBarra = '#ff64ca';
  if (semana.status === 'futuro') corBarra = '#08080f/10';

  return (
    <div
      className={cn(
        'relative p-6 rounded-[2rem] border transition-all duration-500 overflow-hidden',
        isAtual
          ? 'border-[#5330ff]/20 bg-white shadow-xl shadow-[#5330ff]/5 scale-[1.02] z-10'
          : 'border-black/5 bg-black/[0.02]',
        semana.status === 'futuro' && 'opacity-60'
      )}
    >
      {isAtual && (
        <div className="absolute top-0 right-0 h-1 w-20 bg-[#5330ff] rounded-bl-xl shadow-[0_0_12px_rgba(83,48,255,0.3)]" />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <span className="text-xl font-black text-[#08080f] tracking-tighter">Semana {semana.numero}</span>
             {isAtual && <span className="text-[8px] font-black uppercase tracking-widest bg-[#5330ff] text-white px-3 py-1 rounded-full">Atual</span>}
          </div>
          <p className="text-[10px] font-bold text-[#08080f]/30 uppercase tracking-[0.1em]">{formatarData(semana.inicio)} — {formatarData(semana.fim)}</p>
        </div>
        <div className={`p-2 rounded-xl ${isAtual ? 'bg-[#5330ff]/10' : 'bg-black/5'}`}>
          {semana.status === 'passado' && <CheckCircle2 className="h-4 w-4 text-[#37cc94]" />}
          {semana.status === 'atual' && <Clock className="h-4 w-4 text-[#5330ff] animate-pulse" />}
          {semana.status === 'futuro' && <CalendarDays className="h-4 w-4 text-[#08080f]/20" />}
        </div>
      </div>
      
      {/* Valores */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-2xl bg-white/50 border border-black/[0.03]">
          <p className="text-[9px] font-black text-[#08080f]/20 uppercase tracking-widest mb-1">Gasto</p>
          <p className={cn(
            'text-2xl font-black tabular-nums tracking-tighter',
            excedeu ? 'text-[#ff64ca]' : 'text-[#08080f]'
          )}>
            {formatarMoeda(semana.gasto)}
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-white/50 border border-black/[0.03]">
          <p className="text-[9px] font-black text-[#08080f]/20 uppercase tracking-widest mb-1">Disponível</p>
          <p className={cn(
            'text-2xl font-black tabular-nums tracking-tighter',
            semana.disponivel < 0 ? 'text-[#ff64ca]' : 'text-[#37cc94]'
          )}>
            {formatarMoeda(semana.disponivel)}
          </p>
        </div>
      </div>
      
      {/* Barra de progresso premium */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
           <p className="text-[10px] font-black text-[#08080f]/40 uppercase tracking-widest leading-none">Status do Envelope</p>
           <p className="text-sm font-black text-[#08080f] tracking-tighter leading-none">{semana.percentualGasto.toFixed(0)}%</p>
        </div>
        <div className="h-4 rounded-full bg-black/5 p-1 flex">
          <div
            className="h-full rounded-full transition-all duration-1000 shadow-sm"
            style={{
              width: `${percentual}%`,
              backgroundColor: corBarra,
            }}
          />
        </div>
      </div>
      
      {excedeu && (
        <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#ff64ca]/10 border border-[#ff64ca]/10 animate-in slide-in-from-top-2 duration-500">
           <AlertTriangle className="h-3 w-3 text-[#ff64ca]" />
           <p className="text-[10px] font-black text-[#ff64ca] uppercase tracking-widest">Excedido em {formatarMoeda(semana.gasto - semana.orcamento)}</p>
        </div>
      )}
    </div>
  );
}

export function OrcamentoSemanal({ metodologia }: OrcamentoSemanalProps) {
  return (
    <Card className="h-full flex flex-col w-full relative overflow-hidden group">
      <CardHeader className="pb-6 relative z-10 flex flex-row items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5330ff]/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-[#5330ff]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#08080f]/30 leading-none mb-1">Planejamento</p>
            <CardTitle className="text-2xl font-black text-[#08080f] tracking-tighter">Envelope Semanal</CardTitle>
          </div>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-black/[0.03] border border-black/[0.05]">
           <p className="text-[8px] font-black text-[#08080f]/40 uppercase tracking-[0.2em] mb-0.5">Metodologia</p>
           <p className="text-[11px] font-black text-[#08080f] tracking-tight">SALÁRIO — INV — FIXAS</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Resumo da metodologia boxes prêmio */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'SALÁRIO', val: metodologia.salarioMes, icon: Wallet, cor: '#5330ff' },
            { label: `INV (${metodologia.percentualInvestimento}%)`, val: metodologia.investimento, icon: TrendingUp, cor: '#37cc94' },
            { label: 'FIXAS', val: metodologia.contasFixas, icon: Receipt, cor: '#ff64ca' },
            { label: 'ENVELOPE', val: metodologia.totalGastosVariaveis, icon: PiggyBank, cor: '#EF9F27' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-3xl bg-white/40 border border-white/60 shadow-sm transition-all hover:bg-white hover:shadow-md group/box">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg transition-transform group-hover/box:scale-110" style={{ background: `${item.cor}10` }}>
                  <item.icon className="h-3 w-3" style={{ color: item.cor }} />
                </div>
                <span className="text-[9px] font-black text-[#08080f]/30 uppercase tracking-[0.15em]">{item.label}</span>
              </div>
              <p className="text-xl font-black text-[#08080f] tracking-tighter tabular-nums leading-none">
                {formatarMoeda(item.val)}
              </p>
            </div>
          ))}
        </div>
        
        {/* Divisor Visual Premium */}
        <div className="flex items-center gap-6 px-4">
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent" />
          <div className="flex items-center gap-2 text-[9px] font-black text-[#08080f]/20 uppercase tracking-[0.3em]">
             DISTRIBUÍDO EM {metodologia.semanas.length} SEMANAS
             <ArrowRight className="h-3 w-3 ml-1" />
          </div>
          <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-black/[0.05] to-transparent" />
        </div>
        
        {/* Cards de semanas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {metodologia.semanas.map((semana) => (
            <SemanaCard
              key={semana.numero}
              semana={semana}
              isAtual={semana.numero === metodologia.semanaAtual}
            />
          ))}
        </div>
        
        {/* Saldo livre acumulado luxo */}
        {metodologia.saldoLivre !== 0 && (
          <div className={cn(
            'p-8 rounded-[2.5rem] border relative overflow-hidden transition-all duration-700 hover:scale-[1.01]',
            metodologia.saldoLivre > 0 
              ? 'bg-[#37cc94]/5 border-[#37cc94]/20 shadow-xl shadow-[#37cc94]/5'
              : 'bg-[#ff64ca]/5 border-[#ff64ca]/20 shadow-xl shadow-[#ff64ca]/5'
          )}>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div className="space-y-2 max-w-md">
                <div className="flex items-center justify-center md:justify-start gap-3">
                   <div className={`p-2 rounded-xl ${metodologia.saldoLivre > 0 ? 'bg-[#37cc94]/20' : 'bg-[#ff64ca]/20'}`}>
                      <PiggyBank className={cn('h-5 w-5', metodologia.saldoLivre > 0 ? 'text-[#37cc94]' : 'text-[#ff64ca]')} />
                   </div>
                   <p className="text-[10px] font-black text-[#08080f]/40 uppercase tracking-[0.2em]">
                      {metodologia.saldoLivre > 0 ? 'Reserva Acumulada' : 'Ajuste Necessário'}
                   </p>
                </div>
                <p className="text-sm font-bold text-[#08080f]/60 leading-relaxed">
                  {metodologia.saldoLivre > 0 
                    ? 'Excelente! Você economizou nas semanas anteriores. Use este saldo com sabedoria ou guarde para o futuro.'
                    : 'Atenção! Seu gasto acumulado superou o planejamento. Tente economizar nas próximas semanas.'}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className={cn(
                  'text-5xl font-black tabular-nums tracking-tighter leading-none',
                  metodologia.saldoLivre > 0 ? 'text-[#37cc94]' : 'text-[#ff64ca]'
                )}>
                  {formatarMoeda(Math.abs(metodologia.saldoLivre))}
                </p>
                <p className="text-[9px] font-black text-[#08080f]/30 uppercase tracking-[0.2em] mt-3">SALDO ACUMULADO</p>
              </div>
            </div>
            {/* Efeito de fundo sutil */}
            <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2 pointer-events-none ${metodologia.saldoLivre > 0 ? 'bg-[#37cc94]' : 'bg-[#ff64ca]'}`} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
